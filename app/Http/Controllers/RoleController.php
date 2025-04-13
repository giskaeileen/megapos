<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RoleController extends Controller
{
    public function index()
    {
        $row = (int) request('row', 10);

        if ($row < 1 || $row > 100) {
            abort(400, 'The per-page parameter must be an integer between 1 and 100.');
        }

        return response()->json(
            Role::filter(request(['search']))
                ->sortable()
                ->paginate($row)
                ->appends(request()->query()
            ),
        );
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validatedData = $validator->validated();

        $validatedData['guard_name'] = 'web';

        $data = Role::create($validatedData);

        return response()->json($data, 201);
    }

    public function show($id)
    {
        $data = Role::find($id);

        if (!$data) {
            return response()->json([
                'message' => 'Data not found'
            ], 404);
        }

        return response()->json($data);
    }

    public function update($id, Request $request)
    {
        $data = Role::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validatedData = $validator->validated();

        $data->update($validatedData);

        return response()->json([
            'message' => 'Data has been updated!',
            'roles' => $data,
        ], 200);
    }

    public function destroy($id)
    {
        $data = Role::findOrFail($id);

        Role::destroy($data->id);

        return response()->json([
            'message' => 'Data has been deleted!',
        ], 200);
    }
}
