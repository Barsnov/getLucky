<?php

use App\Models\CardAction;
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
        Schema::create('card_action_specializations', function (Blueprint $table) {
            $table->foreignIdFor(CardAction::class)->constrained()->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignIdFor(Specialization::class)->constrained()->cascadeOnUpdate()->cascadeOnDelete();
            $table->primary(['card_action_id', 'specialization_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cards_action_specializations');
    }
};
