<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>E-Ticket - {{ $booking->booking_code }}</title>
    <style>
        body { 
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
            color: #1e1b16; 
            padding: 20px; 
            background-color: #ffffff;
        }
        .header { 
            background-color: #778873; 
            color: white; 
            padding: 20px; 
            text-align: center; 
            border-radius: 8px; 
        }
        .code { 
            font-size: 22px; 
            font-weight: bold; 
            color: #778873; 
            margin-top: 5px; 
            letter-spacing: 1px;
        }
        .box { 
            border: 1px solid #DCCFC0; 
            padding: 15px; 
            border-radius: 8px; 
            margin-top: 15px; 
            background: #fff8f0; 
            text-align: center;
        }
        .table { 
            width: 100%; 
            margin-top: 15px; 
            border-collapse: collapse; 
        }
        .table td { 
            padding: 10px 8px; 
            border-bottom: 1px dashed #DCCFC0; 
            vertical-align: top;
        }
        .label { 
            font-size: 10px; 
            color: #747871; 
            text-transform: uppercase; 
            font-weight: bold; 
            margin-bottom: 3px;
        }
        .value { 
            font-size: 13px; 
            font-weight: bold; 
            color: #1e1b16; 
        }
        .sub-value {
            font-size: 12px;
            color: #444842;
            margin-top: 2px;
        }
        .badge-other {
            display: inline-block;
            background-color: #e8e2d9;
            color: #778873;
            font-size: 9px;
            padding: 2px 6px;
            border-radius: 4px;
            margin-left: 4px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1 style="margin: 0; font-size: 24px; letter-spacing: 1px;">H'LEVEN RESORT & HOTEL</h1>
        <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.9;">E-Ticket & Booking Confirmation</p>
    </div>

    <div class="box">
        <div class="label">Kode Booking</div>
        <div class="code">{{ $booking->booking_code }}</div>
        @if($booking->eTicket && $booking->eTicket->qr_code)
            <div style="margin-top: 15px;">
                <img src="data:image/svg+xml;base64,{{ base64_encode(SimpleSoftwareIO\QrCode\Facades\QrCode::format('svg')->size(140)->generate($booking->eTicket->qr_code)) }}" alt="QR Code">
            </div>
        @endif
    </div>

    <table class="table">
        <tr>
            <td style="width: 50%;">
                <div class="label">Hotel</div>
                <div class="value">{{ $booking->hotel->name ?? "H'Leven Hotel" }}</div>
            </td>
            <td style="width: 50%;">
                <div class="label">Status Reservasi</div>
                <div class="value" style="color: #4F6F52;">{{ strtoupper($booking->status) }}</div>
            </td>
        </tr>

        <!-- PEMISAHAN DATA PEMESAN DAN TAMU MENGINAP -->
        <tr>
            <td style="width: 50%;">
                <div class="label">Data Pemesan (Kontak)</div>
                <div class="value">{{ $booking->booker_name ?? '-' }}</div>
                <div class="sub-value">{{ $booking->booker_email ?? '-' }}</div>
                <div class="sub-value">{{ $booking->booker_phone ?? '-' }}</div>
            </td>
            <td style="width: 50%;">
                <div class="label">
                    Data Tamu Menginap 
                    @if($booking->is_for_other_guest)
                        <span class="badge-other">Orang Lain</span>
                    @endif
                </div>
                <div class="value">{{ $booking->staying_guest_name ?? '-' }}</div>
                <div class="sub-value">{{ $booking->staying_guest_email ?? '-' }}</div>
                <div class="sub-value">{{ $booking->staying_guest_phone ?? '-' }}</div>
            </td>
        </tr>

        <tr>
            <td style="width: 50%;">
                <div class="label">Tipe Kamar</div>
                <div class="value">
                    {{ $booking->bookingRooms->first()->roomType->name ?? 'Standard Room' }}
                    ({{ $booking->bookingRooms->sum('qty') }} Kamar)
                </div>
            </td>
            <td style="width: 50%;">
                <div class="label">Durasi Menginap</div>
                <div class="value">{{ $booking->total_night }} Malam</div>
            </td>
        </tr>

        <tr>
            <td style="width: 50%;">
                <div class="label">Tanggal Check-in</div>
                <div class="value">{{ \Carbon\Carbon::parse($booking->check_in)->format('d M Y') }}</div>
            </td>
            <td style="width: 50%;">
                <div class="label">Tanggal Check-out</div>
                <div class="value">{{ \Carbon\Carbon::parse($booking->check_out)->format('d M Y') }}</div>
            </td>
        </tr>

        @if($booking->special_request)
        <tr>
            <td colspan="2">
                <div class="label">Permintaan Khusus</div>
                <div class="sub-value" style="font-style: italic;">"{{ $booking->special_request }}"</div>
            </td>
        </tr>
        @endif

        <tr>
            <td colspan="2" style="border-bottom: none; background-color: #FAF6F0; padding: 12px; border-radius: 6px;">
                <div class="label">Total Pembayaran</div>
                <div class="value" style="font-size: 18px; color: #778873; margin-top: 2px;">
                    Rp {{ number_format($booking->grand_total, 0, ',', '.') }}
                </div>
            </td>
        </tr>
    </table>

    <div style="margin-top: 30px; text-align: center; font-size: 11px; color: #747871; font-style: italic; line-height: 1.5;">
        Harap tunjukkan E-Ticket ini (digital atau cetak) beserta identitas resmi (KTP/Paspor) atas nama <strong>{{ $booking->staying_guest_name }}</strong> saat proses check-in.
    </div>
</body>
</html>