<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Kyslik\ColumnSortable\Sortable;

class Permission extends Model
{
    use HasFactory, Sortable;

    protected $fillable = [
        'name',
        'guard_name',
    ];
    public $sortable = [
        'name',
        'guard_name',
        'created_at',
    ];

    protected $guarded = [
        'id',
    ];

    public function scopeFilter($query, array $filters)
    {
        $query->when($filters['search'] ?? false, function ($query, $search) {
            return $query
                ->where('name', 'like', '%' . $search . '%');
        });
    }
}
