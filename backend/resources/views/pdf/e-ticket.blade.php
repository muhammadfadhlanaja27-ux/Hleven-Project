<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>E-Ticket - {{ $booking->booking_code }}</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e1b16; padding: 20px; }
        .header { background-color: #778873; color: white; padding: 20px; text-align: center; border-radius: 8px; }
        .code { font-size: 22px; font-weight: bold; color: #778873; margin-top: 5px; }
        .box { border: 1px solid #DCCFC0; padding: 15px; border-radius: 8px; margin-top: 15px; background: #fff8f0; }
        .table { width: 100%; margin-top: 15px; border-collapse: collapse; }
        .table td { padding: 8px 0; border-bottom: 1px dashed #DCCFC0; }
        .label { font-size: 11px; color: #747871; text-transform: uppercase; font-weight: bold; }
        .value { font-size: 14px; font-weight: bold; color: #1e1b16; }
    </style>
</head>
<body>
    <div class="header">
        <h1 style="margin: 0; font-size: 24px;">H'LEVEN RESORT & HOTEL</h1>
        <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.9;">E-Ticket & Booking Confirmation</p>
    </div>

    <div class="box">
        <div class="label">Kode Booking</div>
        <div class="code">{{ $booking->booking_code }}</div>
    </div>

    <table class="table">
        <tr>
            <td>
                <div class="label">Hotel</div>
                <div class="value">{{ $booking->hotel->name ?? "H'Leven Hotel" }}</div>
            </td>
            <td>
                <div class="label">Status</div>
                <div class="value" style="color: #4F6F52;">{{ strtoupper($booking->status) }}</div>
            </td>
        </tr>
        <tr>
            <td>
                <div class="label">Tipe Kamar</div>
                <div class="value">{{ $booking->bookingRooms->first()->roomType->name ?? '-' }}</div>
            </td>
            <td>
                <div class="label">Tamu</div>
                <div class="value">{{ $booking->guests->first()->name ?? $booking->user->name }}</div>
            </td>
        </tr>
        <tr>
            <td>
                <div class="label">Check-in</div>
                <div class="value">{{ $booking->check_in }}</div>
            </td>
            <td>
                <div class="label">Check-out</div>
                <div class="value">{{ $booking->check_out }}</div>
            </td>
        </tr>
        <tr>
            <td colspan="2">
                <div class="label">Total Pembayaran</div>
                <div class="value" style="font-size: 18px; color: #778873;">
                    Rp {{ number_format($booking->grand_total, 0, ',', '.') }}
                </div>
            </td>
        </tr>
    </table>

    <div style="margin-top: 30px; text-align: center; font-size: 11px; color: #747871; font-style: italic;">
        Harap tunjukkan E-Ticket ini beserta kartu identitas fisik saat proses check-in.
    </div>
</body>
</html>