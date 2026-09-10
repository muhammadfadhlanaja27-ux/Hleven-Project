<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthenticationService
{
    public function register(array $data)
    {
        // Tetapkan role default jika tidak ada, misalnya 'user'
        $role = $data['role'] ?? 'user';

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'phone' => $data['phone'] ?? null,
            'role' => $role, 
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user' => $user,
            'access_token' => $token,
        ];
    }

    public function login(string $email, string $password)
    {
        $user = User::where('email', $email)->first();

        if (!$user || !Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Kredensial yang diberikan tidak cocok dengan data kami.'],
            ]);
        }

        // Opsional: Cek status akun jika ada fitur blokir
        // if ($user->status === 'Blocked') {
        //     throw ValidationException::withMessages(['email' => ['Akun Anda diblokir.']]);
        // }

        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user' => $user,
            'access_token' => $token,
        ];
    }

    public function logout($user)
    {
        // Hapus token yang sedang digunakan
        $user->currentAccessToken()->delete();
        return true;
    }
}