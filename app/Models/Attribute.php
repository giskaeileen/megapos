<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Kyslik\ColumnSortable\Sortable;

class Attribute extends Model
{
    use HasFactory, Sortable;

    protected $fillable = [
        'name',
        'store_id',
    ];

    public $sortable = [
        'name',
        'created_at',
    ];

    protected $guarded = [
        'id',
    ];

    // public function scopeFilter($query, array $filters)
    // {
    //     $query->when($filters['search'] ?? false, function ($query, $search) {
    //         return $query->where('name', 'like', '%' . $search . '%');
    //     });
    // }

    public function scopeFilter($query, array $filters)
    {
        foreach ($filters as $column => $value) {
            if ($value) {
                if ($column === 'search') {
                    $query->where(function ($query) use ($value) {
                        $query->where('name', 'like', "%{$value}%");
                    });
                } 

                if (in_array($column, [
                    'name', 
                    // 'value'
                ])) {
                    $query->where($column, 'like', "%{$value}%");
                } 
            }
        }
    }

    public function values()
    {
        return $this->hasMany(AttributeValue::class);
    }
}
