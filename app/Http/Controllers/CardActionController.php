<?php

namespace App\Http\Controllers;

use App\Models\CardAction;
use App\Models\Specialization;
use Illuminate\Http\Request;

class CardActionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function getAction()
    {
        $action = CardAction::with('specializations')->get();
        return response()->json($action);
    }

    public function addAction(Request $request)
    {
        $cardAction = CardAction::create([
            'action' => $request->action,
            'points' => $request->points,
        ]);

        $specs = in_array(0, $request->specializations)
            ? Specialization::pluck('id')->toArray()
            : $request->specializations;

        $cardAction->specializations()->attach($specs);
        return redirect()->back();
    }


    public function deleteAction(CardAction $cardAction)
    {
        $cardAction->specializations()->detach();
        $cardAction->delete();

        return redirect()->back();
    }

    public function putAction(CardAction $cardAction, Request $request)
    {
        $cardAction->update([
            'action' => $request->action,
            'points' => $request->points,
        ]);

        // Проверяем, если передан 0 в specializations, прикрепляем все специализации
        $specs = in_array(0, $request->specializations)
            ? Specialization::pluck('id')->toArray()
            : $request->specializations;

        // Удаляем старые связи и прикрепляем новые
        $cardAction->specializations()->sync($specs);

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
    public function show(CardAction $cardAction)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(CardAction $cardAction)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, CardAction $cardAction)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CardAction $cardAction)
    {
        //
    }
}
