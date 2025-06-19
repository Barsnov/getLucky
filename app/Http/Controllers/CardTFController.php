<?php

namespace App\Http\Controllers;

use App\Models\CardTF;
use App\Models\Specialization;
use Illuminate\Http\Request;

class CardTFController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function getTF()
    {
        $tf = CardTF::with('specializations')->get();
        return response()->json($tf);
    }

    public function addTF(Request $request)
    {
        $cardTF = CardTF::create([
            'question' => $request->question,
            'answer' => $request->answer,
            'explanation' => $request->explanation,
            'points' => $request->points,
        ]);

        $specs = in_array(0, $request->specializations)
            ? Specialization::pluck('id')->toArray()
            : $request->specializations;

        $cardTF->specializations()->attach($specs);
        return redirect()->back();
    }

    public function deleteTF(CardTF $cardTF)
    {
        $cardTF->specializations()->detach();
        $cardTF->delete();

        return redirect()->back();
    }

    public function putTF(Request $request, CardTF $cardTF)
    {
        $cardTF->update([
            'question' => $request->question,
            'answer' => $request->answer,
            'explanation' => $request->explanation,
            'points' => $request->points,
        ]);

        $specs = in_array(0, $request->specializations)
            ? Specialization::pluck('id')->toArray()
            : $request->specializations;

        $cardTF->specializations()->sync($specs);

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
    public function show(CardTF $cardTF)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(CardTF $cardTF)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, CardTF $cardTF)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CardTF $cardTF)
    {
        //
    }
}
