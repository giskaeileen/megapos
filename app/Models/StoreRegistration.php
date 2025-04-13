<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Kyslik\ColumnSortable\Sortable;

class StoreRegistration extends Model
{
    use HasFactory, Sortable;

    protected $fillable = [
        'store_name', 
        'slug', 
        'country', 
        'city', 
        'state', 
        'zip', 
        'street_address', 
        'owner_name', 
        'owner_email', 
        'owner_phone', 
        'status'
    ];

    public $sortable = [
        'store_name', 
        'store_address', 
        'owner_name', 
        'owner_email', 
        'owner_phone', 
        'status',
        'created_at'
    ];

    protected $guarded = [
        'id',
    ];

    // public function scopeFilter($query, array $filters)
    // {
    //     $query->when($filters['search'] ?? false, function ($query, $search) {
    //         return $query->where('store_name', 'like', '%' . $search . '%')->orWhere('store_address', 'like', '%' . $search . '%');
    //     });
    // }

    public function scopeFilter($query, array $filters)
    {
        foreach ($filters as $column => $value) {
            if ($value) {
                $query->when($column === 'search', function ($query) use ($value) {
                    return $query->where('store_name', 'like', "%{$value}%")
                        ->orWhere('owner_name', 'like', "%{$value}%");
                });

                if (in_array($column, [
                    'store_name', 
                    'owner_name', 
                    'owner_email', 
                    'status', 
                    'country', 
                    'city', 
                    'state'
                ])) {
                    $query->where($column, 'like', "%{$value}%");
                }
            }
        }
    }
}
