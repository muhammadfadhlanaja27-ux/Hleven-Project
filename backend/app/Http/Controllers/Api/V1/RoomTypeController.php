<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\RoomType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class RoomTypeController extends Controller
{
    // Menampilkan daftar tipe kamar milik hotel yang sedang login
    public function index(Request $request)
    {
        $user = $request->user();
        $hotel = $user->hotel;

        if (!$hotel) {
            return response()->json(['status' => 'error', 'message' => 'Hotel not found.'], 404);
        }

        $roomTypes = RoomType::where('hotel_id', $hotel->id)->with('rooms')->get();

        return response()->json([
            'status' => 'success',
            'data' => $roomTypes
        ]);
    }

    // Menambah tipe kamar baru
    public function store(Request $request)
    {
        $user = $request->user();
        $hotel = $user->hotel;

        if (!$hotel) {
            return response()->json(['status' => 'error', 'message' => 'Hotel not found.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'capacity' => 'required|integer|min:1',
            'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'errors' => $validator->errors()], 422);
        }

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('room_types', 'public');
        }

        $roomType = RoomType::create([
            'hotel_id' => $hotel->id,
            'name' => $request->name,
            'description' => $request->description,
            'price' => $request->price,
            'capacity' => $request->capacity,
            'image' => $imagePath,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Room type created successfully',
            'data' => $roomType
        ], 201);
    }

    // Menampilkan detail tipe kamar tertentu
    public function show($id)
    {
        $roomType = RoomType::with(['rooms', 'hotel'])->find($id);

        if (!$roomType) {
            return response()->json(['status' => 'error', 'message' => 'Room type not found'], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $roomType
        ]);
    }

    // Mengubah data tipe kamar
    public function update(Request $request, $id)
    {
        $roomType = RoomType::find($id);

        if (!$roomType) {
            return response()->json(['status' => 'error', 'message' => 'Room type not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:100',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'capacity' => 'sometimes|integer|min:1',
            'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'errors' => $validator->errors()], 422);
        }

        if ($request->hasFile('image')) {
            // Hapus gambar lama jika ada
            if ($roomType->image) {
                Storage::disk('public')->delete($roomType->image);
            }
            $roomType->image = $request->file('image')->store('room_types', 'public');
        }

        $roomType->update($request->except('image'));
        $roomType->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Room type updated successfully',
            'data' => $roomType
        ]);
    }

    // Menghapus tipe kamar
    public function destroy($id)
    {
        $roomType = RoomType::find($id);

        if (!$roomType) {
            return response()->json(['status' => 'error', 'message' => 'Room type not found'], 404);
        }

        if ($roomType->image) {
            Storage::disk('public')->delete($roomType->image);
        }

        $roomType->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Room type deleted successfully'
        ]);
    }
}