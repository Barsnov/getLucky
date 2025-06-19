<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GameController extends Controller
{
    //
    public function store(Request $request)
    {
        $questions = $request->questions;
        $players = $request->players;

        session([
            'questions' => $questions,
            'players' => $players,
        ]);

        return to_route('game.show');
    }

    public function show()
    {
        $questions = session('questions');
        $players = session('players');

        return Inertia::render('Game', [
            'players' => $players,
            'questions' => $questions,
        ]);
    }

     public function endGame(Request $request)
     {
         $players = $request->input('players');
         session(['results' => $players]);
         return to_route('game.results');
     }

    public function results()
    {
        $players = session('results');

        if (!$players) {
            dd('ужас');
        }

        return Inertia::render('Podium', [
            'players' => $players,
        ]);
    }
}
