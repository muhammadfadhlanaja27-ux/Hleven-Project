<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Appeal;
use App\Models\Hotel;
use App\Models\Notification;
use App\Models\User;
use App\Models\Warning;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AppealController extends Controller
{
    public function indexAdmin(Request $request): JsonResponse
    {
        $user = $request->user();
        $hotelIds = Hotel::where('admin_id', $user->id)->pluck('id');
        $appeals = Appeal::with(['hotel', 'warning'])->whereIn('hotel_id', $hotelIds)->latest()->paginate($request->get('per_page', 10));

        return response()->json(['success' => true, 'data' => $appeals]);
    }

    public function storeAdmin(Request $request): JsonResponse
    {
        $request->validate([
            'reason' => 'required|string|min:10|max:2000',
            'warning_id' => 'nullable|exists:warnings,id',
        ]);
        $user = $request->user();
        $hotel = $user->hotel ?? $user->hotels()->first();
        if (! $hotel) {
            return response()->json(['success' => false, 'message' => 'Hotel tidak ditemukan'], 404);
        }

        if ($request->filled('warning_id')) {
            $warning = Warning::findOrFail($request->warning_id);
            if ($warning->hotel_id !== $hotel->id) {
                return response()->json(['success' => false, 'message' => 'Peringatan tidak sesuai dengan hotel Anda'], 403);
            }
            if ($warning->status === 'closed') {
                return response()->json(['success' => false, 'message' => 'Peringatan ini sudah selesai/ditutup'], 400);
            }
            $hasPendingWarningAppeal = Appeal::where('warning_id', $warning->id)
                ->where('status', 'pending')
                ->exists();
            if ($hasPendingWarningAppeal) {
                return response()->json(['success' => false, 'message' => 'Banding untuk peringatan ini sedang ditinjau'], 400);
            }
        } else {
            if ($hotel->status !== 'blocked') {
                return response()->json(['success' => false, 'message' => 'Hotel tidak dalam status diblokir'], 400);
            }
            $hasPendingSuspendAppeal = Appeal::where('hotel_id', $hotel->id)
                ->whereNull('warning_id')
                ->where('status', 'pending')
                ->exists();
            if ($hasPendingSuspendAppeal) {
                return response()->json(['success' => false, 'message' => 'Masih ada banding pemulihan hotel yang pending'], 400);
            }
        }

        return DB::transaction(function () use ($request, $user, $hotel) {
            $appeal = Appeal::create([
                'hotel_id' => $hotel->id,
                'warning_id' => $request->warning_id,
                'admin_hotel_id' => $user->id,
                'reason' => $request->reason,
                'status' => 'pending',
            ]);

            $isWarningAppeal = ! empty($request->warning_id);
            $subject = $isWarningAppeal ? "Peringatan #WRN-{$request->warning_id}" : "Pemulihan Akun {$hotel->name}";

            // Notifikasi ke Admin Hotel
            Notification::create([
                'user_id' => $user->id,
                'title' => 'Banding Dikirim',
                'message' => "Banding {$subject} telah dikirim ke Super Admin.",
                'type' => 'appeal',
                'is_read' => false,
            ]);

            // Notifikasi ke semua Super Admin
            $superAdmins = User::where('role', 'super_admin')->pluck('id');
            foreach ($superAdmins as $saId) {
                Notification::create([
                    'user_id' => $saId,
                    'title' => $isWarningAppeal ? 'Banding Peringatan Baru' : 'Banding Pemulihan Hotel Baru',
                    'message' => "Hotel {$hotel->name} mengajukan banding {$subject}.",
                    'type' => 'appeal',
                    'is_read' => false,
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Banding berhasil diajukan',
                'data' => $appeal->load(['hotel', 'warning']),
            ], 201);
        });
    }

    public function indexSuperAdmin(Request $request): JsonResponse
    {
        $query = Appeal::with(['hotel', 'warning', 'requester'])->latest();
        if ($request->status) {
            $query->where('status', $request->status);
        }
        $appeals = $query->paginate($request->get('per_page', 10));

        return response()->json(['success' => true, 'data' => $appeals]);
    }

    public function updateStatus(Request $request, $id): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:approved,rejected',
            'admin_note' => 'nullable|string|max:1000',
        ]);
        $appeal = Appeal::with(['hotel', 'warning'])->findOrFail($id);
        if ($appeal->status !== 'pending') {
            return response()->json(['success' => false, 'message' => 'Banding sudah diproses'], 400);
        }

        return DB::transaction(function () use ($request, $appeal) {
            $appeal->update([
                'status' => $request->status,
                'admin_note' => $request->admin_note,
                'decided_by' => $request->user()->id,
                'decided_at' => now(),
            ]);

            $hotel = $appeal->hotel;
            $noteSuffix = $request->admin_note ? ' Catatan: '.$request->admin_note : '';

            if ($appeal->warning_id && $appeal->warning) {
                // Banding Peringatan Satuan
                if ($request->status === 'approved') {
                    $appeal->warning->update(['status' => 'closed']);

                    if ($hotel && $hotel->status === 'blocked') {
                        $remainingActive = Warning::where('hotel_id', $hotel->id)
                            ->whereIn('status', ['unread', 'read'])
                            ->count();
                        if ($remainingActive < 2) {
                            $hotel->update(['status' => 'active']);
                        }
                    }

                    Notification::create([
                        'user_id' => $appeal->admin_hotel_id,
                        'title' => 'Banding Peringatan Disetujui',
                        'message' => "Banding untuk peringatan '{$appeal->warning->title}' disetujui. Peringatan telah dibatalkan.{$noteSuffix}",
                        'type' => 'appeal',
                        'is_read' => false,
                    ]);
                } else {
                    Notification::create([
                        'user_id' => $appeal->admin_hotel_id,
                        'title' => 'Banding Peringatan Ditolak',
                        'message' => "Banding untuk peringatan '{$appeal->warning->title}' ditolak.{$noteSuffix}",
                        'type' => 'appeal',
                        'is_read' => false,
                    ]);
                }
            } else {
                // Banding Suspend / Pemulihan Hotel
                if ($request->status === 'approved') {
                    if ($hotel) {
                        $hotel->update(['status' => 'active']);
                        Warning::where('hotel_id', $hotel->id)
                            ->whereIn('status', ['unread', 'read'])
                            ->update(['status' => 'closed']);
                    }

                    Notification::create([
                        'user_id' => $appeal->admin_hotel_id,
                        'title' => 'Banding Disetujui',
                        'message' => "Banding untuk {$hotel?->name} disetujui. Hotel kembali aktif.{$noteSuffix}",
                        'type' => 'appeal',
                        'is_read' => false,
                    ]);
                } else {
                    Notification::create([
                        'user_id' => $appeal->admin_hotel_id,
                        'title' => 'Banding Ditolak',
                        'message' => "Banding untuk {$hotel?->name} ditolak.{$noteSuffix}",
                        'type' => 'appeal',
                        'is_read' => false,
                    ]);
                }
            }

            ActivityLog::create([
                'user_id' => $request->user()->id,
                'activity' => 'Decide Appeal',
                'description' => "Super Admin {$request->status} banding #{$appeal->id} hotel {$hotel?->name}",
                'ip_address' => $request->ip(),
            ]);

            return response()->json([
                'success' => true,
                'message' => $request->status === 'approved' ? 'Banding disetujui' : 'Banding ditolak',
                'data' => $appeal->fresh(['hotel', 'warning']),
            ]);
        });
    }
}
