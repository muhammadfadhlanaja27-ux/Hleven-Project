<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice Pencairan - {{ $payout->id }}</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e1b16; padding: 20px; }
        .header { background-color: #778873; color: white; padding: 20px; text-align: center; border-radius: 8px; }
        .code { font-size: 20px; font-weight: bold; color: #778873; margin-top: 5px; }
        .box { border: 1px solid #DCCFC0; padding: 15px; border-radius: 8px; margin-top: 15px; background: #fff8f0; }
        .table { width: 100%; margin-top: 15px; border-collapse: collapse; }
        .table td { padding: 8px 0; border-bottom: 1px dashed #DCCFC0; }
        .table .total td { border-bottom: none; border-top: 2px solid #778873; font-weight: bold; }
        .label { font-size: 11px; color: #747871; text-transform: uppercase; font-weight: bold; }
        .value { font-size: 14px; font-weight: bold; color: #1e1b16; }
        .right { text-align: right; }
    </style>
</head>
<body>
    <div class="header">
        <h1 style="margin: 0; font-size: 24px;">H'LEVEN RESORT &amp; HOTEL</h1>
        <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.9;">Invoice Pencairan Dana Mitra</p>
    </div>

    <div class="box">
        <div class="label">No. Dokumen</div>
        <div class="code">PAY-{{ str_pad($payout->id, 6, '0', STR_PAD_LEFT) }}</div>
    </div>

    <table class="table">
        <tr>
            <td>
                <div class="label">Hotel</div>
                <div class="value">{{ $hotel->name ?? '-' }}</div>
            </td>
            <td class="right">
                <div class="label">Status</div>
                <div class="value" style="color: #4F6F52;">{{ strtoupper($payout->status) }}</div>
            </td>
        </tr>
        <tr>
            <td>
                <div class="label">Nominal Diajukan</div>
                <div class="value">Rp {{ number_format($payout->amount, 0, ',', '.') }}</div>
            </td>
            <td class="right">
                <div class="label">Tanggal Pengajuan</div>
                <div class="value">{{ optional($payout->requested_at)->format('d M Y') }}</div>
            </td>
        </tr>
        <tr>
            <td colspan="2">
                <div class="label">Rekening Tujuan</div>
                <div class="value">{{ $payout->bank_name }} - {{ $payout->bank_account_number }} ({{ $payout->bank_account_name }})</div>
            </td>
        </tr>
    </table>

    <table class="table">
        <tr>
            <td class="label">Total Pendapatan Bruto</td>
            <td class="right value">Rp {{ number_format($balance['gross_revenue'], 0, ',', '.') }}</td>
        </tr>
        <tr>
            <td class="label">Komisi Platform ({{ round($commissionRate * 100) }}%)</td>
            <td class="right value" style="color: #b45309;">- Rp {{ number_format($balance['platform_commission'], 0, ',', '.') }}</td>
        </tr>
        <tr>
            <td class="label">Pendapatan Bersih Hotel ({{ 100 - round($commissionRate * 100) }}%)</td>
            <td class="right value">Rp {{ number_format($balance['net_revenue'], 0, ',', '.') }}</td>
        </tr>
        <tr>
            <td class="label">Sudah Dicairkan</td>
            <td class="right value">Rp {{ number_format($balance['total_paid_out'], 0, ',', '.') }}</td>
        </tr>
        <tr>
            <td class="label">Saldo Tersedia</td>
            <td class="right value">Rp {{ number_format($balance['available_balance'], 0, ',', '.') }}</td>
        </tr>
    </table>

    @if($payout->reference || $payout->admin_note)
        <div class="box">
            @if($payout->reference)
                <div class="label">No. Referensi Transfer</div>
                <div class="value">{{ $payout->reference }}</div>
            @endif
            @if($payout->admin_note)
                <div class="label" style="margin-top: 8px;">Catatan</div>
                <div class="value" style="font-weight: normal;">{{ $payout->admin_note }}</div>
            @endif
        </div>
    @endif

    <div style="margin-top: 30px; text-align: center; font-size: 11px; color: #747871; font-style: italic;">
        Dokumen ini digenerate otomatis oleh sistem H'Leven.
    </div>
</body>
</html>
