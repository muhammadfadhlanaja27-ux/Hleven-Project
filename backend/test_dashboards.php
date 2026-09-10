<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Hotel;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\SuperAdminDashboardController;
use Illuminate\Http\Request;

echo "--- TESTING ADMIN HOTEL DASHBOARD ---\n";
try {
    $adminUser = User::where('role', 'admin_hotel')->first();
    if (!$adminUser) {
        $adminUser = User::first();
    }
    echo "Using Admin User: " . ($adminUser ? $adminUser->email : "None") . "\n";
    
    $request = Request::create('/api/v1/admin/hotel/dashboard', 'GET');
    if ($adminUser) {
        $request->setUserResolver(function () use ($adminUser) {
            return $adminUser;
        });
    }
    
    $controller = new DashboardController();
    $response = $controller->index($request);
    echo "Status code: " . $response->getStatusCode() . "\n";
    echo "Response content: " . substr($response->getContent(), 0, 500) . "...\n";
} catch (\Exception $e) {
    echo "ERROR in Admin Hotel Dashboard: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}

echo "\n--- TESTING SUPER ADMIN DASHBOARD ---\n";
try {
    $saUser = User::where('role', 'super_admin')->first();
    echo "Using Super Admin User: " . ($saUser ? $saUser->email : "None") . "\n";
    
    $request = Request::create('/api/v1/super-admin/dashboard', 'GET');
    if ($saUser) {
        $request->setUserResolver(function () use ($saUser) {
            return $saUser;
        });
    }
    
    $service = app(App\Services\SuperAdminDashboardService::class);
    $controller = new SuperAdminDashboardController($service);
    
    $response = $controller->summary();
    echo "Summary Status code: " . $response->getStatusCode() . "\n";
    echo "Summary Response content: " . substr($response->getContent(), 0, 500) . "...\n";

    $response2 = $controller->recentActivities();
    echo "Recent Activities Status code: " . $response2->getStatusCode() . "\n";
    echo "Recent Activities Response content: " . substr($response2->getContent(), 0, 500) . "...\n";
} catch (\Exception $e) {
    echo "ERROR in Super Admin Dashboard: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}
