<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;

class StaffController extends Controller
{
    // Menampilkan daftar staf yang terhubung dengan hotel
    public function index(Request $request)
    {
        $user = $request->user();
        $hotel = $user->hotel;

        if (!$hotel) {
            return response()->json(['status' => 'error', 'message' => 'Hotel not found.'], 404);
        }

        // Asumsi relasi staf menggunakan hotel_id pada tabel users atau tabel pivot
        $staffs = User::where('hotel_id', $hotel->id)->get();

        return response()->json([
            'status' => 'success',
            'data' => $staffs
        ]);
    }

    // Menambahkan staf baru untuk hotel
    public function store(Request $request)
    {
        $user = $request->user();
        $hotel = $user->hotel;

        if (!$hotel) {
            return response()->json(['status' => 'error', 'message' => 'Hotel not found.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string|max:20'
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'errors' => $validator->errors()], 422);
        }

        $staff = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'role' => 'hotel_staff', // Sesuaikan dengan role di sistem Anda
            'hotel_id' => $hotel->id,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Staff created successfully',
            'data' => $staff
        ], 201);
    }

    // Menghapus atau mencopot akses staf
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $hotel = $user->hotel;

        if (!$hotel) {
            return response()->json(['status' => 'error', 'message' => 'Hotel not found.'], 404);
        }

        $staff = User::where('id', $id)->where('hotel_id', $hotel->id)->first();

        if (!$staff) {
            return response()->json(['status' => 'error', 'message' => 'Staff not found'], 404);
        }

        $staff->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Staff deleted successfully'
        ]);
    }
}