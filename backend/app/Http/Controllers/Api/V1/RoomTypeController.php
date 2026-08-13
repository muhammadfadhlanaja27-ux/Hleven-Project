<?php 

namespace App\Http\Controllers\Api\V1; 

use App\Http\Controllers\Controller; 
use App\Models\RoomType; 
use App\Models\RoomPriceHistory; 
use Illuminate\Http\JsonResponse; 
use Illuminate\Http\Request; 
use Carbon\Carbon; 

class RoomTypeController extends Controller 
{ 
    // Menampilkan daftar kamar berdasarkan hotel 
    public function index($hotelId): JsonResponse 
    { 
        $rooms = RoomType::with(['photos', 'facilities', 'priceHistories']) 
            ->where('hotel_id', $hotelId) 
            ->get(); 

        return response()->json([ 
            'success' => true, 
            'message' => 'Daftar tipe kamar berhasil dimuat', 
            'data' => $rooms, 
        ], 200); 
    } 

    // Menambah tipe kamar baru dengan dukungan unggah foto & fasilitas
    public function store(Request $request, $hotelId): JsonResponse 
    { 
        $request->validate([ 
            'name' => 'required|string|max:255', 
            'description' => 'nullable|string', 
            'weekday_price' => 'required|numeric|min:0', 
            'weekend_price' => 'required|numeric|min:0', 
            'stock' => 'required|integer|min:0', 
            'adult_capacity' => 'required|integer|min:1', 
            'child_capacity' => 'nullable|integer|min:0', 
            'facilities' => 'nullable|array', // Array ID fasilitas 
            'photos.*' => 'nullable|image|mimes:jpeg,png,jpg|max:2048', // Multiple foto 
        ]); 

        $roomType = RoomType::create([ 
            'hotel_id' => $hotelId, 
            'name' => $request->name, 
            'description' => $request->description, 
            'weekday_price' => $request->weekday_price, 
            'weekend_price' => $request->weekend_price, 
            'stock' => $request->stock, 
            'adult_capacity' => $request->adult_capacity, 
            'child_capacity' => $request->child_capacity ?? 0, 
        ]); 

        // Simpan relasi fasilitas jika ada 
        if ($request->has('facilities')) { 
            $roomType->facilities()->sync($request->facilities); 
        } 

        // Simpan foto-foto kamar jika diunggah 
        if ($request->hasFile('photos')) { 
            foreach ($request->file('photos') as $photo) { 
                $path = $photo->store('room-photos', 'public'); 
                
                // Simpan ke tabel relasi foto kamar
                $roomType->photos()->create(['image_path' => $path]); 
            } 
        } 

        // Catat ke riwayat harga awal 
        RoomPriceHistory::create([ 
            'room_type_id' => $roomType->id, 
            'weekday_price' => $request->weekday_price, 
            'weekend_price' => $request->weekend_price, 
            'effective_from' => Carbon::now(), 
        ]); 

        return response()->json([ 
            'success' => true, 
            'message' => 'Tipe kamar berhasil ditambahkan', 
            'data' => $roomType->load(['facilities', 'photos']), 
        ], 201); 
    } 

    // Mengupdate tipe kamar & memantau perubahan harga 
    public function update(Request $request, $id): JsonResponse 
    { 
        $roomType = RoomType::findOrFail($id); 

        $request->validate([ 
            'name' => 'required|string|max:255', 
            'description' => 'nullable|string', 
            'weekday_price' => 'required|numeric|min:0', 
            'weekend_price' => 'required|numeric|min:0', 
            'stock' => 'required|integer|min:0', 
            'adult_capacity' => 'required|integer|min:1', 
            'child_capacity' => 'nullable|integer|min:0', 
            'facilities' => 'nullable|array', 
        ]); 

        // Cek jika ada perubahan harga, tutup riwayat lama & buat riwayat harga baru 
        if ($roomType->weekday_price != $request->weekday_price || $roomType->weekend_price != $request->weekend_price) { 
            // Tutup effective_until riwayat harga aktif terakhir 
            RoomPriceHistory::where('room_type_id', $roomType->id) 
                ->whereNull('effective_until') 
                ->update(['effective_until' => Carbon::now()]); 

            // Buat riwayat harga baru 
            RoomPriceHistory::create([ 
                'room_type_id' => $roomType->id, 
                'weekday_price' => $request->weekday_price, 
                'weekend_price' => $request->weekend_price, 
                'effective_from' => Carbon::now(), 
            ]); 
        } 

        $roomType->update([
            'name' => $request->name, 
            'description' => $request->description, 
            'weekday_price' => $request->weekday_price, 
            'weekend_price' => $request->weekend_price, 
            'stock' => $request->stock, 
            'adult_capacity' => $request->adult_capacity, 
            'child_capacity' => $request->child_capacity ?? 0, 
        ]); 

        if ($request->has('facilities')) { 
            $roomType->facilities()->sync($request->facilities); 
        } 

        return response()->json([ 
            'success' => true, 
            'message' => 'Tipe kamar berhasil diperbarui', 
            'data' => $roomType->load(['facilities', 'photos', 'priceHistories']), 
        ], 200); 
    } 

    // Menghapus tipe kamar (Soft Delete) 
    public function destroy($id): JsonResponse 
    { 
        $roomType = RoomType::findOrFail($id); 
        $roomType->delete(); 

        return response()->json([ 
            'success' => true, 
            'message' => 'Tipe kamar berhasil dihapus', 
        ], 200); 
    } 
}
