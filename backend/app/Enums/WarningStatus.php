<?php

namespace App\Enums;

enum WarningStatus: string
{
    case UNREAD = 'Unread';

    case READ = 'Read';

    case CLOSED = 'Closed';
}