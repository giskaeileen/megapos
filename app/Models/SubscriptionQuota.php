<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubscriptionQuota extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'quota_transactions',
        'quota_products',
        'quota_employees',
        'quota_stores',
        'start_date',
        'end_date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
