<?php

namespace App\Models;

use Kyslik\ColumnSortable\Sortable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Product extends Model
{
    use HasFactory, Sortable;

    protected $fillable = [
        'product_name',
        'category_id',
        'supplier_id',
        'unit',
        'product_image',
        'store_id',
        'description',
        'discount_normal',
        'discount_member',
    ];

    public $sortable = [
        'product_name',
        'selling_price',
        'created_at',
    ];

    protected $guarded = [
        'id',
    ];

    protected $with = [
        'category',
        'supplier'
    ];

    public function category(){
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function supplier(){
        return $this->belongsTo(Supplier::class, 'supplier_id');
    }

    // public function scopeFilter($query, array $filters)
    // {
    //     $query->when($filters['search'] ?? false, function ($query, $search) {
    //         return $query->where('product_name', 'like', '%' . $search . '%');
    //     });
    // }

    public function scopeFilter($query, array $filters)
    {
        foreach ($filters as $column => $value) {
            if ($value) {
                if ($column === 'search') {
                    $query->where(function ($query) use ($value) {
                        $query->where('product_name', 'like', "%{$value}%")
                            ->orWhereHas('category', function ($query) use ($value) { // Filter dari relasi user
                                $query->where('name', 'like', "%{$value}%");
                            })
                            ->orWhereHas('supplier', function ($query) use ($value) { // Filter dari relasi user
                                $query->where('name', 'like', "%{$value}%");
                            });
                    });
                } 

                if (in_array($column, [
                    'product_name', 
                ])) {
                    $query->where($column, 'like', "%{$value}%");
                } 
                
                if (in_array($column, [
                    'category', 
                ])) { 
                    $query->whereHas('category', function ($query) use ($column, $value) {
                        $query->where('name', 'like', "%{$value}%");
                    });
                }

                if (in_array($column, [
                    'supplier', 
                ])) { 
                    $query->whereHas('supplier', function ($query) use ($column, $value) {
                        $query->where('name', 'like', "%{$value}%");
                    });
                }
            }
        }
    }

    public function attributes()
    {
        return $this->belongsToMany(AttributeValue::class, 'product_attributes', 'product_id', 'attribute_value_id');
    }

    public function productVariants()
    {
        return $this->hasMany(ProductVariant::class);
    }
}
