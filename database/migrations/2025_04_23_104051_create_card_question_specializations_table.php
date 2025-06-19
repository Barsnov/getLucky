<?php

use App\Models\CardQuestion;
use App\Models\Specialization;
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
        Schema::create('card_question_specializations', function (Blueprint $table) {
            $table->foreignIdFor(CardQuestion::class)->constrained()->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignIdFor(Specialization::class)->constrained()->cascadeOnUpdate()->cascadeOnDelete();
            $table->primary(['card_question_id', 'specialization_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cards_question_specializations');
    }
};
