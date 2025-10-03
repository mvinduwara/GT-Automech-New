<?php

namespace App\Http\Controllers\PettyCash;

use App\Http\Controllers\Controller;
use App\Models\PettyCashItem;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class PettyCashItemController extends Controller
{
    public function updateCheckedStatus(Request $request, PettyCashItem $item)
    {
        try {
            // Log the request for debugging
            Log::info('Update checked status request', [
                'item_id' => $item->id,
                'request_data' => $request->all()
            ]);

            $validated = $request->validate([
                'checked' => 'required|boolean',
            ]);

            $item->checked = $validated['checked'];
            $item->save();

            Log::info('Item updated successfully', [
                'item_id' => $item->id,
                'new_checked_status' => $item->checked
            ]);

            // Return an Inertia-compatible response
            return back()->with([
                'success' => true,
                'updatedItem' => $item->fresh(), // Return the refreshed item
                'message' => 'Status updated successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update item checked status', [
                'item_id' => $item->id ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->withErrors([
                'error' => 'Failed to update: ' . $e->getMessage()
            ]);
        }
    }
}
