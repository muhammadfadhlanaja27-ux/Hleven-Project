<?php

namespace App\Enums;

enum UserStatus: string
{
    case ACTIVE = 'Active';

    case INACTIVE = 'Inactive';

    case BLOCKED = 'Blocked';
}