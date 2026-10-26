<script setup lang="ts">
import { ref } from 'vue';
import type { CardLucky } from '@/Types/cards';

const props = withDefaults(
    defineProps<{
        question: CardLucky;
        visibleQuestion: boolean;
        forUpHex?: boolean;
    }>(),
    {
        forUpHex: false,
    }
);

const emit = defineEmits<{
    (e: 'closeQuestion', isCorrect: boolean, points: number): void;
    (e: 'closeQuestionForUpHex', isCorrect: boolean, points: number): void;
}>();

const flagButton = ref(false);

function closeQuestion(isCorrect: boolean): void {
    if (flagButton.value) return;
    flagButton.value = true;

    const points = Number(props.question?.points) || 0;
    if (!props.forUpHex) {
        emit('closeQuestion', isCorrect, points);
    } else {
        emit('closeQuestionForUpHex', isCorrect, points);
    }
}
</script>

<template>
    <div
        class="absolute bg-[#bde0ff] w-full h-full flex flex-col items-start justify-center gap-10 transition-all duration-1000"
        :class="visibleQuestion ? 'opacity-100 z-30' : 'opacity-0 -z-10 pointer-events-none'"
    >
        <h1
            class="absolute text-gray-800 left-7 top-8 text-3xl text-center font-medium"
            style="font-family: 'Barboskin', serif"
        >
            Категория:
            <span
                style="font-family: 'Barboskin', serif"
                class="text-gray-900 font-bold text-4xl underline-offset-4 underline uppercase"
            >
                Карточка "Лови удачу!"
            </span>
        </h1>

        <div class="flex w-10/12 justify-center">
            <div class="w-11/12 flex flex-col items-center justify-center gap-1">
                <div
                    style="font-family: 'Barboskin', sans-serif"
                    class="w-max rounded-xl py-3 px-7 text-white text-4xl font-medium bg-black/80 prose break-words text-center"
                >
                    {{ question.points > 0 ? 'Поздравляем' : 'Сожалеем' }}, вам выпала карточка на
                    {{ question.points }} очков!
                </div>
            </div>

            <transition name="fade">
                <div class="absolute flex items-center gap-16" style="bottom: 2rem;">
                    <div
                        class="relative overflow-hidden bg-pink-500 w-[29rem] text-center border-gray-800 border-b-[.6rem] hover:border-b-[.2rem] transition-all rounded-lg px-6 py-4 group"
                        @click="closeQuestion(true)"
                        style="cursor: url('/icons/Point.png') 0 0, auto"
                    >
                        <h1 style="font-family: 'Barboskin', sans-serif;" class="text-3xl text-white">
                            Продолжить
                        </h1>
                        <div
                            class="absolute top-0 left-[-30%] w-[40%] h-full bg-white/80 transform rotate-[45deg] scale-125 transition-all duration-700 group-hover:left-[90%] pointer-events-none"
                        ></div>
                    </div>
                </div>
            </transition>
        </div>
    </div>
</template>
