<?php

return [

    /*
    | Komisi platform atas setiap transaksi sukses (0.05 = 5%).
    */
    'commission_rate' => (float) env('HLEVEN_COMMISSION_RATE', 0.05),

    /*
    | Nominal minimal pengajuan pencairan dana.
    */
    'min_payout' => (float) env('HLEVEN_MIN_PAYOUT', 50000),

    /*
    | Auto-approve pengajuan pencairan (tanpa persetujuan super admin).
    */
    'auto_approve_payout' => (bool) env('HLEVEN_AUTO_APPROVE_PAYOUT', false),

    /*
    | Batas total pengajuan per hotel per hari yang boleh auto-approve.
    | Pengajuan yang melewati batas ini otomatis kembali ke status pending.
    */
    'auto_approve_daily_limit' => (float) env('HLEVEN_AUTO_APPROVE_DAILY_LIMIT', 5000000),

];
