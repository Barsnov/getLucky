<?php

use App\Http\Controllers\CardActionController;
use App\Http\Controllers\CardDecideController;
use App\Http\Controllers\CardFoundController;
use App\Http\Controllers\CardLuckyController;
use App\Http\Controllers\CardQuestionController;
use App\Http\Controllers\CardTFController;
use App\Http\Controllers\CardWordController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\SpecializationController;
use App\Http\Controllers\UserController;
use App\Http\Middleware\EnsureAdminVerified;
use App\Models\Specialization;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

//Начальная страница
Route::get('/', function () {
    $specializations = Specialization::all();
    return Inertia::render('Welcome', ['specializations' => $specializations]);
});

//Получение вопросов категории
Route::get('/questions/get/{specialization}', [QuestionController::class, 'getQuestions']);

//Игровая часть
Route::post('/game/store', [GameController::class, 'store'])->name('game.store');
Route::get('/game/show', [GameController::class, 'show'])->name('game.show');
Route::post('/game/end', [GameController::class, 'endGame'])->name('game.end');
Route::get('/game/result', [GameController::class, 'results'])->name('game.results');

//ADMIN-ЧАСТЬ
Route::get('/auth', function (){return Inertia::render('Authorization');});
Route::post('/auth/check', [UserController::class, 'check']);
Route::get('/exit', [UserController::class, 'exit']);
Route::middleware([EnsureAdminVerified::class])->prefix('admin')->group(function () {
    Route::get('/', function () {
        return Inertia::render('Admin');
    });

    //Работа с карточками
    Route::prefix('lucky')->group(function () {
        Route::get('/', [CardLuckyController::class, 'getLucky'])->name('lucky.get');
        Route::post('/add', [CardLuckyController::class, 'addLucky'])->name('lucky.add');
        Route::delete('/delete/{cardLucky}', [CardLuckyController::class, 'deleteLucky'])->name('lucky.delete');
        Route::put('/put/{cardLucky}', [CardLuckyController::class, 'putLucky'])->name('lucky.put');
    });
    Route::prefix('action')->group(function () {
        Route::get('/', [CardActionController::class, 'getAction'])->name('action.get');
        Route::post('/add', [CardActionController::class, 'addAction'])->name('action.add');
        Route::delete('/delete/{cardAction}', [CardActionController::class, 'deleteAction'])->name('action.delete');
        Route::put('/put/{cardAction}', [CardActionController::class, 'putAction'])->name('action.put');
    });
    Route::prefix('tf')->group(function () {
        Route::get('/', [CardTFController::class, 'getTF'])->name('tf.get');
        Route::post('/add', [CardTFController::class, 'addTF'])->name('tf.add');
        Route::delete('/delete/{cardTF}', [CardTFController::class, 'deleteTF'])->name('tf.delete');
        Route::put('/put/{cardTF}', [CardTFController::class, 'putTF'])->name('tf.put');
    });
    Route::prefix('question')->group(function () {
        Route::get('/', [CardQuestionController::class, 'getQuestion'])->name('question.get');
        Route::post('/add', [CardQuestionController::class, 'addQuestion'])->name('question.add');
        Route::delete('/delete/{cardQuestion}', [CardQuestionController::class, 'deleteQuestion'])->name('question.delete');
        Route::put('/put/{cardQuestion}', [CardQuestionController::class, 'putQuestion'])->name('question.put');
    });
    Route::prefix('decide')->group(function () {
        Route::get('/', [CardDecideController::class, 'getDecide'])->name('decide.get');
        Route::post('/add', [CardDecideController::class, 'addDecide'])->name('decide.add');
        Route::delete('/delete/{cardDecide}', [CardDecideController::class, 'deleteDecide'])->name('decide.delete');
        Route::put('/put/{cardDecide}', [CardDecideController::class, 'putDecide'])->name('decide.put');
    });
    Route::prefix('word')->group(function () {
        Route::get('/', [CardWordController::class, 'getWord'])->name('word.get');
        Route::post('/generate', [CardWordController::class, 'generateWord'])->name('word.generate');
        Route::post('/add', [CardWordController::class, 'addWord'])->name('word.add');
        Route::delete('/delete/{cardWord}', [CardWordController::class, 'deleteWord'])->name('word.delete');
        Route::put('/put/{cardWord}', [CardWordController::class, 'putWord'])->name('word.put');
    });
    Route::prefix('found')->group(function () {
        Route::get('/', [CardFoundController::class, 'getFound'])->name('found.get');
        Route::post('/add', [CardFoundController::class, 'addFound'])->name('found.add');
        Route::delete('/delete/{cardFound}', [CardFoundController::class, 'deleteFound'])->name('found.delete');
        Route::post('/put/{cardFound}', [CardFoundController::class, 'putFound'])->name('found.put');
    });

    //Работа со специальностями
    Route::prefix('specialization')->group(function () {
        Route::get('/', [SpecializationController::class, 'getSpecializations'])->name('specialization.get');
        Route::post('/add', [SpecializationController::class, 'addSpecialization'])->name('specialization.add');
        Route::delete('/delete/{specialization}', [SpecializationController::class, 'deleteSpecialization'])->name('specialization.delete');
        Route::put('/put/{specialization}', [SpecializationController::class, 'putSpecialization'])->name('specialization.put');
    });
});
