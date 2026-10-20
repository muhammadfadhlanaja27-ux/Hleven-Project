<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Facility;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FacilityController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Facility::query();

        if ($request->filled('category')) {
            $cat = strtolower($request->category);
            $query->whereRaw('LOWER(category) = ?', [$cat]);
        }

        $facilities = $query->orderBy('category')->orderBy('name')->get();

        return response()->json([
            'success' => true,
            'message' => 'Katalog fasilitas berhasil dimuat',
            'data' => $facilities,
        ], 200);
    }
}
