<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentPolicy extends Model
{
    use HasFactory;

    protected $fillable = [
        'policy_type',
        'name',
        'description',
        'value',
        'is_active',
    ];
}
