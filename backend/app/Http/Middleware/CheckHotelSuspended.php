<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckHotelSuspended
{
    /**
 * Menghentikan akses jika hotel diblokir.
 *
 * Middleware yang digunakan untuk mencegah akses ke dashboard dan
 * fitur admin hotel ketika status hotel adalah 'blocked' atau 'inactive'.
 * Jika hotel diblokir, hanya membolehkan akses ke route yang spesifik
 * (profile, password change, notifications, dan lain-lain).
 *
 * Alur kerja:
 * 1. Ambil user yang login
 * 2. Jika role admin_hotel: cek status hotel dari user->hotel atau user->hotels()->first()
 * 3. Jika status hotel 'blocked' atau 'inactive': filter route sesuai daftar yang diizinkan
 * 4. Jika route tidak diizinkan: kembalikan response 403 dengan pesan 'Hotel diblokir'
 * 5. Jika iya atau bukan admin_hotel: lanjutkan request ke next middleware/controller
 *
 * Route yang diizinkan (bisa mengakses meskipun hotel diblokir):
 * - api/v1/admin/appeals
 * - api/v1/admin/hotel/profile
 * - api/v1/admin/warnings
 * - api/v1/notifications
 * - api/v1/profile
 * - api/v1/user/profile
 *
 * @param \Illuminate\Http\Request $request
 * @param \Closure $next
 * @return \Symfony\Component\HttpFoundation\Response Response lanjutannya atau error 403
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if ($user && $user->role === 'admin_hotel') {
            $status = $user->hotel?->status ?? $user->hotels()->first()?->status;
            if (in_array($status, ['blocked', 'inactive'])) {
                $path = $request->path();
                $allowed = [
                    'api/v1/admin/appeals',
                    'api/v1/admin/hotel/profile',
                    'api/v1/admin/warnings',
                    'api/v1/notifications',
                    'api/v1/profile',
                    'api/v1/user/profile',
                ];
                $isAllowed = false;
                foreach ($allowed as $prefix) {
                    if (str_starts_with($path, $prefix)) {
                        $isAllowed = true;
                        break;
                    }
                }
                if (! $isAllowed) {
                    return response()->json(['success' => false, 'message' => 'Hotel diblokir. Silakan ajukan banding.', 'blocked' => true], 403);
                }
            }
        }

        return $next($request);
    }
}
