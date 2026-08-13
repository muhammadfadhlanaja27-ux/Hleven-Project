<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Hotel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class HotelController extends Controller
{
    // Menampilkan profil hotel yang sedang dikelola admin
    public function show(Request $request)
    {
        $user = $request->user();
        $hotel = $user->hotel;

        if (!$hotel) {
            return response()->json(['status' => 'error', 'message' => 'Hotel not found.'], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $hotel
        ]);
    }

    // Memperbarui profil hotel
    public function update(Request $request)
    {
        $user = $request->user();
        $hotel = $user->hotel;

        if (!$hotel) {
            return response()->json(['status' => 'error', 'message' => 'Hotel not found.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:150',
            'address' => 'sometimes|string',
            'phone' => 'sometimes|string|max:20',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'errors' => $validator->errors()], 422);
        }

        if ($request->hasFile('image')) {
            // Hapus gambar lama jika ada
            if ($hotel->image) {
                Storage::disk('public')->delete($hotel->image);
            }
            $hotel->image = $request->file('image')->store('hotels', 'public');
        }

        $hotel->update($request->except('image'));
        $hotel->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Hotel profile updated successfully',
            'data' => $hotel
        ]);
    }
}