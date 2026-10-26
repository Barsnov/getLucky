<script setup lang="ts">
import { ref } from 'vue';
import { useMarkdown } from '@/Composables/useMarkdown';
import type { CardTF } from '@/Types/cards';

const props = withDefaults(
    defineProps<{
        question: CardTF;
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
const checkAnswer = ref(false);
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
                Карточка "Правда или ложь"
            </span>
        </h1>

        <div class="flex w-10/12 justify-center">
            <div class="w-11/12 flex flex-col items-center justify-center gap-1">
                <div
                    class="prose prose-lg border-black/80 bg-gray-100 border-[.2rem] px-5 py-3 rounded-lg break-words max-w-none"
                    v-html="renderMarkdown(question.question)"
                ></div>
                <div
                    :class="checkAnswer ? 'opacity-100 relative' : 'opacity-0 absolute -z-10'"
                    style="font-family: 'RobotoCondensed', sans-serif;"
                    class="max-w-none text-[1.8rem] text-justify font-bold border-black/80 bg-gray-100 border-[.2rem] px-10 py-3 rounded-lg break-words"
                >
                    Ответ:
                    <span style="font-family: 'RobotoCondensed', sans-serif;" class="font-normal">
                        {{ question.answer ? 'правда' : 'ложь' }}
                    </span>
                </div>
                <div
                    style="font-family: 'Barboskin', sans-serif"
                    class="w-max rounded-sm py-1 px-4 text-white text-3xl font-medium bg-black/80 prose break-words text-center"
                >
                    {{ question.points }} очков
                </div>
            </div>

            <transition name="fade">
                <div class="absolute flex items-center gap-16" style="bottom: 2rem;">
                    <div
                        :class="!checkAnswer ? 'opacity-100 relative' : 'opacity-0 absolute -z-10 pointer-events-none'"
                        class="overflow-hidden bg-gray-600 w-[29rem] text-center border-gray-800 border-b-[.6rem] hover:border-b-[.2rem] transition-all rounded-lg px-6 py-4 group"
                        @click="checkAnswer = !checkAnswer"
                        style="cursor: url('/icons/Point.png') 0 0, auto"
                    >
                        <h1 style="font-family: 'Barboskin', sans-serif;" class="text-3xl text-white">
                            Проверить ответ
                        </h1>
                        <div
                            class="absolute top-0 left-[-30%] w-[70%] h-full bg-white/20 transform rotate-[35deg] scale-150 transition-all blur-sm duration-1000 group-hover:left-[80%] pointer-events-none"
                        ></div>
                    </div>

                    <div
                        :class="[
                            checkAnswer ? 'relative opacity-100' : 'opacity-0 absolute -z-10 pointer-events-none',
                            'flex items-center gap-16',
                        ]"
                    >
                        <div
                            :class="[checkAnswer ? 'relative' : 'absolute']"
                            class="relative overflow-hidden bg-gray-600 w-[29rem] text-center border-gray-800 border-b-[.6rem] hover:border-b-[.2rem] transition-all rounded-lg px-6 py-4 group"
                            @click="closeQuestion(false)"
                            style="cursor: url('/icons/Point.png') 0 0, auto"
                        >
                            <h1 style="font-family: 'Barboskin', sans-serif;" class="text-3xl text-white">
                                Команда ответила неправильно
                            </h1>
                            <div
                                class="absolute top-0 left-[-30%] w-[40%] h-full bg-white/80 transform rotate-[45deg] scale-125 transition-all duration-700 group-hover:left-[90%] pointer-events-none"
                            ></div>
                        </div>

                        <div
                            :class="[checkAnswer ? 'relative' : 'absolute']"
                            class="relative overflow-hidden bg-pink-500 w-[29rem] text-center border-gray-800 border-b-[.6rem] hover:border-b-[.2rem] transition-all rounded-lg px-6 py-4 group"
                            @click="closeQuestion(true)"
                            style="cursor: url('/icons/Point.png') 0 0, auto"
                        >
                            <h1 style="font-family: 'Barboskin', sans-serif;" class="text-3xl text-white">
                                Команда ответила правильно
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
