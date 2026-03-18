<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = ['key', 'value', 'type', 'group'];

    /**
     * Get a setting value by key.
     */
    public static function get($key, $default = null)
    {
        $setting = self::where('key', $key)->first();
        if (!$setting) return $default;

        switch ($setting->type) {
            case 'boolean': return filter_var($setting->value, FILTER_VALIDATE_BOOLEAN);
            case 'integer': return (int) $setting->value;
            case 'json': return json_decode($setting->value, true);
            default: return $setting->value;
        }
    }

    /**
     * Set a setting value by key.
     */
    public static function set($key, $value, $type = 'string', $group = 'general')
    {
        if (is_array($value) || is_object($value)) {
            $value = json_encode($value);
            $type = 'json';
        } elseif (is_bool($value)) {
            $value = $value ? '1' : '0';
            $type = 'boolean';
        } elseif (is_int($value)) {
            $type = 'integer';
        }

        return self::updateOrCreate(
            ['key' => $key],
            ['value' => $value, 'type' => $type, 'group' => $group]
        );
    }
}
