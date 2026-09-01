<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Facility;
use App\Models\Hotel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FacilityController extends Controller
{
    // Menampilkan daftar fasilitas (disesuaikan dengan hotel yang login / parameter hotel_id)
    public function index(Request $request): JsonResponse
    {
        $user = $request->user('sanctum') ?? auth('sanctum')->user() ?? $request->user();
        $query = Facility::query();

        // Admin hotel hanya melihat fasilitas milik hotelnya sendiri.
        // Global facilities yang NULL hanya dipakai untuk data master umum bila memang diperlukan,
        // tetapi untuk kasus per-hotel yang dibutuhkan saat ini kita batasi ke hotel yang login.
        if ($user && in_array($user->role, ['admin_hotel', 'admin'])) {
            $hotel = $user->hotel ?? $user->hotels()->first() ?? Hotel::first();
            if ($hotel) {
                $query->where('hotel_id', $hotel->id);
            }
        } elseif ($request->has('hotel_id')) {
            $hotelId = $request->hotel_id;
            $query->where('hotel_id', $hotelId);
        }

        // PERBAIKAN: Gunakan LOWER() agar pencarian kategori 'hotel', 'Hotel', maupun 'HOTEL' tetap valid
        if ($request->has('category') && !empty($request->category)) {
            $cat = strtolower($request->category);
            $query->whereRaw('LOWER(category) = ?', [$cat]);
        }

        $facilities = $query->latest()->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar fasilitas berhasil dimuat',
            'data'    => $facilities,
        ], 200);
    }

    // Menambah fasilitas baru (Otomatis terikat ke hotel admin yang membuat)
    public function store(Request $request): JsonResponse
    {
        $user = $request->user('sanctum') ?? auth('sanctum')->user() ?? $request->user();
        $hotel = $user ? ($user->hotel ?? $user->hotels()->first() ?? Hotel::first()) : null;

        $request->validate([
            'name'        => 'required|string|max:255',
            'category'    => 'required|string',
            'icon'        => 'nullable|string|max:100',
            'description' => 'nullable|string|max:500',
            'status'      => 'nullable|in:active,inactive',
        ]);

        // Format huruf kapital di awal (contoh: 'hotel' -> 'Hotel')
        $formattedCategory = ucfirst(strtolower($request->category));

        $facility = Facility::create([
            'hotel_id'    => $hotel ? $hotel->id : null,
            'name'        => $request->name,
            'category'    => $formattedCategory,
            'icon'        => $request->icon ?? 'star',
            'description' => $request->description,
            'status'      => $request->status ?? 'active',
        ]);

        // Jika kategori Hotel, otomatis hubungkan ke hotel_facilities hotel tersebut
        if ($hotel && $formattedCategory === 'Hotel') {
            $hotel->facilities()->syncWithoutDetaching([$facility->id]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Fasilitas berhasil ditambahkan',
            'data'    => $facility,
        ], 201);
    }

    // Memperbarui fasilitas
    public function update(Request $request, $id): JsonResponse
    {
        $user = $request->user('sanctum') ?? auth('sanctum')->user() ?? $request->user();
        $hotel = $user ? ($user->hotel ?? $user->hotels()->first() ?? Hotel::first()) : null;

        $facility = Facility::when($hotel, function ($q) use ($hotel) {
            return $q->where(function ($sub) use ($hotel) {
                $sub->where('hotel_id', $hotel->id)
                    ->orWhereNull('hotel_id');
            });
        })->findOrFail($id);

        $request->validate([
            'name'        => 'sometimes|string|max:255',
            'category'    => 'sometimes|string',
            'icon'        => 'nullable|string|max:100',
            'description' => 'nullable|string|max:500',
            'status'      => 'nullable|in:active,inactive',
        ]);

        $updateData = $request->only(['name', 'icon', 'description', 'status']);
        
        if ($request->has('category')) {
            $updateData['category'] = ucfirst(strtolower($request->category));
        }

        $facility->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'Fasilitas berhasil diperbarui',
            'data'    => $facility,
        ], 200);
    }

    // Menghapus fasilitas
    public function destroy(Request $request, $id): JsonResponse
    {
        $user = $request->user('sanctum') ?? auth('sanctum')->user() ?? $request->user();
        $hotel = $user ? ($user->hotel ?? $user->hotels()->first() ?? Hotel::first()) : null;

        $facility = Facility::when($hotel, function ($q) use ($hotel) {
            return $q->where(function ($sub) use ($hotel) {
                $sub->where('hotel_id', $hotel->id)
                    ->orWhereNull('hotel_id');
            });
        })->findOrFail($id);

        $facility->delete();

        return response()->json([
            'success' => true,
            'message' => 'Fasilitas berhasil dihapus',
        ], 200);
    }
}