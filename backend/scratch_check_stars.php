<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$hotels = \App\Models\Hotel::where('name', 'like', '%Padma%')
    ->orWhere('name', 'like', '%Budi%')
    ->get(['id', 'name', 'star_rating', 'star_verified_reason', 'average_rating', 'total_review']);

echo json_encode($hotels, JSON_PRETTY_PRINT);
