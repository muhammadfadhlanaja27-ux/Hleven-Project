<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { width: 80%; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; }
        .header { background: #778873; color: white; padding: 10px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 20px; }
        .footer { text-align: center; font-size: 12px; color: #777; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>H'Leven Resort & Hotel</h1>
        </div>
        <div class="content">
            <p>Halo <strong>{{ $booking->guests->first()->name ?? $booking->user->name }}</strong>,</p>
            <p>Selamat! Pemesanan Anda di <strong>{{ $booking->hotel->name }}</strong> telah berhasil dikonfirmasi dan dibayar.</p>
            <p>Berikut adalah detail pemesanan Anda:</p>
            <ul>
                <li><strong>Kode Booking:</strong> {{ $booking->booking_code }}</li>
                <li><strong>Check-in:</strong> {{ $booking->check_in }}</li>
                <li><strong>Check-out:</strong> {{ $booking->check_out }}</li>
                <li><strong>Tipe Kamar:</strong> {{ $booking->bookingRooms->first()->roomType->name ?? '-' }}</li>
            </ul>
            <p>Kami telah melampirkan E-Ticket PDF pada email ini. Harap tunjukkan E-Ticket tersebut saat proses check-in.</p>
            <p>Kami sangat menantikan kedatangan Anda!</p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} H'Leven Resort. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
