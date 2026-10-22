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

    /*
    | Batas waktu refund: berapa jam sebelum check-in refund ditutup.
    | Di dalam batas ini booking tetap bisa dibatalkan, tetapi dana hangus.
    */
    'refund_cutoff_hours' => (int) env('HLEVEN_REFUND_CUTOFF_HOURS', 24),

    /*
    | Jam check-in yang dipakai untuk menghitung cutoff refund.
    | Tabel bookings hanya menyimpan tanggal check-in, bukan jam.
    */
    'checkin_hour' => (int) env('HLEVEN_CHECKIN_HOUR', 14),

    /*
    | Timezone yang dipakai untuk perhitungan cutoff refund.
    */
    'refund_timezone' => env('HLEVEN_REFUND_TIMEZONE', 'Asia/Jakarta'),

];
