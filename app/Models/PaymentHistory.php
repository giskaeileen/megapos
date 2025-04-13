<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Kyslik\ColumnSortable\Sortable;

class PaymentHistory extends Model
{
    use HasFactory, Sortable;

    protected $fillable = [
        'user_id',
        'order_id',
        'amount',
        'status',
        'payment_method',
        'transaction_id',
        'quota_details',
        'transaction_time'
    ];

    protected $casts = [
        'quota_details' => 'array',
        'transaction_time' => 'datetime'
    ];

    public $sortable = [
        'order_id',
        'amount',
        'status',
        'payment_method',
        'transaction_id',
        'quota_details',
        'transaction_time'
    ];

    protected $guarded = [
        'id'
    ];

   public function scopeSortable($query)
    {
        if (request()->has('sort')) {
            $sortColumn = request('sort');
            $sortDirection = request('direction', 'asc'); 

            return $query->orderBy($sortColumn, $sortDirection);
        }
        return $query;
    }

    public function scopeFilter($query, array $filters)
    {
        foreach ($filters as $column => $value) {
            if ($value) {
                if ($column === 'search') {
                    $query->where(function ($query) use ($value) {
                        $query->where('order_id', 'like', "%{$value}%")
                            ->orWhere('amount', 'like', "%{$value}%")
                            ->orWhere('status', 'like', "%{$value}%")
                            ->orWhere('payment_method', 'like', "%{$value}%")
                            ->orWhere('transaction_id', 'like', "%{$value}%")
                            ->orWhere('quota_details', 'like', "%{$value}%")
                            ->orWhere('transaction_time', 'like', "%{$value}%");
                    });
                } 

                if (in_array($column, [
                    'order_id', 
                    'amount', 
                    'status', 
                    'payment_method', 
                    'transaction_id',
                    'quota_details',
                    'transaction_time',
                ])) {
                    $query->where($column, 'like', "%{$value}%");
                } 
            }
        }
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}