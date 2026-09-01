<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function update(Request $request)
    {
        $user = $request->user();

        // 1. Validasi Input
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name'  => 'nullable|string|max:255',
            'email'      => 'required|email|unique:users,email,' . $user->id,
            'phone'      => 'nullable|string|max:20',
            'avatar'     => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        // Gabungkan first_name dan last_name menjadi 'name'
        $fullName = trim($request->first_name . ' ' . ($request->last_name ?? ''));

        $updateData = [
            'name'  => $fullName,
            'email' => $request->email,
            'phone' => $request->phone,
        ];

        // 2. Upload Foto Profil
        if ($request->hasFile('avatar')) {
            // Hapus foto lama jika ada di storage
            if ($user->avatar) {
                $oldPath = ltrim(parse_url($user->avatar, PHP_URL_PATH), '/');
                if ($oldPath && Storage::disk('s3')->exists($oldPath)) {
                    Storage::disk('s3')->delete($oldPath);
                }
            }

            // Simpan foto baru ke Supabase
            $path = $request->file('avatar')->store('avatars', 's3');
            $updateData['avatar'] = Storage::disk('s3')->url($path);
        }

        // 3. Simpan ke Database
        $user->update($updateData);

        return response()->json([
            'message' => 'Profil berhasil diperbarui',
            'user'    => $user
        ], 200);
    }

    public function changePassword(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'current_password' => 'required',
            'new_password'     => 'required|min:8',
        ]);

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Kata sandi saat ini salah.'], 422);
        }

        $user->update([
            'password' => Hash::make($request->new_password)
        ]);

        return response()->json(['message' => 'Kata sandi berhasil diubah']);
    }
}