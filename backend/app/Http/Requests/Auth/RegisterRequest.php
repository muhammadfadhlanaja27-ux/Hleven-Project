<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Request validasi registrasi pengguna baru.
 *
 * Validasi input untuk pendaftaran akun baru:
 * - name: wajib, string, max 255 karakter
 * - email: wajib, format email, harus unik di tabel users
 * - password: wajib, minimal 8 karakter
 * - phone: opsional, string, max 20 karakter
 * - role: opsional, harus 'user' jika dikirim
 *
 * @param \Illuminate\Foundation\Http\FormRequest $request
 * @return void
     */
class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8'],
            'phone' => ['nullable', 'string', 'max:20'],
            'role' => ['sometimes', 'in:user'],
        ];
    }
}
