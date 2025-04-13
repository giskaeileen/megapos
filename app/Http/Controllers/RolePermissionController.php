<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Spatie\Permission\Models\Role as RoleSpatie;
use Spatie\Permission\Models\Permission as PermissionSpatie;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Spatie\QueryBuilder\QueryBuilder;

class RolePermissionController extends Controller
{
    public function __construct()
    {
        // $this->middleware('can:Create Role Permission')->only(['store']);
        // $this->middleware('can:Read Role Permission')->only(['index', 'show']);
        // $this->middleware('can:Update Role Permission')->only(['update']);
        // $this->middleware('can:Delete Role Permission')->only(['destroy']);
    }

    public function index()
    {
        $row = (int) request('row', 10);

        if ($row < 1 || $row > 100) {
            abort(400, 'The per-page parameter must be an integer between 1 and 100.');
        }

        return response()->json(
            Role::with('permissions')
                ->filter(request(['search']))
                ->sortable()
                ->paginate($row)
                ->appends(request()->query()
            ),
        );
    }

    public function show($id)
    {
        $role = RoleSpatie::with('permissions')->findOrFail($id);
        $permissions = PermissionSpatie::all();

        return response()->json([
            'role' => $role,
            'permissions' => $permissions,
        ]);
    }

    public function update($id, Request $request)
    {
        $role = RoleSpatie::findOrFail($id);
        $role->syncPermissions($request->permissions);
        // $permissions = collect($request->permissions)
        //     ->filter(fn($permission) => $permission['selected'])
        //     ->pluck('id');
        // $role->syncPermissions($permissions);

        return response()->json([
            'message' => 'Data has been updated!',
            'role_permission' => $role,
        ], 200);
    }
}
