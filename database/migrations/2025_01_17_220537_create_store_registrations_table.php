<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('store_registrations', function (Blueprint $table) {
            $table->id();
            $table->string('slug');
            $table->string('store_name');
            $table->string('country');
            $table->string('city');
            $table->string('state');
            $table->string('zip');
            $table->string('street_address');
            $table->string('owner_name');
            $table->string('owner_email');
            $table->string('owner_phone');
            $table->string('status')->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('store_registrations');
    }
};
