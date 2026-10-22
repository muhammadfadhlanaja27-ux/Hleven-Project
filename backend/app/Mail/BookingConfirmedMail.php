<?php

namespace App\Mail;

use App\Models\Booking;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BookingConfirmedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Booking $booking,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Konfirmasi Pemesanan H'Leven - " . $this->booking->booking_code,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.booking_confirmed',
        );
    }

    public function attachments(): array
    {
        $pdf = Pdf::loadView('pdf.e-ticket', ['booking' => $this->booking]);

        return [
            Attachment::fromData(fn () => $pdf->output(), "E-Ticket-{$this->booking->booking_code}.pdf")
                ->withMime('application/pdf'),
        ];
    }
}
