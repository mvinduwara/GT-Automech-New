<?php

namespace Database\Factories;

use App\Models\Customer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Customer>
 */
class CustomerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $titles = ['Mr', 'Mrs', 'Ms', 'Ven', 'Dr', 'Prof'];

        $sriLankanFirstNames = [
            'Nimal', 'Kamal', 'Sunil', 'Rajitha', 'Pradeep', 'Chaminda', 'Sampath', 'Nuwan', 'Ruwan', 'Dinuka', 'Amal', 'Mahesh', 'Suresh', 'Kumara', 'Kasun',
            'Nadeesha', 'Nirosha', 'Priyanka', 'Dilani', 'Samadhi', 'Gayani', 'Anusha', 'Sanduni', 'Upeksha', 'Lakshmi', 'Nalini', 'Padmini', 'Manjula', 'Renuka', 'Nisha'
        ];

        $sriLankanLastNames = [
            'Perera', 'Silva', 'Fonseka', 'Bandara', 'Ranasinghe', 'Wickramasinghe', 'Jayawardena', 'Fernando', 'De Zoysa', 'Mendis', 'Gunawardena', 'Kumarasinghe', 'Ariyaratne', 'Premaratne', 'Lakshan',
            'Rajapaksha', 'Rathnayake', 'Seneviratne', 'Wijesinghe', 'Weerasinghe', 'Samarasinghe', 'Abeywickrama', 'Hewage', 'Gamage', 'Pathirana'
        ];

        $sriLankanCities = [
            'Colombo', 'Kandy', 'Galle', 'Jaffna', 'Matara', 'Kurunegala', 'Anuradhapura', 'Polonnaruwa', 'Negombo', 'Batticaloa', 'Trincomalee', 'Kalutara', 'Badulla', 'Ratnapura', 'Nuwara Eliya'
        ];
        
        $fullName = $this->faker->randomElement($sriLankanFirstNames) . ' ' . $this->faker->randomElement($sriLankanLastNames);

        $sriLankanMobile = '07' . $this->faker->unique()->numberBetween(10000000, 99999999);

        $sriLankanAddress = $this->faker->buildingNumber() . ', ' . $this->faker->streetName() . ' ' . $this->faker->randomElement(['Road', 'Mawatha', 'Lane', 'Place']) . ', ' . $this->faker->randomElement($sriLankanCities);

        return [
            'title' => $this->faker->randomElement($titles),
            'name' => $fullName,
            'mobile' => $sriLankanMobile,
            'address' => $sriLankanAddress,
        ];
    }
}
