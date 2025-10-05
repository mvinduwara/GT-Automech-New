<?php

namespace App\Http\Controllers\JobCard;

use App\Http\Controllers\Controller;
use App\Models\JobCard;
use App\Models\JobCardProducts;
use App\Models\Stock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class JobCardProductsController extends Controller
{
    /**
     * Search products by part number
     */
    public function search(Request $request)
    {
        try {
            $validated = $request->validate([
                'search' => 'required|string|min:1',
            ]);

            $stocks = Stock::with(['product', 'alternativeProduct'])
                ->whereHas('product', function ($query) use ($validated) {
                    $query->where('part_number', 'like', "%{$validated['search']}%")
                        ->orWhere('name', 'like', "%{$validated['search']}%");
                })
                ->where('status', 'active')
                ->where('quantity', '>', 0)
                ->limit(20)
                ->get();

            Log::info('Product search completed', [
                'search_term' => $validated['search'],
                'results_count' => $stocks->count(),
            ]);

            return response()->json([
                'stocks' => $stocks,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to search products', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to search products',
            ], 500);
        }
    }

    /**
     * Store job card products
     */
    public function store(Request $request, JobCard $jobCard)
    {
        $validated = $request->validate([
            'products' => 'required|array|min:1',
            'products.*.stock_id' => 'required|exists:stocks,id',
            'products.*.quantity' => 'required|integer|min:1',
            'products.*.discount_type' => ['nullable', Rule::in(['percentage', 'amount'])],
            'products.*.discount_value' => 'nullable|numeric|min:0',
        ]);

        DB::beginTransaction();

        try {
            // Delete existing products for this job card and restore stock
            $existingProducts = $jobCard->jobCardProducts;
            foreach ($existingProducts as $existingProduct) {
                $this->restoreStock($existingProduct->stock_id, $existingProduct->quantity);
            }
            $jobCard->jobCardProducts()->delete();

            $createdProducts = [];

            foreach ($validated['products'] as $productData) {
                $stock = Stock::with('product')->findOrFail($productData['stock_id']);

                // Check if sufficient quantity available
                if ($stock->quantity < $productData['quantity']) {
                    DB::rollBack();
                    
                    Log::warning('Insufficient stock quantity', [
                        'stock_id' => $stock->id,
                        'available' => $stock->quantity,
                        'requested' => $productData['quantity'],
                    ]);

                    return redirect()->back()->with('error', 
                        "Insufficient stock for {$stock->product->name}. Available: {$stock->quantity}"
                    );
                }

                $unitPrice = $stock->selling_price;
                $quantity = $productData['quantity'];
                $discountType = $productData['discount_type'] ?? null;
                $discountValue = $productData['discount_value'] ?? 0;

                // Calculate totals
                $subtotal = $quantity * $unitPrice;
                $total = $subtotal;

                if ($discountType === 'percentage' && $discountValue > 0) {
                    $total = $subtotal - ($subtotal * $discountValue / 100);
                } elseif ($discountType === 'amount' && $discountValue > 0) {
                    $total = max(0, $subtotal - $discountValue);
                }

                // Create job card product
                $jobCardProduct = JobCardProducts::create([
                    'job_card_id' => $jobCard->id,
                    'stock_id' => $stock->id,
                    'user_id' => auth()->id(),
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'subtotal' => $subtotal,
                    'discount_type' => $discountType,
                    'discount_value' => $discountValue,
                    'total' => round($total, 2),
                ]);

                // Deduct stock quantity
                $this->deductStock($stock->id, $quantity);

                $createdProducts[] = $jobCardProduct;

                Log::info('Job card product created', [
                    'job_card_id' => $jobCard->id,
                    'product_id' => $jobCardProduct->id,
                    'stock_id' => $stock->id,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'total' => $total,
                ]);
            }

            DB::commit();

            Log::info('Job card products saved successfully', [
                'job_card_id' => $jobCard->id,
                'products_count' => count($createdProducts),
                'total_amount' => collect($createdProducts)->sum('total'),
            ]);

            return redirect()->back()->with('success', 'Products saved successfully');

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            
            Log::warning('Validation failed for job card products', [
                'job_card_id' => $jobCard->id,
                'errors' => $e->errors(),
            ]);

            return redirect()->back()
                ->withErrors($e->errors())
                ->withInput();

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Failed to save job card products', [
                'job_card_id' => $jobCard->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()->back()
                ->with('error', 'Failed to save products. Please try again.')
                ->withInput();
        }
    }

    /**
     * Delete a specific job card product
     */
    public function destroy(JobCard $jobCard, JobCardProducts $product)
    {
        DB::beginTransaction();

        try {
            // Verify the product belongs to this job card
            if ($product->job_card_id !== $jobCard->id) {
                Log::warning('Attempted to delete product from wrong job card', [
                    'job_card_id' => $jobCard->id,
                    'product_job_card_id' => $product->job_card_id,
                    'product_id' => $product->id,
                ]);

                return redirect()->back()->with('error', 'Invalid product deletion request');
            }

            // Restore stock quantity
            $this->restoreStock($product->stock_id, $product->quantity);

            $productId = $product->id;
            $product->delete();

            DB::commit();

            Log::info('Job card product deleted successfully', [
                'job_card_id' => $jobCard->id,
                'product_id' => $productId,
                'stock_restored' => $product->quantity,
            ]);

            return redirect()->back()->with('success', 'Product removed successfully');

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Failed to delete job card product', [
                'job_card_id' => $jobCard->id,
                'product_id' => $product->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()->back()->with('error', 'Failed to remove product. Please try again.');
        }
    }

    /**
     * Deduct quantity from stock
     */
    private function deductStock(int $stockId, int $quantity): void
    {
        $stock = Stock::findOrFail($stockId);
        $oldQuantity = $stock->quantity;
        $stock->decrement('quantity', $quantity);

        Log::info('Stock quantity deducted', [
            'stock_id' => $stockId,
            'old_quantity' => $oldQuantity,
            'deducted' => $quantity,
            'new_quantity' => $stock->fresh()->quantity,
        ]);
    }

    /**
     * Restore quantity to stock
     */
    private function restoreStock(int $stockId, int $quantity): void
    {
        $stock = Stock::findOrFail($stockId);
        $oldQuantity = $stock->quantity;
        $stock->increment('quantity', $quantity);

        Log::info('Stock quantity restored', [
            'stock_id' => $stockId,
            'old_quantity' => $oldQuantity,
            'restored' => $quantity,
            'new_quantity' => $stock->fresh()->quantity,
        ]);
    }
}