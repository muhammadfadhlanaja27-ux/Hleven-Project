<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Request validasi login pengguna.
 *
 * Validasi input untuk proses autentikasi:
 * - email: wajib, format email valid
 * - password: wajib, string tanpa validasi panjang minimal
 *
 * @param \Illuminate\Foundation\Http\FormRequest $request
 * @return void
     */
class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ];
    }
}
