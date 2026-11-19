<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Request validasi update profil pengguna.
 *
 * Validasi input untuk memperbarui data profil:
 * - name: wajib, string, max 255 karakter
 * - phone: opsional, string, max 20 karakter
 * - avatar: opsional, file image (jpeg, png, jpg), maksimal 2MB
 *
 * @param \Illuminate\Foundation\Http\FormRequest $request
 * @return void
     */
class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'avatar' => ['nullable', 'image', 'mimes:jpeg,png,jpg', 'max:2048'], // Maksimal 2MB
        ];
    }
}
