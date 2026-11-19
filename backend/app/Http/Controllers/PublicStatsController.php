<?php

namespace App\Http\Controllers;

use App\Models\PartnerApplication;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;

class PublicStatsController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'total_mitra' => PartnerApplication::count(),
            'total_mitra_diterima' => PartnerApplication::where('status', 'approved')->count(),
            'total_tamu' => Booking::count(),
        ]);
    }
}
