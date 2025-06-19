<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CardFound extends Model
{
    //
    protected $fillable = [
        'question',
        'urlQuestion',
        'urlAnswer'
    ];

    public function specializations(){
        return $this->belongsToMany(Specialization::class,'card_found_specializations');
    }
}
