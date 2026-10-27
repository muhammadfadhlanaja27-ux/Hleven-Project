<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use App\Notifications\PasswordResetNotification;
use App\Notifications\RegisterOTPNotification;
use App\Services\FileStorageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    /**
     * Kirim OTP untuk Pendaftaran
     */
    public function sendRegisterOtp(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email|unique:users,email'], [
            'email.unique' => 'Email ini sudah terdaftar. Silakan gunakan email lain atau login.'
        ]);

        $otp = rand(100000, 999999);
        $cacheKey = 'register_otp_'.$request->email;

        Cache::put($cacheKey, $otp, now()->addMinutes(10));

        Notification::route('mail', $request->email)->notify(new RegisterOTPNotification((string) $otp));

        return response()->json([
            'success' => true,
            'message' => 'Kode OTP telah dikirim ke email Anda',
        ]);
    }

    /**
     * Verifikasi OTP Pendaftaran
     */
    public function verifyRegisterOtp(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|numeric',
        ]);

        $cacheKey = 'register_otp_'.$request->email;
        $storedOtp = Cache::get($cacheKey);

        if (! $storedOtp || $storedOtp != $request->otp) {
            return response()->json([
                'success' => false,
                'message' => 'Kode OTP tidak valid atau sudah kadaluarsa',
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Kode OTP valid',
        ]);
    }

    /**
     * Register User Baru
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $request->validate(['otp' => 'required|numeric']);

        $cacheKey = 'register_otp_'.$request->email;
        $storedOtp = Cache::get($cacheKey);

        if (! $storedOtp || $storedOtp != $request->otp) {
            return response()->json([
                'success' => false,
                'message' => 'Verifikasi email gagal. Kode OTP tidak valid atau sudah kadaluarsa.',
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'role' => $request->role ?? 'user',
            'status' => 'active',
        ]);

        Cache::forget($cacheKey);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Registrasi berhasil',
            'data' => [
                'user' => $user,
                'access_token' => $token,
                'token_type' => 'Bearer',
            ],
        ], 201);
    }

    /**
     * Login User & Generate Sanctum Token
     */
    public function login(LoginRequest $request): JsonResponse
    {
        if (! Auth::attempt($request->only('email', 'password'))) {
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
        $hotelStatus = null;
        if ($user->role === 'admin_hotel') {
            $hotelStatus = $user->hotel?->status ?? $user->hotels()->first()?->status;
        }

        $userArr = $user->toArray();
        if ($hotelStatus) {
            $userArr['hotel_status'] = $hotelStatus;
        }

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil',
            'data' => [
                'user' => $userArr,
                'access_token' => $token,
                'token_type' => 'Bearer',
            ],
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
            ? trim($request->first_name.' '.($request->last_name ?? ''))
            : $request->name;

        $data = [
            'name' => $fullName ?: $user->name,
            'email' => $request->email ?: $user->email,
            'phone' => $request->phone,
        ];

        // Handle upload avatar jika ada
        if ($request->hasFile('avatar')) {
            if ($user->avatar) {
                app(FileStorageService::class)->deleteFile($user->avatar);
            }
            $data['avatar'] = app(FileStorageService::class)->uploadFile($request->file('avatar'), 'avatars');
        }

        $user->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diperbarui',
            'data' => $user,
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
        $newPwd = $request->new_password ?? $request->password;

        if (! $currentPwd || ! Hash::check($currentPwd, $user->password)) {
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

    /**
     * Lupa Password - Kirim OTP
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email|exists:users,email']);

        $otp = rand(100000, 999999);
        $cacheKey = 'password_reset_otp_'.$request->email;

        Cache::put($cacheKey, $otp, now()->addMinutes(10));

        $user = User::where('email', $request->email)->first();
        $user->notify(new PasswordResetNotification($otp));

        return response()->json([
            'success' => true,
            'message' => 'Kode OTP telah dikirim ke email Anda',
        ]);
    }

    /**
     * Verifikasi Kode OTP
     */
    public function verifyOtp(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|numeric',
        ]);

        $cacheKey = 'password_reset_otp_'.$request->email;
        $storedOtp = Cache::get($cacheKey);

        if (! $storedOtp || $storedOtp != $request->otp) {
            return response()->json([
                'success' => false,
                'message' => 'Kode OTP tidak valid atau sudah kadaluarsa',
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Kode OTP valid',
        ]);
    }

    /**
     * Reset Password menggunakan OTP
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|numeric',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $cacheKey = 'password_reset_otp_'.$request->email;
        $storedOtp = Cache::get($cacheKey);

        if (! $storedOtp || $storedOtp != $request->otp) {
            return response()->json([
                'success' => false,
                'message' => 'Kode OTP tidak valid atau sudah kadaluarsa',
            ], 422);
        }

        $user = User::where('email', $request->email)->first();
        $user->update(['password' => Hash::make($request->password)]);

        Cache::forget($cacheKey);

        return response()->json([
            'success' => true,
            'message' => 'Password berhasil diperbarui',
        ]);
    }

    /**
     * Redirect ke Google
     */
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    /**
     * Handle callback dari Google
     */
    public function handleGoogleCallback()
    {
        $googleUser = Socialite::driver('google')->stateless()->user();
        $user = User::where('email', $googleUser->getEmail())->first();

        if ($user) {
            if (!$user->google_id) {
                $user->update(['google_id' => $googleUser->getId()]);
            }
        } else {
            $user = User::create([
                'name' => $googleUser->getName(),
                'email' => $googleUser->getEmail(),
                'google_id' => $googleUser->getId(),
                'password' => Hash::make(Str::random(16)),
                'role' => 'user',
                'status' => 'active',
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        // Redirect ke frontend dengan token
        return redirect()->away(config('app.frontend_url', 'http://localhost:5713') . '/auth/callback?token=' . $token . '&user=' . urlencode(json_encode($user)));
    }
}
