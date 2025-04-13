<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Member;
use App\Models\Store;

class MemberSeeder extends Seeder
{
    public function run()
    {
        // Ambil store berdasarkan slug
        $storeA = Store::where('slug', 'toko-a')->first();
        $storeB = Store::where('slug', 'toko-b')->first();
        $storeC = Store::where('slug', 'toko-c')->first();

        // Member untuk Toko A
        Member::create([
            'name' => 'Member A1',
            'email' => 'member.a1@example.com',
            'phone' => '081234567911',
            'city' => 'Jakarta',
            'address' => 'Jl. Sudirman No. 101',
            'store_id' => $storeA->id,
        ]);

        Member::create([
            'name' => 'Member A2',
            'email' => 'member.a2@example.com',
            'phone' => '081234567912',
            'city' => 'Jakarta',
            'address' => 'Jl. Thamrin No. 201',
            'store_id' => $storeA->id,
        ]);

        // Member untuk Toko B
        Member::create([
            'name' => 'Member B1',
            'email' => 'member.b1@example.com',
            'phone' => '081234567913',
            'city' => 'Bandung',
            'address' => 'Jl. Asia Afrika No. 301',
            'store_id' => $storeB->id,
        ]);

        Member::create([
            'name' => 'Member B2',
            'email' => 'member.b2@example.com',
            'phone' => '081234567914',
            'city' => 'Bandung',
            'address' => 'Jl. Braga No. 401',
            'store_id' => $storeB->id,
        ]);

        // Member untuk Toko C
        Member::create([
            'name' => 'Member C1',
            'email' => 'member.c1@example.com',
            'phone' => '081234567915',
            'city' => 'Surabaya',
            'address' => 'Jl. Tunjungan No. 501',
            'store_id' => $storeC->id,
        ]);

        Member::create([
            'name' => 'Member C2',
            'email' => 'member.c2@example.com',
            'phone' => '081234567916',
            'city' => 'Surabaya',
            'address' => 'Jl. Pemuda No. 601',
            'store_id' => $storeC->id,
        ]);
    }
}