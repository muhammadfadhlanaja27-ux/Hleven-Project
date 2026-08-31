<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PartnerApplication;
use App\Models\PartnerDocument;
use App\Models\User;
use App\Services\PartnerApplicationService;
use App\Services\FileStorageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class PartnerApplicationController extends Controller
{
    protected PartnerApplicationService $partnerService;
    protected FileStorageService $storageService;

    public function __construct(
        PartnerApplicationService $partnerService,
        FileStorageService $storageService
    ) {
        $this->partnerService = $partnerService;
        $this->storageService = $storageService;
    }

    public function checkEmail(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email|max:255',
        ]);

        $userId = $request->user()?->id;
        $query = User::where('email', $request->email);
        if ($userId) {
            $query->where('id', '!=', $userId);
        }
        $exists = $query->exists();

        return response()->json([
            'success' => true,
            'available' => !$exists,
            'message' => $exists ? 'Email ini sudah terpakai.' : 'Email tersedia.',
        ], 200);
    }

    /**
     * GET /api/v1/user/partner-application
     * Mengambil data pengajuan milik user yang sedang login
     */
    public function index(Request $request): JsonResponse
    {
        $query = PartnerApplication::with(['documents', 'user:id,name,email'])
            ->orderBy('created_at', 'desc');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('owner_name', 'like', "%{$search}%")
                    ->orWhere('hotel_name', 'like', "%{$search}%")
                    ->orWhere('owner_email', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $applications = $query->get();

        return response()->json([
            'success' => true,
            'data' => $applications
        ], 200);
    }

    public function getUserApplication(Request $request): JsonResponse
    {
        $application = PartnerApplication::with('documents')
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->first();

        return response()->json([
            'success' => true,
            'data' => $application
        ], 200);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'hotel_name' => 'required|string|max:255',
            'hotel_type' => 'required|string|max:100',
            'hotel_description' => 'required|string',
            'hotel_phone' => 'required|string|max:30',
            'hotel_email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($request->user()?->id)],
            'room_count' => 'required|integer|min:1',

            'address' => 'required|string',
            'province' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'district' => 'required|string|max:255',
            'postal_code' => 'required|string|max:20',
            'maps_url' => 'nullable|url|max:500',
            'latitude' => 'nullable|string|max:50',
            'longitude' => 'nullable|string|max:50',

            'owner_name' => 'required|string|max:255',
            'owner_email' => 'required|email|max:255',
            'owner_phone' => 'required|string|max:30',
            'owner_id_number' => 'required|string|max:50',

            'bank_name' => 'required|string|max:255',
            'bank_account_number' => 'required|string|max:50',
            'bank_account_name' => 'required|string|max:255',

            'doc_ktp' => 'required|file|mimes:pdf,jpg,jpeg,png,webp|max:10240',
            'doc_legal' => 'required|file|mimes:pdf,jpg,jpeg,png,webp|max:10240',
            'doc_support' => 'nullable|file|mimes:pdf,jpg,jpeg,png,webp|max:10240',
        ], [
            'hotel_email.unique' => 'Email ini sudah terpakai pada akun yang ada. Silakan gunakan email lain.',
        ]);

        $existing = PartnerApplication::where('user_id', $request->user()->id)
            ->whereIn('status', ['pending', 'under_review', 'needs_revision'])
            ->exists();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'Anda sudah memiliki pengajuan mitra yang sedang diproses.'
            ], 400);
        }

        DB::beginTransaction();
        try {
            $application = PartnerApplication::create([
                'user_id' => $request->user()->id,
                'hotel_name' => $validated['hotel_name'],
                'hotel_type' => $validated['hotel_type'],
                'hotel_description' => $validated['hotel_description'],
                'hotel_phone' => $validated['hotel_phone'],
                'hotel_email' => $validated['hotel_email'],
                'room_count' => $validated['room_count'],
                'address' => $validated['address'],
                'province' => $validated['province'],
                'city' => $validated['city'],
                'district' => $validated['district'],
                'postal_code' => $validated['postal_code'],
                'maps_url' => $validated['maps_url'] ?? null,
                'latitude' => $validated['latitude'] ?? null,
                'longitude' => $validated['longitude'] ?? null,
                'owner_name' => $validated['owner_name'],
                'owner_email' => $validated['owner_email'],
                'owner_phone' => $validated['owner_phone'],
                'owner_id_number' => $validated['owner_id_number'],
                'bank_name' => $validated['bank_name'],
                'bank_account_number' => $validated['bank_account_number'],
                'bank_account_name' => $validated['bank_account_name'],
                'status' => 'pending',
            ]);

            $docMap = [
                'doc_ktp' => 'ktp',
                'doc_legal' => 'legalitas',
                'doc_support' => 'pendukung',
            ];

            foreach ($docMap as $field => $docType) {
                if ($request->hasFile($field)) {
                    $dir = "partners/{$application->id}";
                    $path = $this->storageService->uploadFile($request->file($field), $dir);
                    PartnerDocument::create([
                        'partner_application_id' => $application->id,
                        'document_type' => $docType,
                        'file_path' => $path,
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Pengajuan mitra berhasil dikirim.',
                'data' => [
                    'id' => $application->id,
                    'application_number' => $application->application_number,
                    'status' => $application->status,
                    'created_at' => $application->created_at,
                    'hotel_name' => $application->hotel_name,
                ]
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengirim pengajuan mitra.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function approve(Request $request, $id): JsonResponse
    {
        try {
            $application = PartnerApplication::findOrFail($id);
            $this->partnerService->approveApplication($application, $request->user());

            return response()->json([
                'success' => true,
                'message' => 'Partner berhasil disetujui.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyetujui partner.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function reject(Request $request, $id): JsonResponse
    {
        $request->validate(['reason' => 'required|string']);

        try {
            $application = PartnerApplication::findOrFail($id);
            $this->partnerService->rejectApplication($application, $request->user(), $request->reason);

            $application->update(['rejection_reason' => $request->reason]);

            return response()->json([
                'success' => true,
                'message' => 'Pengajuan partner ditolak.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menolak partner.'
            ], 500);
        }
    }
}