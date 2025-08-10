<?php

namespace Database\Factories;

use App\Models\Employee;
use App\Models\Department;
use Illuminate\Database\Eloquent\Factories\Factory;

class EmployeeFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Employee::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $jobTitles = [
            'Lead Mechanic',
            'Auto Electrician',
            'AC Technician',
            'Service Advisor',
            'Junior Mechanic',
            'Diagnostic Specialist',
            'Parts Manager',
            'Workshop Supervisor'
        ];

        return [
            'first_name' => $this->faker->firstName(),
            'last_name' => $this->faker->lastName(),
            'email' => $this->faker->unique()->safeEmail(),
            'mobile' => $this->faker->unique()->phoneNumber(),
            'hire_date' => $this->faker->date(),
            'job_title' => $this->faker->randomElement($jobTitles),
            'department_id' => Department::inRandomOrder()->first()->id, // Ensure departments exist
            'status' => $this->faker->randomElement(['active', 'deactive', 'pending', 'terminated']),
        ];
    }
}
