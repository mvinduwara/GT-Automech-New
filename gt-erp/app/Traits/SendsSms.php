<?php

namespace App\Traits;

use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;
use NotifyLk\Api\SmsApi;

trait SendsSms
{
    /**
     * Send an SMS using the Notify.lk SDK.
     *
     * @param string $mobile The destination phone number.
     * @param string $message The text message.
     * @param string|null $sender_id The Sender ID (overrides default).
     * @return array
     */
    protected function sendSms(string $mobile, string $message, string $sender_id = null): array
    {
        $user_id   = Config::get('services.notifylk.user_id');
        $api_key   = Config::get('services.notifylk.api_key');
        $sender_id = $sender_id ?? Config::get('services.notifylk.sender_id');

        if (!$user_id || !$api_key || !$sender_id) {
            Log::error('Notify.lk SMS credentials are not set in config/services.php.');
            return ['status' => 'error', 'message' => 'SMS credentials not configured.'];
        }

        // === Use the new normalization function ===
        $cleaned_mobile = $this->normalizePhoneNumber($mobile);
        // =========================================

        try {
            $api_instance = new SmsApi();
            
            $api_instance->sendSMS(
                $user_id,       // user_id
                $api_key,       // api_key
                $message,       // message
                $cleaned_mobile,// to (use the cleaned variable)
                $sender_id,     // sender_id
                null,           // contact_fname
                null,           // contact_lname
                null,           // contact_email
                null,           // contact_address
                null,           // contact_group
                null            // type
            );

            $response = ['status' => 'success', 'message' => 'SMS queued successfully.'];
            Log::info('Notify.lk SMS Sent Successfully', ['to' => $cleaned_mobile, 'original' => $mobile, 'sender_id' => $sender_id]);
            return $response;

        } catch (\Exception $e) {
            Log::error('Notify.lk SMS Error', ['error' => $e->getMessage(), 'to' => $cleaned_mobile, 'original' => $mobile]);
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }

    /**
     * Normalizes a Sri Lankan phone number to 94XXXXXXXXX format.
     *
     * Handles: +9471XXXXXXX, 071XXXXXXX, 71XXXXXXX, 9471XXXXXXX
     *
     * @param string $mobile The input phone number.
     * @return string The normalized phone number.
     */
    private function normalizePhoneNumber(string $mobile): string
    {
        // 1. Remove all non-numeric characters (like '+')
        $number = preg_replace('/[^0-9]/', '', $mobile);

        // 2. Check if it's 10 digits and starts with 0 (e.g., 071XXXXXXX)
        if (strlen($number) === 10 && str_starts_with($number, '0')) {
            // Remove the leading 0 and prepend '94'
            return '94' . substr($number, 1);
        }

        // 3. Check if it's 9 digits (e.g., 71XXXXXXX)
        if (strlen($number) === 9 && str_starts_with($number, '7')) {
             // Prepend '94'
            return '94' . $number;
        }

        // 4. Check if it's 11 digits and starts with 94 (e.g., 9471XXXXXXX)
        // This is already the correct format, so we just return it.
        if (strlen($number) === 11 && str_starts_with($number, '94')) {
            return $number;
        }

        // If it's in a format we don't recognize (like the old +94... format),
        // we'll return the cleaned number. The '9471XXXXXXX' format is the most reliable.
        return $number;
    }
}