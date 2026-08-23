<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Facility;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FacilityController extends Controller
{
    // Menampilkan semua fasilitas (bisa difilter berdasarkan kategori: Hotel, Room, Bathroom)
    public function index(Request $request): JsonResponse
    {
        $query = Facility::query();

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        $facilities = $query->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar fasilitas berhasil dimuat',
            'data' => $facilities,
        ], 200);
    }

    // Menambah fasilitas baru (Khusus Super Admin/Admin)
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|unique:facilities,name|max:255',
            'category' => 'required|in:Hotel,Room,Bathroom',
        ]);

        $facility = Facility::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Fasilitas berhasil ditambahkan',
            'data' => $facility,
        ], 201);
    }

    // Memperbarui fasilitas (Khusus Super Admin/Admin)
    public function update(Request $request, $id): JsonResponse
    {
        $facility = Facility::findOrFail($id);

        $request->validate([
            'name'     => 'sometimes|string|max:255|unique:facilities,name,' . $id,
            'category' => 'sometimes|in:Hotel,Room,Bathroom',
        ]);

        $facility->update($request->only(['name', 'category']));

        return response()->json([
            'success' => true,
            'message' => 'Fasilitas berhasil diperbarui',
            'data'    => $facility,
        ], 200);
    }

    // Menghapus fasilitas
    public function destroy($id): JsonResponse
    {
        $facility = Facility::findOrFail($id);
        $facility->delete();

        return response()->json([
            'success' => true,
            'message' => 'Fasilitas berhasil dihapus',
        ], 200);
    }
}
