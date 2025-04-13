<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuotaSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'quota_transactions', // 1000
        'quota_products', // 500
        'quota_employees', // 5000
        'quota_stores', //  50.000
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
