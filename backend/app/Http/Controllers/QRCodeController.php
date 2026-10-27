<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class QRCodeController extends Controller
{
    public function verify(Request $request)
    {
        return response()->json(['success' => true, 'message' => 'QR code verified']);
    }
}
