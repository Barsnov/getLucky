<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CardWord extends Model
{
    //
    protected $fillable = [
        'word',
        'explanation',
        'words'
    ];

    protected $casts = [
        'words' => 'array',
    ];

    public function specializations(){
        return $this->belongsToMany(Specialization::class,'card_word_specializations');
    }
}
