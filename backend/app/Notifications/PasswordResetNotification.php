<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PasswordResetNotification extends Notification
{
    use Queueable;

    public function __construct(public string $otp) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Kode Reset Password H'Leven")
            ->line('Kami menerima permintaan reset password untuk akun Anda.')
            ->line('Gunakan kode OTP berikut untuk melanjutkan proses reset:')
            ->line('Kode OTP: '.$this->otp)
            ->line('Kode ini berlaku selama 10 menit.')
            ->line('Jika Anda tidak merasa melakukan permintaan ini, abaikan email ini.');
    }

    /**
     * Get the array representation of the notification.
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
