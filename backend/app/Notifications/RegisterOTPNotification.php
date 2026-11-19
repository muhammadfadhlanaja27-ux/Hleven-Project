<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class RegisterOTPNotification extends Notification
{
    public function __construct(public string $otp) {}

    /**
     * Tentukan saluran pengiriman notifikasi.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Representasi pesan email untuk verifikasi pendaftaran (OTP).
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Kode Verifikasi Pendaftaran H'Leven")
            ->line('Terima kasih telah mendaftar di H\'Leven Resort.')
            ->line('Gunakan kode OTP berikut untuk memverifikasi alamat email Anda:')
            ->line('Kode OTP: '.$this->otp)
            ->line('Kode ini berlaku selama 10 menit.')
            ->line('Jika Anda tidak merasa melakukan pendaftaran ini, abaikan email ini.');
    }

    /**
     * Representasi notifikasi dalam bentuk array.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
