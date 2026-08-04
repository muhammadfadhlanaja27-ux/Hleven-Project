<?php

namespace App\Enums;

enum BookingStatus: string
{
    case PENDING = 'Pending';

    case UNPAID = 'Unpaid';

    case PAID = 'Paid';

    case CHECKED_IN = 'Checked_In';

    case CHECKED_OUT = 'Checked_Out';

    case CANCELLED = 'Cancelled';

    case EXPIRED = 'Expired';
}