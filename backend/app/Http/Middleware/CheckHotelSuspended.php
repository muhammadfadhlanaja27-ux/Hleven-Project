<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckHotelSuspended
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if ($user && $user->role === 'admin_hotel') {
            $status = $user->hotel?->status ?? $user->hotels()->first()?->status;
            if ($status === 'blocked') {
                $path = $request->path();
                $allowed = [
                    'api/v1/admin/appeals',
                    'api/v1/admin/hotel/profile',
                    'api/v1/notifications',
                    'api/v1/profile',
                    'api/v1/user/profile',
                ];
                $isAllowed = false;
                foreach ($allowed as $prefix) {
                    if (str_starts_with($path, $prefix)) { $isAllowed = true; break; }
                }
                if (!$isAllowed) {
                    return response()->json(['success' => false, 'message' => 'Hotel diblokir. Silakan ajukan banding.', 'blocked' => true], 403);
                }
            }
        }
        return $next($request);
    }
}
