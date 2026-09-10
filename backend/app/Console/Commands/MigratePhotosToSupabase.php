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

            $baseUrl = rtrim(config('filesystems.disks.s3.url'), '/');
            $bucket = trim((string) config('filesystems.disks.s3.bucket'));

            // Function to normalize any Supabase URL to valid public HTTP format
            $normalizeSupabaseUrl = function ($url) use ($bucket) {
                $publicUrl = str_replace(
                    ['.storage.supabase.co/storage/v1/s3', '/storage/v1/s3'],
                    ['.supabase.co/storage/v1/object/public', '/storage/v1/object/public'],
                    $url
                );
                if ($bucket !== '') {
                    $publicUrl = str_replace('/object/public/' . $bucket . '/' . $bucket . '/', '/object/public/' . $bucket . '/', $publicUrl);
                }
                return $publicUrl;
            };

            // If already on Supabase URL, check if normalization is needed
            if (str_contains($currentUrl, 'supabase.co')) {
                $normalized = $normalizeSupabaseUrl($currentUrl);
                if ($normalized !== $currentUrl) {
                    return [$normalized, 'normalized'];
                }
                return [$currentUrl, 'already_supabase'];
            }

            // Extract relative storage path
            $relativePath = ltrim(parse_url($currentUrl, PHP_URL_PATH) ?? $currentUrl, '/');
            if (str_starts_with($relativePath, 'storage/')) {
                $relativePath = substr($relativePath, 8);
            }

            // Check if file exists in local disk ('public')
            if (Storage::disk('public')->exists($relativePath)) {
                try {
                    $fileContents = Storage::disk('public')->get($relativePath);
                    $filename = basename($relativePath);
                    $targetPath = trim($directory, '/') . '/' . uniqid() . '_' . $filename;

                    // Put file to s3 disk
                    Storage::disk('s3')->put($targetPath, $fileContents);

                    // Build public Supabase URL
                    $newUrl = $normalizeSupabaseUrl($baseUrl . '/' . ltrim($targetPath, '/'));

                    return [$newUrl, 'success'];
                } catch (\Throwable $e) {
                    return [null, 'error: ' . $e->getMessage()];
                }
            }

            // If file is not found locally but is a relative path (e.g. room_types/foo.jpg or rooms/bar.jpg),
            // construct the expected Supabase public URL assuming it was uploaded directly to S3
            if (!str_starts_with($currentUrl, 'http://') && !str_starts_with($currentUrl, 'https://')) {
                $targetPath = ltrim($currentUrl, '/');
                if ($bucket !== '' && str_starts_with($targetPath, $bucket . '/')) {
                    $targetPath = substr($targetPath, strlen($bucket) + 1);
                }
                $constructedUrl = $normalizeSupabaseUrl($baseUrl . '/' . $targetPath);
                return [$constructedUrl, 'constructed_supabase'];
            }

            // If it starts with localhost URL (e.g. http://localhost:8000/storage/rooms/foo.jpg), extract path and convert to Supabase public URL
            if (str_contains($currentUrl, 'localhost:8000/storage/')) {
                $path = substr($currentUrl, strpos($currentUrl, '/storage/') + 9);
                $constructedUrl = $normalizeSupabaseUrl($baseUrl . '/' . ltrim($path, '/'));
                return [$constructedUrl, 'converted_localhost'];
            }

            return [null, 'not_found'];
        };

        // 1. Hotel Photos
        $this->info('Processing Hotel Photos...');
        foreach (HotelPhoto::all() as $hp) {
            [$newUrl, $status] = $processFile($hp->photo, 'hotels');
            if (in_array($status, ['success', 'normalized', 'constructed_supabase', 'converted_localhost'])) {
                $hp->update(['photo' => $newUrl]);
                $this->line(" - HotelPhoto #{$hp->id} updated ({$status}) -> {$newUrl}");
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
            if (in_array($status, ['success', 'normalized', 'constructed_supabase', 'converted_localhost'])) {
                $rp->update(['photo' => $newUrl]);
                $this->line(" - RoomPhoto #{$rp->id} updated ({$status}) -> {$newUrl}");
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
            if (in_array($status, ['success', 'normalized', 'constructed_supabase', 'converted_localhost'])) {
                $user->update(['avatar' => $newUrl]);
                $this->line(" - User #{$user->id} avatar updated ({$status}) -> {$newUrl}");
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
            if (in_array($status, ['success', 'normalized', 'constructed_supabase', 'converted_localhost'])) {
                $doc->update(['file_path' => $newUrl]);
                $this->line(" - PartnerDocument #{$doc->id} updated ({$status}) -> {$newUrl}");
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
