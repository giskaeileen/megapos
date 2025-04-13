<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class StoreApprovedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $store;
    public $user;
    public $password;

    /**
     * Create a new message instance.
     */
    public function __construct($store, $user, $password)
    {
        $this->store = $store;
        $this->user = $user;
        $this->password = $password;
    }
    // public function __construct()
    // {
    //     //
    // }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('Store Registration Approved')
            ->view('emails.store_approved')
            ->with([
                'storeName' => $this->store->name,
                'ownerName' => $this->user->name,
                'email' => $this->user->email,
                'password' => $this->password,
                'loginUrl' => url('/login'),
            ]);
    }
}
