<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Kyslik\ColumnSortable\Sortable;

class Order extends Model
{
    use HasFactory, Sortable;

    protected $fillable = [
        'customer_id',
        'order_date',
        'order_status',
        'total_products',
        'sub_total',
        'vat',
        'invoice_no',
        'total',
        'payment_status',
        'pay',
        'pay_return',
        'due',
        'bank',
        'no_rekening',
        'name_rekening',
    ];

    public $sortable = [
        'customer_id',
        'order_date',
        'pay',
        'due',
        'total',
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
                        $query->where('order_date', 'like', "%{$value}%")
                            ->orWhere('order_status', 'like', "%{$value}%")
                            ->orWhere('total_products', 'like', "%{$value}%")
                            ->orWhere('sub_total', 'like', "%{$value}%")
                            ->orWhere('vat', 'like', "%{$value}%")
                            ->orWhere('invoice_no', 'like', "%{$value}%")
                            ->orWhere('total', 'like', "%{$value}%")
                            ->orWhere('payment_status', 'like', "%{$value}%")
                            ->orWhere('pay', 'like', "%{$value}%")
                            ->orWhere('due', 'like', "%{$value}%")
                            ->orWhere('pay_return', 'like', "%{$value}%")
                            ->orWhere('bank', 'like', "%{$value}%")
                            ->orWhere('name_rekening', 'like', "%{$value}%");
                    });
                }

                if (in_array($column, [
                    'order_date',
                    'order_status',
                    'total_products',
                    'sub_total',
                    'vat',
                    'invoice_no',
                    'total',
                    'payment_status',
                    'pay',
                    'due',
                    'pay_return',
                    'bank',
                    'no_rekening',
                    'name_rekening',
                ])) {
                    $query->where($column, 'like', "%{$value}%");
                }

                // Filter range tanggal (order_date)
                if ($column === 'order_date_min') {
                    $query->where('order_date', '>=', $value);
                }

                if ($column === 'order_date_max') {
                    $query->where('order_date', '<=', $value);
                }

                // Filter range harga (pay)
                if ($column === 'pay_min') {
                    $query->where('pay', '>=', $value);
                }

                if ($column === 'pay_max') {
                    $query->where('pay', '<=', $value);
                }

                // Filter berdasarkan hari (daily)
                if ($column === 'daily') {
                    $query->whereDate('order_date', $value);
                }

                // Filter berdasarkan bulan (monthly)
                // if ($column === 'monthly') {
                //     $query->whereMonth('order_date', $value);
                // }
                if ($column === 'monthly') {
                    // Pastikan format valid (YYYY-MM)
                    if (preg_match('/^\d{4}-\d{2}$/', $value)) {
                        [$year, $month] = explode('-', $value); // Pisahkan tahun dan bulan
                        $query->whereYear('order_date', $year)
                            ->whereMonth('order_date', $month);
                    }
                }

                // Filter berdasarkan tahun (yearly)
                if ($column === 'yearly') {
                    $query->whereYear('order_date', $value);
                }
            }
        }
    }

    public function member()
    {
        return $this->belongsTo(Member::class, 'member_id', 'id');
    }

    public function products()
    {
        return $this->hasMany(OrderDetails::class, 'order_id', 'id');
    }

    public function store()
    {
        return $this->belongsTo(Store::class);
    }
}
