<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Kyslik\ColumnSortable\Sortable;

class Member extends Model
{
    use HasFactory, Sortable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'address',
        'photo',
        'city',
        'store_id',
    ];
    
    public $sortable = [
        'name',
        'email',
        'phone',
        'address',
        'city',
        'created_at',
    ];

    protected $guarded = [
        'id',
    ];

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
                            ->orWhere('city', 'like', "%{$value}%");
                    });
                } 

                if (in_array($column, [
                    'name', 
                    'email', 
                    'phone', 
                    'address', 
                    'city'
                ])) {
                    $query->where($column, 'like', "%{$value}%");
                } 
            }
        }
    }
}
