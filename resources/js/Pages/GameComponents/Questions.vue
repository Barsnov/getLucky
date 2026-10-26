<script setup lang="ts">
import { computed, type Component } from 'vue';
import { useGameStore } from '@/Stores/useGameStore';
import Action from './QuestionComponents/Action.vue';
import Decide from './QuestionComponents/Decide.vue';
import Lucky from './QuestionComponents/Lucky.vue';
import Question from './QuestionComponents/Question.vue';
import TF from './QuestionComponents/TF.vue';
import type { NormalCardCategory } from '@/Types/cards';

const gameStore = useGameStore();

const componentsMap: Record<NormalCardCategory, Component> = {
    action: Action,
    decide: Decide,
    lucky: Lucky,
    cardQuestion: Question,
    tf: TF,
};

const isVisible = computed(
    () =>
        (gameStore.phase === 'question' || gameStore.phase === 'upgrade_question') &&
        gameStore.activeQuestion !== null
);

const activeCard = computed(() => gameStore.activeQuestion?.card ?? null);

const activeComponent = computed<Component | null>(() => {
    const category = activeCard.value?.category;
    return category ? (componentsMap[category] ?? null) : null;
});

const questionKey = computed(() => {
    const card = activeCard.value;
    return card ? `${card.category}-${card.id}` : 'empty-question';
});

function handleAnswerResult(isCorrect: boolean, points = 0): void {
    gameStore.resolveQuestion(isCorrect, points);
}
</script>

<template>
    <component
        v-if="activeComponent && activeCard"
        :is="activeComponent"
        :key="questionKey"
        :question="activeCard"
        :visibleQuestion="isVisible"
        :forUpHex="gameStore.activeQuestion?.forUpgrade ?? false"
        @closeQuestion="handleAnswerResult"
        @closeQuestionForUpHex="handleAnswerResult"
    />
</template>
