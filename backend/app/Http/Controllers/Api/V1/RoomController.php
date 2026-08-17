<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\RoomType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class RoomController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $hotel = $user->hotel;

        if (!$hotel) {
            return response()->json([
                'success' => false,
                'message' => 'Hotel tidak ditemukan untuk user ini.',
            ], 404);
        }

        $rooms = RoomType::where('hotel_id', $hotel->id)
            ->with(['photos', 'facilities'])
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar kamar berhasil dimuat',
            'data' => $rooms,
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        $hotel = $user->hotel;

        if (!$hotel) {
            return response()->json([
                'success' => false,
                'message' => 'Hotel tidak ditemukan untuk user ini.',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'weekday_price' => 'required|numeric|min:0',
            'weekend_price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'capacity_adult' => 'required|integer|min:1',
            'capacity_child' => 'required|integer|min:0',
            'breakfast' => 'boolean',
            'smoking_area' => 'boolean',
            'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $room = RoomType::create([
            'hotel_id' => $hotel->id,
            'name' => $request->name,
            'description' => $request->description,
            'weekday_price' => $request->weekday_price,
            'weekend_price' => $request->weekend_price,
            'stock' => $request->stock,
            'capacity_adult' => $request->capacity_adult,
            'capacity_child' => $request->capacity_child,
            'breakfast' => $request->breakfast ?? false,
            'smoking_area' => $request->smoking_area ?? false,
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('rooms', 'public');
            $room->photos()->create([
                'photo' => $path,
                'is_thumbnail' => true,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Kamar berhasil ditambahkan',
            'data' => $room->load('photos'),
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id): JsonResponse
    {
        $room = RoomType::with(['photos', 'facilities', 'hotel'])->find($id);

        if (!$room) {
            return response()->json([
                'success' => false,
                'message' => 'Kamar tidak ditemukan',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail kamar berhasil dimuat',
            'data' => $room,
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $room = RoomType::find($id);

        if (!$room) {
            return response()->json([
                'success' => false,
                'message' => 'Kamar tidak ditemukan',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'weekday_price' => 'sometimes|required|numeric|min:0',
            'weekend_price' => 'sometimes|required|numeric|min:0',
            'stock' => 'sometimes|required|integer|min:0',
            'capacity_adult' => 'sometimes|required|integer|min:1',
            'capacity_child' => 'sometimes|required|integer|min:0',
            'breakfast' => 'boolean',
            'smoking_area' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $room->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Kamar berhasil diperbarui',
            'data' => $room,
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id): JsonResponse
    {
        $room = RoomType::find($id);

        if (!$room) {
            return response()->json([
                'success' => false,
                'message' => 'Kamar tidak ditemukan',
            ], 404);
        }

        // Hapus foto terkait
        foreach ($room->photos as $photo) {
            if (Storage::disk('public')->exists($photo->photo)) {
                Storage::disk('public')->delete($photo->photo);
            }
            $photo->delete();
        }

        $room->delete();

        return response()->json([
            'success' => true,
            'message' => 'Kamar berhasil dihapus',
        ], 200);
    }
}
