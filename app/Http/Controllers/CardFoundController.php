<?php

namespace App\Http\Controllers;

use App\Models\CardFound;
use App\Models\Specialization;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;

class CardFoundController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function getFound()
    {
        //
        $cardFound = CardFound::with('specializations')->get();
        return response()->json($cardFound);
    }

    public function addFound(Request $request)
    {
        // Сохраняем картинки, если переданы
        $urlQuestionPath = $request->hasFile('urlQuestion')
            ? $request->file('urlQuestion')->store('cards/questions', 'public')
            : null;

        $urlAnswerPath = $request->hasFile('urlAnswer')
            ? $request->file('urlAnswer')->store('cards/answers', 'public')
            : null;
        // Создание карточки
        $cardFound = CardFound::create([
            'question' => $request->question,
            'urlQuestion' => $urlQuestionPath,
            'urlAnswer' => $urlAnswerPath,
        ]);
        // Привязка специализаций
        $specs = in_array(0, $request->specializations)
            ? Specialization::pluck('id')->toArray()
            : $request->specializations;
        $cardFound->specializations()->attach($specs);
        return redirect()->back();
    }

    public function putFound(CardFound $cardFound, Request $request)
    {
        $urlQuestionPath = $cardFound->urlQuestion;
        $urlAnswerPath = $cardFound->urlAnswer;
        // Удаление старой картинки вопроса, если пришла новая
        if ($request->hasFile('urlQuestion')) {
            if ($cardFound->urlQuestion && Storage::disk('public')->exists($cardFound->urlQuestion)) {
                Storage::disk('public')->delete($cardFound->urlQuestion);
            }
            $urlQuestionPath = $request->file('urlQuestion')->store('cards/questions', 'public');
        }

        // Удаление старой картинки ответа, если пришла новая
        if ($request->hasFile('urlAnswer')) {
            if ($cardFound->urlAnswer && Storage::disk('public')->exists($cardFound->urlAnswer)) {
                Storage::disk('public')->delete($cardFound->urlAnswer);
            }
            $urlAnswerPath = $request->file('urlAnswer')->store('cards/answers', 'public');
        }
        $cardFound->update([
            'question' => $request->question,
            'urlQuestion' => $urlQuestionPath,
            'urlAnswer' => $urlAnswerPath
        ]);

        // Обновление привязки специальностей
        $specs = in_array(0, $request->specializations)
            ? Specialization::pluck('id')->toArray()
            : $request->specializations;

        $cardFound->specializations()->sync($specs);

        return redirect()->back();
    }

    public function deleteFound(CardFound $cardFound)
    {
        // Удаляем связанные специализации
        $cardFound->specializations()->detach();

        // Удаляем картинки, если они есть
        if ($cardFound->urlQuestion) {
            Storage::disk('public')->delete($cardFound->urlQuestion);
        }

        if ($cardFound->urlAnswer) {
            Storage::disk('public')->delete($cardFound->urlAnswer);
        }

        // Удаляем саму карточку
        $cardFound->delete();

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
    public function show(CardFound $cardFound)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(CardFound $cardFound)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, CardFound $cardFound)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CardFound $cardFound)
    {
        //
    }
}
