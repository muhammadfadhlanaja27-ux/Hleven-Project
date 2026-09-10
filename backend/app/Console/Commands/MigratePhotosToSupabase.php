<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use App\Models\Hotel;
use App\Models\HotelPhoto;
use App\Models\RoomPhoto;
use App\Models\User;
use App\Models\PartnerDocument;
use App\Services\FileStorageService;

class MigratePhotosToSupabase extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'photos:migrate-supabase';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Migrate local uploaded photos and files in database to Supabase Storage';

    protected FileStorageService $storageService;

    public function __construct(FileStorageService $storageService)
    {
        parent::__construct();
        $this->storageService = $storageService;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting migration of local photos to Supabase Storage...');

        $migratedCount = 0;
        $skippedCount = 0;
        $failedCount = 0;

        // Helper function to process a single file path/url
        $processFile = function ($currentUrl, string $directory) {
            if (!$currentUrl) {
                return [null, 'empty'];
            }

            // If already on Supabase URL, skip
            if (str_contains($currentUrl, 'supabase.co')) {
                return [$currentUrl, 'already_supabase'];
            }

            // Extract relative storage path
            $relativePath = ltrim(parse_url($currentUrl, PHP_URL_PATH) ?? $currentUrl, '/');
            if (str_starts_with($relativePath, 'storage/')) {
                $relativePath = substr($relativePath, 8);
            }

            // Check if file exists in local disk ('public')
            if (!Storage::disk('public')->exists($relativePath)) {
                return [null, 'not_found'];
            }

            try {
                $fileContents = Storage::disk('public')->get($relativePath);
                $filename = basename($relativePath);
                $targetPath = trim($directory, '/') . '/' . uniqid() . '_' . $filename;

                // Put file to s3 disk
                Storage::disk('s3')->put($targetPath, $fileContents);

                // Build public Supabase URL
                $baseUrl = rtrim(config('filesystems.disks.s3.url'), '/');
                $newUrl = $baseUrl . '/' . ltrim($targetPath, '/');

                return [$newUrl, 'success'];
            } catch (\Throwable $e) {
                return [null, 'error: ' . $e->getMessage()];
            }
        };

        // 1. Hotel Photos
        $this->info('Processing Hotel Photos...');
        foreach (HotelPhoto::all() as $hp) {
            [$newUrl, $status] = $processFile($hp->photo, 'hotels');
            if ($status === 'success') {
                $hp->update(['photo' => $newUrl]);
                $this->line(" - HotelPhoto #{$hp->id} migrated -> {$newUrl}");
                $migratedCount++;
            } elseif ($status === 'already_supabase') {
                $skippedCount++;
            } else {
                $this->warn(" - HotelPhoto #{$hp->id} skipped ({$status})");
            }
        }

        // 3. Room Photos
        $this->info('Processing Room Photos...');
        foreach (RoomPhoto::all() as $rp) {
            [$newUrl, $status] = $processFile($rp->photo, 'rooms');
            if ($status === 'success') {
                $rp->update(['photo' => $newUrl]);
                $this->line(" - RoomPhoto #{$rp->id} migrated -> {$newUrl}");
                $migratedCount++;
            } elseif ($status === 'already_supabase') {
                $skippedCount++;
            } else {
                $this->warn(" - RoomPhoto #{$rp->id} skipped ({$status})");
            }
        }

        // 4. User Avatars
        $this->info('Processing User Avatars...');
        foreach (User::whereNotNull('avatar')->get() as $user) {
            [$newUrl, $status] = $processFile($user->avatar, "avatar/{$user->id}");
            if ($status === 'success') {
                $user->update(['avatar' => $newUrl]);
                $this->line(" - User #{$user->id} avatar migrated -> {$newUrl}");
                $migratedCount++;
            } elseif ($status === 'already_supabase') {
                $skippedCount++;
            } else {
                $this->warn(" - User #{$user->id} avatar skipped ({$status})");
            }
        }

        // 5. Partner Documents
        $this->info('Processing Partner Documents...');
        foreach (PartnerDocument::all() as $doc) {
            [$newUrl, $status] = $processFile($doc->file_path, "partners/{$doc->partner_application_id}");
            if ($status === 'success') {
                $doc->update(['file_path' => $newUrl]);
                $this->line(" - PartnerDocument #{$doc->id} migrated -> {$newUrl}");
                $migratedCount++;
            } elseif ($status === 'already_supabase') {
                $skippedCount++;
            } else {
                $this->warn(" - PartnerDocument #{$doc->id} skipped ({$status})");
            }
        }

        $this->info("Migration completed! Total migrated: {$migratedCount}, skipped: {$skippedCount}, failed: {$failedCount}");
        return 0;
    }
}
