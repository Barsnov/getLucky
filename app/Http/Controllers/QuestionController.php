<?php

namespace App\Http\Controllers;

use App\Models\CardAction;
use App\Models\CardDecide;
use App\Models\CardFound;
use App\Models\CardLucky;
use App\Models\CardQuestion;
use App\Models\CardTF;
use App\Models\CardWord;
use App\Models\Question;
use Illuminate\Http\Request;

class QuestionController extends Controller
{
    /**
     * Display a listing of the resource.
     */

    public function getQuestions($specialization){
        //Автоматические, рандомные карточки
        $lucky = CardLucky::whereHas('specializations', fn($q) => $q->where('id', $specialization))->get();
        $action = CardAction::whereHas('specializations', fn($q) => $q->where('id', $specialization))->get();
        //Карточки для захвата клеток
        $questions = CardQuestion::whereHas('specializations', fn($q) => $q->where('id', $specialization))->get();
        $tf = CardTF::whereHas('specializations', fn($q) => $q->where('id', $specialization))->get();
        $decide = CardDecide::whereHas('specializations', fn($q) => $q->where('id', $specialization))->get();
        //Карточки дуэли
        $word = CardWord::whereHas('specializations', fn($q) => $q->where('id', $specialization))->get();
        $cardFound = CardFound::whereHas('specializations', fn($q) => $q->where('id', $specialization))->get();
        return response()->json([
            'lucky' => $lucky,
            'action' => $action,
            'questions' => $questions,
            'tf' => $tf,
            'decide' => $decide,
            'word' => $word,
            'found' => $cardFound,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Question $question)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Question $question)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Question $question)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Question $question)
    {
        //
    }
}
