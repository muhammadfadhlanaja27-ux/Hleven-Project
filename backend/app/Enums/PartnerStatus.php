<?php

namespace App\Enums;

enum PartnerStatus: string
{
    case PENDING = 'Pending';

    case APPROVED = 'Approved';

    case REJECTED = 'Rejected';
}