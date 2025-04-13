<?php

namespace App\Models;

use Kyslik\ColumnSortable\Sortable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Supplier extends Model
{
    use HasFactory, Sortable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'address',
        'shopname',
        'photo',
        'type',
        'account_holder',
        'account_number',
        'bank_name',
        'bank_branch',
        'city',
        'store_id'
    ];

    public $sortable = [
        'name',
        'email',
        'phone',
        'address',
        'shopname',
        'type',
        'account_holder',
        'account_number',
        'bank_name',
        'bank_branch',
        'city',
        'created_at',
    ];

    protected $guarded = [
        'id',
    ];

    // public function scopeFilter($query, array $filters)
    // {
    //     $query->when($filters['search'] ?? false, function ($query, $search) {
    //         return $query->where('name', 'like', '%' . $search . '%')->orWhere('shopname', 'like', '%' . $search . '%');
    //     });
    // }

    public function scopeFilter($query, array $filters)
    {
        foreach ($filters as $column => $value) {
            if ($value) {
                if ($column === 'search') {
                    $query->where(function ($query) use ($value) {
                        $query->where('name', 'like', "%{$value}%")
                            ->orWhere('email', 'like', "%{$value}%")
                            ->orWhere('phone', 'like', "%{$value}%")
                            ->orWhere('address', 'like', "%{$value}%")
                            ->orWhere('shopname', 'like', "%{$value}%")
                            ->orWhere('type', 'like', "%{$value}%")
                            ->orWhere('account_holder', 'like', "%{$value}%")
                            ->orWhere('account_number', 'like', "%{$value}%")
                            ->orWhere('bank_name', 'like', "%{$value}%")
                            ->orWhere('bank_name', 'like', "%{$value}%")
                            ->orWhere('bank_name', 'like', "%{$value}%")
                            ->orWhere('bank_name', 'like', "%{$value}%")
                            ->orWhere('type', 'like', "%{$value}%");
                    });
                } 

                if (in_array($column, [
                    'name', 
                    'email', 
                    'phone', 
                    'address', 
                    'shopname', 
                    'type', 
                    'account_holder', 
                    'account_number', 
                    'bank_name', 
                    'bank_branch', 
                    'city'
                ])) {
                    $query->where($column, 'like', "%{$value}%");
                } 
            }
        }
    }
}
