<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Specialization extends Model
{
    //
    use HasFactory;

    protected $fillable = ['name', 'method'];
    public function cardActions()
    {
        return $this->belongsToMany(CardAction::class, 'card_action_specializations');
    }
    public function cardDecides()
    {
        return $this->belongsToMany(CardDecide::class, 'card_decide_specializations');
    }

    public function cardFounds()
    {
        return $this->belongsToMany(CardFound::class, 'card_found_specializations');
    }

    public function cardLuckies()
    {
        return $this->belongsToMany(CardLucky::class, 'card_lucky_specializations');
    }

    public function cardQuestions()
    {
        return $this->belongsToMany(CardQuestion::class, 'card_question_specializations');
    }

    public function cardWords()
    {
        return $this->belongsToMany(CardWord::class, 'card_word_specializations');
    }

    public function cardTFS()
    {
        return $this->belongsToMany(CardTF::class, 'card_t_f_specializations');
    }
}
