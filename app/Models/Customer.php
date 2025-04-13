<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use Kyslik\ColumnSortable\Sortable;

class Customer extends Model
{
    use HasFactory, Sortable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'address',
        'shopname',
        'photo',
        'account_holder',
        'account_number',
        'bank_name',
        'bank_branch',
        'city',
        'store_id',
    ];
    
    public $sortable = [
        'name',
        'email',
        'phone',
        'shopname',
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
                            ->orWhere('shopname', 'like', "%{$value}%")
                            ->orWhere('city', 'like', "%{$value}%");
                    });
                } 

                if (in_array($column, [
                    'name', 
                    'email', 
                    'phone', 
                    'shopname', 
                    'city'
                ])) {
                    $query->where($column, 'like', "%{$value}%");
                } 
            }
        }
    }
}
