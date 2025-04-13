<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Plan::create([
            'title' => 'Basic Monthly',
            'slug' => 'basic-monthly',
            'stripe_id' => 'price_1QlQVoRrB8iDvyOWuTTSlPHg'
        ]);

        Plan::create([
            'title' => 'Basic Yearly',
            'slug' => 'basic-yearly',
            'stripe_id' => 'price_1QlQa5RrB8iDvyOWuao68DmU'
        ]);

        Plan::create([
            'title' => 'Medium Monthly',
            'slug' => 'medium-monthly',
            'stripe_id' => 'price_1QlQW9RrB8iDvyOWTMAGlANv'
        ]);

        Plan::create([
            'title' => 'Medium Yearly',
            'slug' => 'medium-yearly',
            'stripe_id' => 'price_1QlQaqRrB8iDvyOWuaCRFZ13'
        ]);

        Plan::create([
            'title' => 'Pro Monthly',
            'slug' => 'pro-monthly',
            'stripe_id' => 'price_1QlQWURrB8iDvyOWb7GU5hUq'
        ]);

        Plan::create([
            'title' => 'Pro Yearly',
            'slug' => 'pro-yearly',
            'stripe_id' => 'price_1QlQbJRrB8iDvyOWWkC4QIpW'
        ]);
    }
}
