<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CardQuestion extends Model
{
    //
    protected $fillable = [
        'question',
        'answer',
        'explanation',
        'points'
    ];

    public function specializations(){
        return $this->belongsToMany(Specialization::class,'card_question_specializations');
    }
}
