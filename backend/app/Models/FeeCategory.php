<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FeeCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'amount',
        'is_active',
    ];

    public function feeStructures()
    {
        return $this->hasMany(FeeStructure::class);
    }
}
