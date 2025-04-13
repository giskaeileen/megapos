<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ExeController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $user->assignRole('Employee');
    }
}
