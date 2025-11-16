<?php

namespace App\Http\Controllers;

use App\Traits\SendsSms;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class SmsTestController extends Controller
{
    use SendsSms;

    /**
     * Show a simple form to send a test SMS.
     */
    public function showTestForm()
    {
        // Display session messages and the form
        $success = session('success') ? '<p style="color:green;">' . htmlspecialchars(session('success')) . '</p>' : '';
        $error = session('error') ? '<p style="color:red;">' . htmlspecialchars(session('error')) . '</p>' : '';
        
        return '<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Test SMS</title>
            <style>body { font-family: sans-serif; margin: 2rem; } input, button { font-size: 1rem; padding: 0.5rem; } </style>
        </head>
        <body>
            <h2>Send Test SMS</h2>
            ' . $success . '
            ' . $error . '
            <form action="' . route('sms.test.send') . '" method="POST">
                <input type="hidden" name="_token" value="' . csrf_token() . '">
                <div>
                    <label>Phone (e.g., 071..., 71..., +9471...): <br>
                        <input type="text" name="phone" placeholder="0712345678" required>
                    </label>
                </div>
                <br>
                <div>
                    <label>Message: <br>
                        <input type="text" name="message" value="This is a test message from GT AutoMech." required>
                    </label>
                </div>
                <br>
                <button type="submit">Send Test SMS</button>
            </form>
        </body>
        </html>';
    }

    /**
     * Handle the submission and send the test SMS.
     */
    public function sendTest(Request $request)
    {
        $validator = Validator::make($request->all(), [
            // Loosened validation since the trait will normalize it
            'phone' => 'required|string|min:9|max:12', 
            'message' => 'required|string|max:320',
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->with('error', 'Validation failed.');
        }

        $phone = $request->input('phone');
        $message = $request->input('message');

        Log::info('Attempting to send test SMS', ['phone' => $phone]);

        // Call the trait's sendSms method.
        // The phone number will be automatically normalized inside the trait.
        $response = $this->sendSms($phone, $message);

        if ($response['status'] === 'success') {
            return back()->with('success', 'Test SMS sent successfully! Response: ' . $response['message']);
        } else {
            return back()->with('error', 'Failed to send SMS. Response: ' . $response['message']);
        }
    }
}