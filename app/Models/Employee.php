<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use Kyslik\ColumnSortable\Sortable;

class Employee extends Model
{
    use HasFactory, Sortable;

    protected $fillable = [
        'phone',
        'address',
        'experience',
        'photo',
        'salary',
        'vacation',
        'city',
        'user_id',
        'store_id',
    ];

    public $sortable = [
        'name',
        'email',
        'address',
        'experience',
        'salary',
        'vacation',
        'city',
        'created_at'
    ];

    protected $guarded = [
        'id'
    ];

    public function scopeSortable($query)
    {
        if (request()->has('sort')) {
            $sortColumn = request('sort');
            $sortDirection = request('direction', 'asc'); // Default ke ASC jika tidak ada

            if (in_array($sortColumn, ['name', 'email'])) {
                return $query
                    ->select('employees.*')
                    ->join('users', 'users.id', '=', 'employees.user_id')
                    ->orderBy("users.$sortColumn", $sortDirection);
            }

            return $query->orderBy($sortColumn, $sortDirection);
        }
        return $query;
    }

    public function scopeFilter($query, array $filters)
    {
        foreach ($filters as $column => $value) {
            if ($value) {
                if ($column === 'search') {
                    $query->where(function ($query) use ($value) {
                        $query->where('phone', 'like', "%{$value}%")
                            ->orWhere('address', 'like', "%{$value}%")
                            ->orWhere('experience', 'like', "%{$value}%")
                            ->orWhere('salary', 'like', "%{$value}%")
                            ->orWhere('vacation', 'like', "%{$value}%")
                            ->orWhere('city', 'like', "%{$value}%")
                            ->orWhereHas('user', function ($query) use ($value) { // Filter dari relasi user
                                $query->where('name', 'like', "%{$value}%")
                                    ->orWhere('email', 'like', "%{$value}%");
                            });
                    });
                } 

                if (in_array($column, [
                    'address', 
                    'experience', 
                    'salary', 
                    'vacation', 
                    'city'
                ])) {
                    $query->where($column, 'like', "%{$value}%");
                } 
                
                if (in_array($column, [
                    'name', 
                    'email'
                ])) { // Tambahkan filter name & email
                    $query->whereHas('user', function ($query) use ($column, $value) {
                        $query->where($column, 'like', "%{$value}%");
                    });
                }
            }
        }
    }

    public function advance_salaries()
    {
        return $this->hasMany(AdvanceSalary::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function store()
    {
        return $this->belongsTo(Store::class);
    }
}
