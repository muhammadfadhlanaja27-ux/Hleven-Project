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

        // Jika dipanggil oleh Admin Hotel yang sedang login
        if ($user && ($user->role === 'admin_hotel' || $user->role === 'admin')) {
            $hotel = $user->hotel ?? $user->hotels()->first();
            if ($hotel) {
                $query->where(function ($q) use ($hotel) {
                    $q->where('hotel_id', $hotel->id)
                      ->orWhereNull('hotel_id');
                });
            }
        } elseif ($request->has('hotel_id')) {
            $hotelId = $request->hotel_id;
            $query->where(function ($q) use ($hotelId) {
                $q->where('hotel_id', $hotelId)
                  ->orWhereNull('hotel_id');
            });
        }

        if ($request->has('category')) {
            $query->where('category', $request->category);
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
        $hotel = $user ? ($user->hotel ?? $user->hotels()->first()) : null;

        $request->validate([
            'name'        => 'required|string|max:255',
            'category'    => 'required|in:Hotel,Room,Bathroom',
            'icon'        => 'nullable|string|max:100',
            'description' => 'nullable|string|max:500',
            'status'      => 'nullable|in:active,inactive',
        ]);

        $facility = Facility::create([
            'hotel_id'    => $hotel ? $hotel->id : null,
            'name'        => $request->name,
            'category'    => $request->category,
            'icon'        => $request->icon ?? 'star',
            'description' => $request->description,
            'status'      => $request->status ?? 'active',
        ]);

        // Jika kategori Hotel, otomatis hubungkan ke hotel_facilities hotel tersebut
        if ($hotel && $request->category === 'Hotel') {
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
        $hotel = $user ? ($user->hotel ?? $user->hotels()->first()) : null;

        $facility = Facility::when($hotel, function ($q) use ($hotel) {
            return $q->where(function ($sub) use ($hotel) {
                $sub->where('hotel_id', $hotel->id)
                    ->orWhereNull('hotel_id');
            });
        })->findOrFail($id);

        $request->validate([
            'name'        => 'sometimes|string|max:255',
            'category'    => 'sometimes|in:Hotel,Room,Bathroom',
            'icon'        => 'nullable|string|max:100',
            'description' => 'nullable|string|max:500',
            'status'      => 'nullable|in:active,inactive',
        ]);

        $facility->update($request->only(['name', 'category', 'icon', 'description', 'status']));

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
        $hotel = $user ? ($user->hotel ?? $user->hotels()->first()) : null;

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

