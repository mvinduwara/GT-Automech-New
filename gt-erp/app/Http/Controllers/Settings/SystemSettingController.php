<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SystemSettingController extends Controller
{
    public function index()
    {
        $accounts = Account::orderBy('name')->get();
        
        $settings = [
            'default_petty_cash_account_id' => Setting::get('default_petty_cash_account_id'),
            'default_cash_account_id' => Setting::get('default_cash_account_id'),
            'default_petty_cash_expense_account_id' => Setting::get('default_petty_cash_expense_account_id'),
            'petty_cash_imprest_limit' => Setting::get('petty_cash_imprest_limit', 0),
        ];

        return Inertia::render('settings/system', [
            'accounts' => $accounts,
            'settings' => $settings,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'default_petty_cash_account_id' => 'nullable|exists:accounts,id',
            'default_cash_account_id' => 'nullable|exists:accounts,id',
            'default_petty_cash_expense_account_id' => 'nullable|exists:accounts,id',
            'petty_cash_imprest_limit' => 'nullable|numeric|min:0',
        ]);

        foreach ($validated as $key => $value) {
            $type = ($key === 'petty_cash_imprest_limit') ? 'numeric' : 'integer';
            Setting::set($key, $value, $type, 'finance');
        }

        return redirect()->back()->with('success', 'System settings updated successfully.');
    }
}
