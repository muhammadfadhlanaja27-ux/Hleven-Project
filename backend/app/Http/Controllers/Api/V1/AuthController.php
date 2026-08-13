<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\UpdateProfileRequest;
use App\Http\Requests\Auth\ChangePasswordRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class AuthController extends Controller
{
    /**
     * Register User Baru
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'role' => $request->role ?? 'user',
            'status' => 'active',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Registrasi berhasil',
            'data' => [
                'user' => $user,
                'access_token' => $token,
                'token_type' => 'Bearer',
            ]
        ], 201);
    }

    /**
     * Login User & Generate Sanctum Token
     */
    public function login(LoginRequest $request): JsonResponse
    {
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'success' => false,
                'message' => 'Email atau password salah',
            ], 401);
        }

        $user = User::where('email', $request->email)->firstOrFail();

        // Cek status akun aktif atau diblokir
        if ($user->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Akun anda sedang tidak aktif atau diblokir.',
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil',
            'data' => [
                'user' => $user,
                'access_token' => $token,
                'token_type' => 'Bearer',
            ]
        ], 200);
    }

    /**
     * Get Profile User yang sedang login
     */
    public function profile(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Detail profil berhasil dimuat',
            'data' => $request->user(),
        ], 200);
    }

    /**
     * Update Profile Pengguna (Disesuaikan agar mendukung first_name & last_name)
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        // Tentukan nama: jika dikirim first_name/last_name gabungkan, jika tidak gunakan $request->name
        $fullName = $request->has('first_name')
            ? trim($request->first_name . ' ' . ($request->last_name ?? ''))
            : $request->name;

        $data = [
            'name'  => $fullName ?: $user->name,
            'email' => $request->email ?: $user->email,
            'phone' => $request->phone,
        ];

        // Handle upload avatar jika ada
        if ($request->hasFile('avatar')) {
            if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }
            $data['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        $user->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diperbarui',
            'data'    => $user,
        ], 200);
    }

    /**
     * Ganti Password Pengguna
     */
    public function changePassword(Request $request): JsonResponse
    {
        $user = $request->user();

        // Ambil input password saat ini (fleksibel current_password / old_password)
        $currentPwd = $request->current_password ?? $request->old_password;
        $newPwd     = $request->new_password ?? $request->password;

        if (!$currentPwd || !Hash::check($currentPwd, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Password saat ini tidak cocok',
            ], 422);
        }

        $user->update([
            'password' => Hash::make($newPwd),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password berhasil diperbarui',
        ], 200);
    }

    /**
     * Logout (Hapus Token Aktif)
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil',
        ], 200);
    }
}