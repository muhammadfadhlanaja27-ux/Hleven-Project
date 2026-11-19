<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\FileStorageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    /**
     * Memperbarui profil pengguna.
     *
     * Proses update profil meliputi validasi input, penggabungan first_name dan
     * last_name menjadi nama lengkap, serta upload avatar jika baru dikirim.
     *
     * Validasi input:
     * - first_name: wajib, string, max 255 karakter
     * - last_name: opsional, string, max 255 karakter
     * - email: wajib format email, unik di tabel users (kecuali user saat ini)
     * - phone: opsional, string, max 20 karakter
     * - avatar: opsional, file image (jpeg, png, jpg, webp, max 2048KB)
     *
     * Logika alur:
     * 1. Validasi input sesuai aturan di atas
     * 2. Gabungkan first_name dan last_name menjadi field name
     * 3. Simpan data ke database melalui eloquent update
     * 4. Jika avatar baru dikirim: unggah ke storage 'avatars' dan hapus avatar lama
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse JSON response berisi pesan sukses dan data user yang sudah diupdate
     */
    public function update(Request $request)
    {
        $user = $request->user();

        // 1. Validasi Input
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'email' => 'required|email|unique:users,email,'.$user->id,
            'phone' => 'nullable|string|max:20',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        // Gabungkan first_name dan last_name menjadi 'name'
        $fullName = trim($request->first_name.' '.($request->last_name ?? ''));

        $updateData = [
            'name' => $fullName,
            'email' => $request->email,
            'phone' => $request->phone,
        ];

        $previousAvatar = $user->avatar;

        if ($request->hasFile('avatar')) {
            $updateData['avatar'] = app(FileStorageService::class)->uploadFile($request->file('avatar'), 'avatars');
        }

        $user->update($updateData);

        if ($request->hasFile('avatar') && $previousAvatar) {
            app(FileStorageService::class)->deleteFile($previousAvatar);
        }

        return response()->json([
            'message' => 'Profil berhasil diperbarui',
            'user' => $user,
        ], 200);
    }

    /**
     * Mengganti kata sandi pengguna.
     *
     * Validasi memeriksa password saat ini melalui Hash::check sebelum
     * mengganti ke password baru. Password baru minimal 8 karakter.
     *
     * Alur proses:
     * 1. Validasi input: current_password (wajib) dan new_password (wajib, min 8 char)
     * 2. Cek kecocokan password lama dengan Hash::check terhadap password di database
     * 3. Jika cocok: update password ke database
     * 4. Jika salah: return response error 422 dengan pesan "Kata sandi saat ini salah."
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse JSON response berisi pesan sukses penggantian password
     */
    public function changePassword(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|min:8',
        ]);

        if (! Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Kata sandi saat ini salah.'], 422);
        }

        $user->update([
            'password' => Hash::make($request->new_password),
        ]);

        return response()->json(['message' => 'Kata sandi berhasil diubah']);
    }
}