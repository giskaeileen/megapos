<?php

namespace App\Providers;

use Illuminate\Pagination\Paginator;
use Illuminate\Support\ServiceProvider;
use App\Models\Setting;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Schema;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Paginator::useBootstrapFive();

        if (Schema::hasTable('settings')) {
            $mailConfig = [
                'driver'     => Setting::get('mail_mailer', 'smtp'),
                'host'       => Setting::get('mail_host', 'smtp.gmail.com'),
                'port'       => Setting::get('mail_port', '587'),
                'username'   => Setting::get('mail_username'),
                'password'   => Setting::get('mail_password'),
                'encryption' => Setting::get('mail_encryption', 'tls'),
                'from'       => [
                    'address' => Setting::get('mail_from_address', 'default@example.com'),
                    'name'    => Setting::get('mail_from_name', 'MyApp'),
                ],
            ];

            Config::set('mail', $mailConfig);
        }
    }
}
