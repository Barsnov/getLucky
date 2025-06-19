<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CardAction extends Model
{
    //
    protected $fillable = [
        'action',
        'points'
    ];

    public function specializations(){
        return $this->belongsToMany(Specialization::class,'card_action_specializations');
    }
}
