<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductVariant extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'product_id',
        'sku',
        'price',
        'sale_price',
        'quantity',
        'product_image'
    ];

    public function productAttributes()
    {
        return $this->hasMany(ProductAttribute::class);
    }
    
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
