<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Kyslik\ColumnSortable\Sortable;

class Store extends Model
{
    use HasFactory, Sortable;

    protected $fillable = [
        'photo',
        'name',
        'slug',
        'country',
        'state',
        'city',
        'zip',
        'address',
        'user_id'
    ];

    public $sortable = [
        'name',
        'country',
        'state',
        'city',
        'zip',
        'address',
        'created_at',
    ];

    protected $guarded = [
        'id',
    ];

    // public function scopeFilter($query, array $filters)
    // {
    //     $query->when($filters['search'] ?? false, function ($query, $search) {
    //         return $query->where('name', 'like', '%' . $search . '%')->orWhere('address', 'like', '%' . $search . '%');
    //     });
    // }

    public function scopeFilter($query, array $filters)
    {
        foreach ($filters as $column => $value) {
            if ($value) {
                $query->when($column == 'search', function ($query) use ($value) {
                    return $query->where('name', 'like', "%{$value}%")
                        ->orWhere('country', 'like', "%{$value}%")
                        ->orWhere('state', 'like', "%{$value}%")
                        ->orWhere('city', 'like', "%{$value}%")
                        ->orWhere('zip', 'like', "%{$value}%")
                        ->orWhere('address', 'like', "%{$value}%");
                });

                if (in_array($column, [
                    'name',
                    'country',
                    'state',
                    'city',
                    'zip',
                    'address'
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

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function employees()
    {
        return $this->hasMany(Employee::class);
    }
}
