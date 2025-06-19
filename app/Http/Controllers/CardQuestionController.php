<?php

namespace App\Http\Controllers;

use App\Models\CardQuestion;
use App\Models\Specialization;
use Illuminate\Http\Request;

class CardQuestionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function getQuestion()
    {
        $cardQuestions = CardQuestion::with('specializations')->get();
        return response()->json($cardQuestions);
    }

    public function addQuestion(Request $request)
    {
        $cardQuestion = CardQuestion::create([
            'question' => $request->question,
            'answer' => $request->answer,
            'explanation' => $request->explanation,
            'points' => $request->points,
        ]);

        $specs = in_array(0, $request->specializations)
            ? Specialization::pluck('id')->toArray()
            : $request->specializations;

        $cardQuestion->specializations()->attach($specs);
        return redirect()->back();
    }

    public function putQuestion(Request $request, CardQuestion $cardQuestion)
    {
        $cardQuestion->update([
            'question' => $request->question,
            'answer' => $request->answer,
            'explanation' => $request->explanation,
            'points' => $request->points,
        ]);

        $specs = in_array(0, $request->specializations)
            ? Specialization::pluck('id')->toArray()
            : $request->specializations;

        $cardQuestion->specializations()->sync($specs);

        return redirect()->back();
    }

    public function deleteQuestion(CardQuestion $cardQuestion)
    {
        $cardQuestion->specializations()->detach();
        $cardQuestion->delete();

        return redirect()->back();
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
    public function show(CardQuestion $cardQuestion)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(CardQuestion $cardQuestion)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, CardQuestion $cardQuestion)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CardQuestion $cardQuestion)
    {
        //
    }
}
