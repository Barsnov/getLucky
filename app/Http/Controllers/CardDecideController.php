<?php

namespace App\Http\Controllers;

use App\Models\CardDecide;
use App\Models\Specialization;
use Illuminate\Http\Request;

class CardDecideController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function getDecide()
    {
        $decide = CardDecide::with('specializations')->get();
        return response()->json($decide);
    }

    public function addDecide(Request $request)
    {
        $cardDecide = CardDecide::create([
            'question' => $request->question,
            'answer' => $request->answer,
            'explanation' => $request->explanation,
            'points' => $request->points,
        ]);

        $specs = in_array(0, $request->specializations)
            ? Specialization::pluck('id')->toArray()
            : $request->specializations;

        $cardDecide->specializations()->attach($specs);
        return redirect()->back();
    }

    public function putDecide(Request $request, CardDecide $cardDecide)
    {
        $cardDecide->update([
            'question' => $request->question,
            'answer' => $request->answer,
            'explanation' => $request->explanation,
            'points' => $request->points,
        ]);

        $specs = in_array(0, $request->specializations)
            ? Specialization::pluck('id')->toArray()
            : $request->specializations;

        $cardDecide->specializations()->sync($specs);

        return redirect()->back();
    }

    public function deleteDecide(CardDecide $cardDecide)
    {
        $cardDecide->specializations()->detach();
        $cardDecide->delete();

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
    public function show(CardDecide $cardDecide)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(CardDecide $cardDecide)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, CardDecide $cardDecide)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CardDecide $cardDecide)
    {
        //
    }
}
