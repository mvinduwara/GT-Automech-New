<?php

namespace Database\Factories;

use App\Models\Supplier;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Supplier>
 */
class SupplierFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Supplier::class;

    /**
     * Define the model's default state with Sri Lankan data.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $status = $this->faker->randomElement(['active', 'deactive']);
        $closeDate = null;

        if ($status === 'deactive') {
            $closeDate = $this->faker->dateTimeBetween('-5 years', 'now')->format('Y-m-d');
        }

        // List of common Sri Lankan names and cities
        $sriLankanNames = [
            'Nimal Perera', 'Kamal Fernando', 'Sumithra Jayasinghe', 'Dilshan Silva',
            'Saman Gunawardena', 'Anusha De Silva', 'Priyantha Ranasinghe',
            'Manjula Rajapaksha', 'Tharindu Wijesinghe', 'Lakshika Dias'
        ];

        $sriLankanCities = [
            'Colombo', 'Kandy', 'Galle', 'Jaffna', 'Negombo', 'Anuradhapura',
            'Polonnaruwa', 'Kurunegala', 'Ratnapura', 'Matara'
        ];

        // Generate a valid Sri Lankan mobile number (e.g., 077-xxxxxxx)
        $mobileNumber = '07' . $this->faker->randomElement([1, 2, 5, 6, 7, 8]) . $this->faker->unique()->numberBetween(1000000, 9999999);

        return [
            'name' => $this->faker->randomElement($sriLankanNames),
            'email' => $this->faker->unique()->safeEmail(),
            'mobile' => $mobileNumber,
            'address' => $this->faker->streetAddress() . ', ' . $this->faker->randomElement($sriLankanCities),
            'register_date' => $this->faker->dateTimeBetween('-10 years', '-1 year')->format('Y-m-d'),
            'close_date' => $closeDate,
            'status' => $status,
        ];
    }
}
