<?php

namespace App\Http\Controllers;

use App\Models\Specialization;
use Illuminate\Http\Request;

class SpecializationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function addSpecialization(Request $request)
    {
        Specialization::create($request->only(['name', 'method']));
        return redirect()->back();
    }

    public function deleteSpecialization(Specialization $specialization)
    {
        $specialization->delete();
        return redirect()->back();
    }

    public function putSpecialization(Request $request,Specialization $specialization)
    {
        $specialization->update($request->only(['name', 'method']));
        return redirect()->back();
    }

    public function getSpecializations()
    {
        $specializations = Specialization::with([
            'cardActions',
            'cardDecides',
            'cardFounds',
            'cardLuckies',
            'cardQuestions',
            'cardWords',
            'cardTFS'
        ])->get();
        return response()->json($specializations);
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
    public function show(Specialization $specialization)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Specialization $specialization)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Specialization $specialization)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Specialization $specialization)
    {
        //
    }
}
