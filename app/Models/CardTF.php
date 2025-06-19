<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CardTF extends Model
{
    //
    protected $fillable = [
        'question',
        'answer',
        'explanation',
        'points'
    ];
    protected $casts = [
        'answer' => 'boolean',
    ];

    public function specializations(){
        return $this->belongsToMany(Specialization::class,'card_t_f_specializations');
    }
}
