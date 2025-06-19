<?php

namespace App\Http\Controllers;

use App\Models\CardLucky;
use App\Models\Specialization;
use Illuminate\Http\Request;

class CardLuckyController extends Controller
{
    /**
     * Display a listing of the resource.
     */

    public function getLucky(){
        $lucky = CardLucky::with('specializations')->get();
        return response()->json($lucky);
    }

    public function addLucky(Request $request)
    {
        $cardLucky = CardLucky::create([
           'points' => $request->points
        ]);

        $spec = in_array(0, $request->specializations)
            ? Specialization::pluck('id')->toArray()
            : $request->specializations;

        $cardLucky->specializations()->attach($spec);

        return redirect()->back();
    }

    public function deleteLucky(CardLucky $cardLucky)
    {
        $cardLucky->specializations()->detach();
        $cardLucky->delete();

        return redirect()->back();
    }

    public function putLucky(Request $request, CardLucky $cardLucky)
    {
        $cardLucky->update([
            'points' => $request->points,
        ]);

        $specs = in_array(0, $request->specializations)
            ? Specialization::pluck('id')->toArray()
            : $request->specializations;

        $cardLucky->specializations()->sync($specs);

        return redirect()->back();
    }



    public function index()
    {
        //
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
    public function show(CardLucky $cardLucky)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(CardLucky $cardLucky)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, CardLucky $cardLucky)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CardLucky $cardLucky)
    {
        //
    }
}
