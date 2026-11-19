<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Request validasi perubahan kata sandi.
 *
 * Validasi input untuk mengganti password pengguna:
 * - current_password: wajib, string (password lama)
 * - new_password: wajib, string, minimal 8 karakter, harus cocok dengan konfirmasi (new_password_confirmation)
 *
 * @param \Illuminate\Foundation\Http\FormRequest $request
 * @return void
     */
class ChangePasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'current_password' => ['required', 'string'],
            'new_password' => ['required', 'string', 'min:8', 'confirmed'], // Membutuhkan field new_password_confirmation
        ];
    }
}
