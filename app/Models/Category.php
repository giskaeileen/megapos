<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Kyslik\ColumnSortable\Sortable;

class Category extends Model
{
    use HasFactory, Sortable;

    protected $fillable = [
        'name',
        'slug',
        'store_id',
    ];

    protected $sortable = [
        'name',
        'slug',
        'created_at',
    ];

    protected $guarded = [
        'id',
    ];

    // public function scopeFilter($query, array $filters)
    // {
    //     $query->when($filters['search'] ?? false, function ($query, $search) {
    //     return $query->where(function ($query) use ($search) {
    //         $query->where('name', 'like', '%' . $search . '%')
    //         ->orWhere('slug', 'like', '%' . $search . '%');
    //     });
    //     });
    // }

    public function scopeFilter($query, array $filters)
    {
        foreach ($filters as $column => $value) {
            if ($value) {
                if ($column === 'search') {
                    $query->where(function ($query) use ($value) {
                        $query->where('name', 'like', "%{$value}%")
                            ->orWhere('slug', 'like', "%{$value}%");
                    });
                } 

                if (in_array($column, [
                    'name', 
                    'slug'
                ])) {
                    $query->where($column, 'like', "%{$value}%");
                } 
            }
        }
    }


    public function getRouteKeyName()
    {
        return 'slug';
    }
}
