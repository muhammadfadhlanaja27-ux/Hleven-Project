<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Room;

class RoomController extends Controller
{
    // Menampilkan daftar kamar berdasarkan hotel ID
    public function index($hotelId)
    {
        try {
            $rooms = Room::where('hotel_id', $hotelId)->get();

            return response()->json([
                'status' => 'success',
                'data' => $rooms
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Menyimpan kamar baru
    public function store(Request $request, $hotelId)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'weekday_price' => 'required|numeric',
                'weekend_price' => 'required|numeric',
                'stock' => 'required|integer',
                'adult_capacity' => 'required|integer',
                'child_capacity' => 'nullable|integer',
            ]);

            $validated['hotel_id'] = $hotelId;

            // Simpan data ke database
            $room = Room::create($validated);

            return response()->json([
                'status' => 'success',
                'message' => 'Kamar berhasil ditambahkan',
                'data' => $room
            ], 201);

        } catch (\Exception $e) {
            // Mengembalikan pesan error asli jika terjadi kendala pada database atau query
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Mengubah data kamar
    public function update(Request $request, $id)
    {
        try {
            $room = Room::findOrFail($id);
            
            $validated = $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'description' => 'nullable|string',
                'weekday_price' => 'sometimes|required|numeric',
                'weekend_price' => 'sometimes|required|numeric',
                'stock' => 'sometimes|required|integer',
                'adult_capacity' => 'sometimes|required|integer',
                'child_capacity' => 'nullable|integer',
            ]);

            $room->update($validated);

            return response()->json([
                'status' => 'success',
                'message' => 'Data kamar berhasil diperbarui',
                'data' => $room
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Menghapus kamar
    public function destroy($id)
    {
        try {
            $room = Room::findOrFail($id);
            $room->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Kamar berhasil dihapus'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}