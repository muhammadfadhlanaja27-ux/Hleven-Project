<?php

namespace App\Enums;

enum HotelStatus: string
{
    case ACTIVE = 'Active';

    case BLOCKED = 'Blocked';
}