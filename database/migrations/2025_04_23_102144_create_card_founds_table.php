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
        Schema::create('card_founds', function (Blueprint $table) {
            $table->id();
            $table->text('question'); //Вопрос
            $table->string('urlQuestion'); //url картинки с вопросом
            $table->string('urlAnswer'); //url картинки с ответом
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('card_founds');
    }
};
