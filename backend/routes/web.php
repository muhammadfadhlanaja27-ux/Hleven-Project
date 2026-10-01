<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/internal/migrate', function (Request $request) {
    abort_unless($request->query('key') && hash_equals((string) env('APP_KEY'), (string) $request->query('key')), 404);
    Artisan::call('migrate', ['--force' => true]);
    return response()->json(['ok' => true, 'output' => Artisan::output()]);
});

Route::get('/internal/link', function (Request $request) {
    abort_unless($request->query('key') && hash_equals((string) env('APP_KEY'), (string) $request->query('key')), 404);
    Artisan::call('storage:link');
    return response()->json(['ok' => true, 'output' => Artisan::output()]);
});