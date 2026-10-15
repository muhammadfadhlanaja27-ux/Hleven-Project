<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BedType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BedTypeController extends Controller
{
    /** List bed types for current hotel */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $hotel = $user->hotel ?? $user->hotels()->first();
        if (! $hotel) {
            return response()->json(['status' => 'success', 'data' => []]);
        }
        $bedTypes = BedType::where('hotel_id', $hotel->id)->get();

        return response()->json(['status' => 'success', 'data' => $bedTypes]);
    }

    /** Create bed type */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        $hotel = $user->hotel ?? $user->hotels()->first();
        if (! $hotel) {
            return response()->json(['status' => 'error', 'message' => 'Hotel not found.'], 404);
        }
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'size' => 'nullable|string|max:100',
            'max_adults' => 'required|integer|min:1',
            'max_children' => 'required|integer|min:0',
            'max_total' => 'required|integer|min:1',
            'description' => 'nullable|string',
        ]);
        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'errors' => $validator->errors()], 422);
        }
        $bed = BedType::create(array_merge(
            $request->only(['name', 'size', 'max_adults', 'max_children', 'max_total', 'description']),
            ['hotel_id' => $hotel->id]
        ));

        return response()->json(['status' => 'success', 'data' => $bed], 201);
    }

    /** Show */
    public function show(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $hotel = $user->hotel ?? $user->hotels()->first();
        if (! $hotel) {
            return response()->json(['status' => 'error', 'message' => 'Hotel not found.'], 404);
        }

        $bed = BedType::where('hotel_id', $hotel->id)->find($id);
        if (! $bed) {
            return response()->json(['status' => 'error', 'message' => 'Bed type not found'], 404);
        }

        return response()->json(['status' => 'success', 'data' => $bed]);
    }

    /** Update */
    public function update(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $hotel = $user->hotel ?? $user->hotels()->first();
        if (! $hotel) {
            return response()->json(['status' => 'error', 'message' => 'Hotel not found.'], 404);
        }

        $bed = BedType::where('hotel_id', $hotel->id)->find($id);
        if (! $bed) {
            return response()->json(['status' => 'error', 'message' => 'Bed type not found'], 404);
        }
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'size' => 'nullable|string|max:100',
            'max_adults' => 'sometimes|integer|min:1',
            'max_children' => 'sometimes|integer|min:0',
            'max_total' => 'sometimes|integer|min:1',
            'description' => 'nullable|string',
        ]);
        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'errors' => $validator->errors()], 422);
        }
        $bed->update($request->only(['name', 'size', 'max_adults', 'max_children', 'max_total', 'description']));

        return response()->json(['status' => 'success', 'data' => $bed]);
    }

    /** Delete */
    public function destroy(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $hotel = $user->hotel ?? $user->hotels()->first();
        if (! $hotel) {
            return response()->json(['status' => 'error', 'message' => 'Hotel not found.'], 404);
        }

        $bed = BedType::where('hotel_id', $hotel->id)->find($id);
        if (! $bed) {
            return response()->json(['status' => 'error', 'message' => 'Bed type not found'], 404);
        }
        $bed->delete();

        return response()->json(['status' => 'success', 'message' => 'Deleted']);
    }
}
