<?php

namespace App\Enums;

enum UserRole: string
{
    case USER = 'user';

    case ADMIN_HOTEL = 'admin_hotel';

    case SUPER_ADMIN = 'super_admin';
}