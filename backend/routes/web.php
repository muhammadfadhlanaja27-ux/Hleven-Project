<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\HotelPhoto;
use App\Models\RoomPhoto;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/fix-photos', function (Request $request) {
    if ($request->query('token') !== 'hleven-fix-2026') {
        abort(403, 'Unauthorized');
    }

    $hotelKeywords = ['hotel,exterior', 'resort,view', 'luxury,building', 'modern,architecture', 'hotel,garden', 'hotel,lobby', 'swimmingpool,hotel', 'boutique,hotel', 'tropical,resort', 'beach,hotel'];
    $roomKeywords = ['hotel,bedroom', 'modern,suite', 'luxury,interior', 'cozy,room', 'apartment,bedroom', 'hotel,bathroom,modern', 'penthouse,bedroom', 'minimalist,room', 'hotel,furniture', 'villa,bedroom'];

    $getFlickr = fn($pool) => "https://loremflickr.com/1200/800/{$pool[array_rand($pool)]}?random=" . uniqid();

    $hCount = HotelPhoto::all()->each(function($p) use ($getFlickr, $hotelKeywords) {
        // ID 1793 = Budi House, 1794 = Padma Hotel
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


