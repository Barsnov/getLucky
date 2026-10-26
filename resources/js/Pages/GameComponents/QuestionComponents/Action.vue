<script setup lang="ts">
import { ref } from 'vue';
import { useMarkdown } from '@/Composables/useMarkdown';
import type { CardAction } from '@/Types/cards';

const props = withDefaults(
    defineProps<{
        question: CardAction;
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

const { renderMarkdown } = useMarkdown();
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
        class="absolute bg-[#F5F5F5] w-full h-full flex flex-col items-start justify-center gap-10 transition-all duration-300"
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
                Карточка "Действия"
            </span>
        </h1>

        <div class="w-10/12 flex flex-col items-center justify-center gap-1">
            <div
                class="prose prose-lg border-black/80 bg-gray-100 border-[.2rem] px-5 py-3 rounded-sm break-words max-w-none"
                v-html="renderMarkdown(question.action)"
            ></div>
            <div
                style="font-family: 'Barboskin', sans-serif"
                class="w-max rounded-sm py-1 px-4 text-white text-2xl font-medium bg-black/80 prose break-words text-center"
            >
                {{ question.points }} очков
            </div>
        </div>

        <div class="flex w-10/12 justify-center">
            <transition name="fade">
                <div class="absolute flex items-center gap-16" style="bottom: 2rem;">
                    <div class="flex items-center gap-16">
                        <div
                            class="relative overflow-hidden bg-gray-600 w-[29rem] text-center border-gray-800 border-b-[.6rem] hover:border-b-[.2rem] transition-all rounded-lg px-6 py-4 group"
                            @click="closeQuestion(false)"
                            style="cursor: url('/icons/Point.png') 0 0, auto"
                        >
                            <h1 style="font-family: 'Barboskin', sans-serif;" class="text-3xl text-white">
                                Команда не выполнила действие
                            </h1>
                            <div
                                class="absolute top-0 left-[-30%] w-[40%] h-full bg-white/80 transform rotate-[45deg] scale-125 transition-all duration-700 group-hover:left-[90%] pointer-events-none"
                            ></div>
                        </div>

                        <div
                            class="relative overflow-hidden bg-pink-500 w-[29rem] text-center border-gray-800 border-b-[.6rem] hover:border-b-[.2rem] transition-all rounded-lg px-6 py-4 group"
                            @click="closeQuestion(true)"
                            style="cursor: url('/icons/Point.png') 0 0, auto"
                        >
                            <h1 style="font-family: 'Barboskin', sans-serif;" class="text-3xl text-white">
                                Команда выполнила действие
                            </h1>
                            <div
                                class="absolute top-0 left-[-30%] w-[40%] h-full bg-white/80 transform rotate-[45deg] scale-125 transition-all duration-700 group-hover:left-[90%] pointer-events-none"
                            ></div>
                        </div>
                    </div>
                </div>
            </transition>
        </div>
    </div>
</template>

<style scoped>
:deep(.prose del),
:deep(.prose s) {
    text-decoration: line-through;
}

.prose * {
    font-family: 'RobotoCondensed', sans-serif;
    font-size: 1.8rem;
    font-weight: 700;
    text-align: justify;
}
</style>
