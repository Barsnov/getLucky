<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('card_words', function (Blueprint $table) {
            $table->id();
            $table->string('word'); // Исходное слово
            $table->json('words')->nullable(); // Список слов, генерировать на лету\
            $table->string('explanation')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('card_words');
    }
};
