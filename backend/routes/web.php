<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Mail;
use App\Models\HotelPhoto;
use App\Models\RoomPhoto;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/debug-email', function (Request $request) {
    if ($request->query('token') !== 'debug-2026') {
        abort(403, 'Unauthorized');
    }

    try {
        Mail::raw('Halo, ini adalah tes debug email dari HLeven!', function ($message) {
            $message->to('muhammadfadhlanaja27@gmail.com')
                    ->subject('Tes Debug Email');
        });
        return "Berhasil mengirim email! Cek inbox/spam.";
    } catch (\Exception $e) {
        return "Gagal mengirim email. Error: " . $e->getMessage();
    }
});

Route::get('/fix-photos', function (Request $request) {
    if ($request->query('token') !== 'hleven-fix-2026') {
        abort(403, 'Unauthorized');
    }

    $hotelKeywords = ['hotel,exterior', 'resort,view', 'luxury,building', 'modern,architecture', 'hotel,garden', 'hotel,lobby', 'swimmingpool,hotel', 'boutique,hotel', 'tropical,resort', 'beach,hotel'];
    $roomKeywords = ['hotel,bedroom', 'modern,suite', 'luxury,interior', 'cozy,room', 'apartment,bedroom', 'hotel,bathroom,modern', 'penthouse,bedroom', 'minimalist,room', 'hotel,furniture', 'villa,bedroom'];

    $getFlickr = fn($pool) => "https://loremflickr.com/1200/800/{$pool[array_rand($pool)]}?random=" . uniqid();

    $hCount = HotelPhoto::all()->each(function($p) use ($getFlickr, $hotelKeywords) {
        if ($p->hotel_id == 1793) {
            $p->update(['photo' => '/images/hotel-lokal/budi-house.jpg']);
        } elseif ($p->hotel_id == 1794) {
            $p->update(['photo' => '/images/hotel-lokal/padma-hotel.jpg']);
        } else {
            $p->update(['photo' => $getFlickr($hotelKeywords)]);
        }
    })->count();

    $rCount = RoomPhoto::all()->each(function($p) use ($getFlickr, $roomKeywords) {
        $p->update(['photo' => $getFlickr($roomKeywords)]);
    })->count();

    return response()->json([
        'status' => 'success',
        'message' => 'Database photo URLs updated with Hybrid Logic.',
        'hotels_updated' => $hCount,
        'rooms_updated' => $rCount
    ]);
});
