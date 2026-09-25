<?php

namespace App\Http\Controllers;

use App\Models\Appeal;
use App\Models\Hotel;
use App\Models\Notification;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
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
        $request->validate(['reason' => 'required|string|min:10|max:2000', 'warning_id' => 'nullable|exists:warnings,id']);
        $user = $request->user();
        $hotel = $user->hotel ?? $user->hotels()->first();
        if (!$hotel) return response()->json(['success' => false, 'message' => 'Hotel tidak ditemukan'], 404);
        if ($hotel->status !== 'blocked') return response()->json(['success' => false, 'message' => 'Hotel tidak dalam status diblokir'], 400);
        $hasPending = Appeal::where('hotel_id', $hotel->id)->where('status', 'pending')->exists();
        if ($hasPending) return response()->json(['success' => false, 'message' => 'Masih ada banding pending'], 400);

        $appeal = Appeal::create([
            'hotel_id' => $hotel->id,
            'warning_id' => $request->warning_id,
            'admin_hotel_id' => $user->id,
            'reason' => $request->reason,
            'status' => 'pending',
        ]);

        Notification::create(['user_id' => $user->id, 'title' => 'Banding Dikirim', 'message' => 'Banding untuk '.$hotel->name.' dikirim ke Super Admin.', 'type' => 'appeal', 'is_read' => false]);

        return response()->json(['success' => true, 'message' => 'Banding berhasil diajukan', 'data' => $appeal], 201);
    }

    public function indexSuperAdmin(Request $request): JsonResponse
    {
        $query = Appeal::with(['hotel', 'warning', 'requester'])->latest();
        if ($request->status) $query->where('status', $request->status);
        $appeals = $query->paginate($request->get('per_page', 10));
        return response()->json(['success' => true, 'data' => $appeals]);
    }

    public function updateStatus(Request $request, $id): JsonResponse
    {
        $request->validate(['status' => 'required|in:approved,rejected', 'admin_note' => 'nullable|string|max:1000']);
        $appeal = Appeal::with('hotel')->findOrFail($id);
        if ($appeal->status !== 'pending') return response()->json(['success' => false, 'message' => 'Banding sudah diproses'], 400);

        return DB::transaction(function () use ($request, $appeal) {
            $appeal->update(['status' => $request->status, 'admin_note' => $request->admin_note, 'decided_by' => $request->user()->id, 'decided_at' => now()]);
            if ($request->status === 'approved') {
                $appeal->hotel->update(['status' => 'active']);
                Notification::create(['user_id' => $appeal->admin_hotel_id, 'title' => 'Banding Disetujui', 'message' => 'Banding untuk '.$appeal->hotel->name.' disetujui. Hotel kembali aktif.', 'type' => 'appeal', 'is_read' => false]);
            } else {
                Notification::create(['user_id' => $appeal->admin_hotel_id, 'title' => 'Banding Ditolak', 'message' => 'Banding untuk '.$appeal->hotel->name.' ditolak.'.($request->admin_note ? ' Catatan: '.$request->admin_note : ''), 'type' => 'appeal', 'is_read' => false]);
            }
            ActivityLog::create(['user_id' => $request->user()->id, 'activity' => 'Decide Appeal', 'description' => "Super Admin {$request->status} banding #{$appeal->id} hotel {$appeal->hotel->name}", 'ip_address' => $request->ip()]);
            return response()->json(['success' => true, 'message' => $request->status === 'approved' ? 'Banding disetujui, hotel aktif kembali' : 'Banding ditolak', 'data' => $appeal->fresh()]);
        });
    }
}
