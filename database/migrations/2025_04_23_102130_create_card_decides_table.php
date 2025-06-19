<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new  class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('card_decides', function (Blueprint $table) {
            $table->id();
            $table->text('question');
            $table->string('answer');
            $table->text('explanation')->nullable();
            $table->integer('points'); //0 -- 100
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('card_decides');
    }
};
