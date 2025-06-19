<?php

namespace App\Http\Controllers;

use App\Models\CardWord;
use App\Models\Specialization;
use Doctrine\Inflector\Rules\Word;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CardWordController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    private function loadDictionary(): array
    {
        $lines = file(storage_path('app/words.txt'), FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        return array_map('mb_strtolower', array_map('trim', $lines));
    }

    public function generateWord(Request $request)
    {
        $inputWord = mb_strtolower($request->input('word'));
        $availableLetters = array_count_values(preg_split('//u', $inputWord, null, PREG_SPLIT_NO_EMPTY));
        $dictionary = $this->loadDictionary();
        $foundWords = [];
        foreach ($dictionary as $dictWord) {
            if ($dictWord === $inputWord) continue;

            if ($this->canBeBuilt($dictWord, $availableLetters)) {
                $foundWords[] = $dictWord;
            }
        }

        return response()->json([
            'words' => $foundWords
        ]);
    }
    private function canBeBuilt(string $word, array $availableLetters): bool
    {
        $letters = array_count_values(preg_split('//u', $word, null, PREG_SPLIT_NO_EMPTY));

        foreach ($letters as $letter => $count) {
            if (!isset($availableLetters[$letter]) || $availableLetters[$letter] < $count) {
                return false;
            }
        }

        return true;
    }

    public function getWord()
    {
        $word = CardWord::with('specializations')->get();
        return response()->json($word);
    }

    public function addWord(Request $request)
    {
        $cardWord = CardWord::create([
            'word' => $request->word,
            'words' =>$request->words,
            'explanation' =>$request->explanation
        ]);

        $specs = in_array(0, $request->specializations)
            ? Specialization::pluck('id')->toArray()
            : $request->specializations;

        $cardWord->specializations()->attach($specs);
        return redirect()->back();
    }

    public function putWord(Request $request, CardWord $cardWord)
    {
        $cardWord->update([
            'word' => $request->word,
            'words' =>$request->words,
            'explanation' =>$request->explanation
        ]);

        $specs = in_array(0, $request->specializations)
            ? Specialization::pluck('id')->toArray()
            : $request->specializations;

        $cardWord->specializations()->sync($specs);

        return redirect()->back();
    }

    public function deleteWord(CardWord $cardWord)
    {
        $cardWord->specializations()->detach();
        $cardWord->delete();

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
    public function show(CardWord $cardWord)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(CardWord $cardWord)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, CardWord $cardWord)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CardWord $cardWord)
    {
        //
    }
}
