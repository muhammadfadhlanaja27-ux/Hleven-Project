<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
/**
 * Middleware role-based access control.
 *
 * Mengontrol akses berdasarkan role pengguna yang disimpan di kolom `users.role`.
 * Middleware ini menggunakan kolom `role` langsung pada tabel users (bukan
 * tabel roles/permissions dari spatie/laravel-permission yang terinstal).
 *
 * Fungsi:
 * 1. Ambil user yang login dari request
 * 2. Cek apakah user terautentikasi (bukan null)
 * 3. Validasi apakah role user ada di dalam daftar roles yang dikizini
 * 4. Jika tidak cocok: kembalikan response 403 dengan pesan error
 * 5. Jika cocak: lanjutkan request ke handler selanjutnya
 *
 * Catatan Penting:
 * - Middleware iniBERPATIHAN pada kolom `users.role`, bukan roles/permissions tables
 * - Spatie/laravel-permission terinstal tetapi tidak digunakan sebagai source of truth
 * - Pastikan role pengguna diisi dengan benar: 'user', 'admin_hotel', 'super_admin'
 *
 * @param \Illuminate\Http\Request $request
 * @param \Closure(Request): (Response) $next
 * @return \Symfony\Component\HttpFoundation\Response Response lanjutannya atau error 403
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        if (! $user || ! in_array($user->role, $roles)) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak. Anda tidak memiliki hak akses ke resource ini.',
            ], 403);
        }

        return $next($request);
    }
}
