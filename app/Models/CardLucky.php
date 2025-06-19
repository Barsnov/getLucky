<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CardLucky extends Model
{
    //
    protected $fillable = [
        'points'
    ];

    public function specializations(){
        return $this->belongsToMany(Specialization::class,'card_lucky_specializations');
    }
}
