<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Facility;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FacilityController extends Controller
{
    /**
     * Katalog fasilitas hotel.
     *
     * Menampilkan daftar fasilitas lengkap.opsional filter berdasarkan kategori.
     * Kategori difilter dengan mengubah nama menjadi lowercase untuk mencocokkan
     * dengan nilai kolom category di database.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse JSON response berisi array fasilitas
     */
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
