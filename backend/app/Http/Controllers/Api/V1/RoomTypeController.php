<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\RoomType;
use App\Models\Hotel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class RoomTypeController extends Controller
{
    /**
     * Menampilkan daftar tipe kamar milik hotel yang sedang login
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $hotel = $user->hotel ?? $user->hotels()->first() ?? Hotel::first();

        if (!$hotel) {
            return response()->json(['status' => 'success', 'data' => []]);
        }

        $roomTypes = RoomType::where('hotel_id', $hotel->id)->with(['photos', 'facilities'])->get();

        return response()->json([
            'status' => 'success',
            'data' => $roomTypes
        ]);
    }

    /**
     * Menambah tipe kamar baru (Disesuaikan dengan RoomCreate.jsx & Model RoomType)
     */
    public function store(Request $request)
    {
        $user = $request->user();
        $hotel = $user->hotel ?? $user->hotels()->first() ?? Hotel::first();

        if (!$hotel) {
            return response()->json(['status' => 'error', 'message' => 'Hotel not found.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'weekday_price' => 'required|numeric|min:0',
            'weekend_price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'adult_capacity' => 'required|integer|min:1',
            'child_capacity' => 'nullable|integer|min:0',
            'facilities' => 'nullable|array',
            'facilities.*' => 'exists:facilities,id',
            'photos' => 'nullable|array',
            'photos.*' => 'image|mimes:jpeg,png,jpg,webp|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'errors' => $validator->errors()], 422);
        }

        // 1. Buat data utama RoomType (disesuaikan dengan kolom model: capacity_adult & capacity_child)
        $roomType = RoomType::create([
            'hotel_id' => $hotel->id,
            'name' => $request->name,
            'description' => $request->description,
            'weekday_price' => $request->weekday_price,
            'weekend_price' => $request->weekend_price,
            'stock' => $request->stock,
            'capacity_adult' => $request->adult_capacity,
            'capacity_child' => $request->child_capacity ?? 0,
        ]);

        // 2. Simpan relasi fasilitas ke tabel pivot `room_facilities`
        if ($request->has('facilities')) {
            $roomType->facilities()->sync($request->facilities);
        }

        // 3. Simpan multiple foto jika ada
        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $photo) {
                $path = $photo->store('room_types', 'public');
                $roomType->photos()->create(['image_path' => $path]);
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Room type created successfully',
            'data' => $roomType->load(['photos', 'facilities'])
        ], 201);
    }

    /**
     * Menampilkan detail tipe kamar tertentu
     */
    public function show($id)
    {
        $roomType = RoomType::with(['photos', 'facilities', 'hotel'])->find($id);

        if (!$roomType) {
            return response()->json(['status' => 'error', 'message' => 'Room type not found'], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $roomType
        ]);
    }

    /**
     * Mengubah data tipe kamar
     */
    public function update(Request $request, $id)
    {
        $roomType = RoomType::find($id);

        if (!$roomType) {
            return response()->json(['status' => 'error', 'message' => 'Room type not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'weekday_price' => 'sometimes|numeric|min:0',
            'weekend_price' => 'sometimes|numeric|min:0',
            'stock' => 'sometimes|integer|min:0',
            'adult_capacity' => 'sometimes|integer|min:1',
            'child_capacity' => 'nullable|integer|min:0',
            'facilities' => 'nullable|array',
            'facilities.*' => 'exists:facilities,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'errors' => $validator->errors()], 422);
        }

        // Mapping inputan dari request ke kolom database model
        $updateData = $request->only([
            'name', 'description', 'weekday_price', 'weekend_price', 
            'stock'
        ]);

        if ($request->has('adult_capacity')) {
            $updateData['capacity_adult'] = $request->adult_capacity;
        }
        if ($request->has('child_capacity')) {
            $updateData['capacity_child'] = $request->child_capacity;
        }

        $roomType->update($updateData);

        // Update relasi fasilitas jika dikirimkan
        if ($request->has('facilities')) {
            $roomType->facilities()->sync($request->facilities);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Room type updated successfully',
            'data' => $roomType->load(['photos', 'facilities'])
        ]);
    }

    /**
     * Menghapus tipe kamar
     */
    public function destroy($id)
    {
        $roomType = RoomType::find($id);

        if (!$roomType) {
            return response()->json(['status' => 'error', 'message' => 'Room type not found'], 404);
        }

        // Hapus foto-foto terkait di storage jika ada
        foreach ($roomType->photos as $photo) {
            if (isset($photo->image_path)) {
                Storage::disk('public')->delete($photo->image_path);
            }
        }
        $roomType->photos()->delete();

        // Hapus relasi pivot fasilitas
        $roomType->facilities()->detach();

        $roomType->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Room type deleted successfully'
        ]);
    }
}