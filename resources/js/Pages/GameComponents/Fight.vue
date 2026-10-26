<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue';
import { useGameStore } from '@/Stores/useGameStore';
import { useMarkdown } from '@/Composables/useMarkdown';
import type { CardFound, CardWord } from '@/Types/cards';

const gameStore = useGameStore();
const { renderMarkdown } = useMarkdown();

type WordDuelPhase = 'prepare' | 'input' | 'end';

const wordPhase = ref<WordDuelPhase>('prepare');
const timer = ref<number>(60);
let timerIntervalId: ReturnType<typeof setInterval> | null = null;

const inputWord = ref('');
const team1Words = ref<string[]>([]);
const team2Words = ref<string[]>([]);
const errorMessage = ref('');
const currentTeam = ref<1 | 2>(1);

const checkAnswer = ref(false);
const isSubmitting = ref(false);

const isVisible = computed(() => gameStore.phase === 'duel' && gameStore.activeDuel !== null);
const duelCard = computed(() => gameStore.activeDuel?.card ?? null);
const attacker = computed(() => gameStore.activeAttacker);
const defender = computed(() => gameStore.activeDefender);

const wordCard = computed<CardWord | null>(() =>
    duelCard.value?.category === 'word' ? (duelCard.value as CardWord) : null
);

const foundCard = computed<CardFound | null>(() =>
    duelCard.value?.category === 'cardFound' ? (duelCard.value as CardFound) : null
);

const categoryTitle = computed<string>(() => {
    switch (duelCard.value?.category) {
        case 'word':
            return 'Словодел';
        case 'cardFound':
            return 'Найди меня!';
        default:
            return 'Определение категории...';
    }
});

const phaseLabel = computed<string>(() => {
    switch (wordPhase.value) {
        case 'prepare':
            return 'Подготовка: думайте над словами!';
        case 'input':
            return 'Ввод слов по очереди!';
        default:
            return '';
    }
});

function clearDuelTimer(): void {
    if (timerIntervalId) {
        clearInterval(timerIntervalId);
        timerIntervalId = null;
    }
}

function startPrepareTimer(): void {
    clearDuelTimer();
    timerIntervalId = setInterval(() => {
        if (timer.value > 0) {
            timer.value--;
        } else if (wordPhase.value === 'prepare') {
            wordPhase.value = 'input';
            clearDuelTimer();
        }
    }, 1000);
}

watch(isVisible, (visible) => {
    clearDuelTimer();
    checkAnswer.value = false;
    isSubmitting.value = false;
    errorMessage.value = '';
    inputWord.value = '';
    team1Words.value = [];
    team2Words.value = [];
    currentTeam.value = 1;

    if (visible && duelCard.value?.category === 'word') {
        wordPhase.value = 'prepare';
        timer.value = 60;
        startPrepareTimer();
    }
});

function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const sec = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
}

function submitWord(): void {
    if (!wordCard.value) return;
    const word = inputWord.value.trim().toLowerCase();
    if (!word) return;

    const allUsedWords = [...team1Words.value, ...team2Words.value].map((w) => w.toLowerCase());
    const validWords = (wordCard.value.words ?? []).map((w) => w.toLowerCase());

    if (!validWords.includes(word)) {
        errorMessage.value = 'Такого слова нет в списке допустимых.';
        return;
    }
    if (allUsedWords.includes(word)) {
        errorMessage.value = 'Это слово уже было использовано.';
        return;
    }

    if (currentTeam.value === 1) {
        team1Words.value.push(word);
        currentTeam.value = 2;
    } else {
        team2Words.value.push(word);
        currentTeam.value = 1;
    }

    inputWord.value = '';
    errorMessage.value = '';
}

function finishDuel(winnerPlayerId: number | null): void {
    if (isSubmitting.value) return;
    isSubmitting.value = true;
    clearDuelTimer();

    gameStore.resolveDuel(winnerPlayerId);
}

onUnmounted(() => {
    clearDuelTimer();
});
</script>

<template>
    <div
        class="absolute bg-[#bde0ff] w-full h-full flex flex-col justify-center gap-10 transition-all duration-1000"
        :class="isVisible ? 'opacity-100 z-40' : 'opacity-0 -z-10 pointer-events-none'"
    >
        <!-- Тип вопроса -->
        <h1
            class="absolute text-white left-7 top-12 text-4xl text-center font-medium"
            style="font-family: 'Barboskin', serif"
        >
            Категория:
            <span
                style="font-family: 'Barboskin', serif"
                class="text-white text-4xl underline-offset-4 underline uppercase"
            >
                {{ categoryTitle }}
            </span>
        </h1>

        <div v-if="attacker && defender && duelCard" class="flex flex-col w-10/12 items-center">
            <!-- Дуэль по картинкам «Найди меня!» -->
            <div
                v-if="foundCard"
                class="max-w-[95rem] h-max max-h-[60rem] overflow-hidden rounded-2xl flex flex-col items-center gap-4"
            >
                <div class="w-full flex flex-col justify-center items-center">
                    <div class="flex w-full justify-around bg-gray-800 rounded-t-2xl py-3">
                        <h3 :style="{ color: attacker.color }" class="barboskin text-5xl text-center uppercase">
                            Атакуют: {{ attacker.name }}
                        </h3>
                        <h3 :style="{ color: defender.color }" class="barboskin text-5xl text-center uppercase">
                            Защищаются: {{ defender.name }}
                        </h3>
                    </div>

                    <img
                        v-if="!checkAnswer"
                        :src="'/storage/' + foundCard.urlQuestion"
                        alt="Вопрос дуэли"
                    />
                    <div v-else class="w-full flex items-end gap-3">
                        <img :src="'/storage/' + foundCard.urlAnswer" alt="Ответ дуэли" />
                    </div>
                </div>
            </div>

            <!-- Дуэль со словами «Словодел» -->
            <div
                v-if="wordCard"
                class="p-6 max-w-[95rem] h-[52rem] mb-10 bg-white overflow-hidden rounded-2xl flex flex-row items-center gap-8"
            >
                <!-- Левый столбец — Атакующие -->
                <div class="w-[30rem] min-h-[50rem] bg-blue-100 p-4 rounded-lg flex flex-col gap-2 overflow-auto">
                    <h3 :style="{ color: attacker.color }" class="barboskin text-5xl text-center uppercase">
                        Атакуют:<br />
                        {{ attacker.name }}
                    </h3>
                    <div
                        v-for="(word, index) in team1Words"
                        :key="'t1-' + index"
                        class="barboskin text-center text-3xl p-2 bg-white rounded shadow"
                    >
                        {{ word }}
                    </div>
                </div>

                <!-- Центр -->
                <div class="flex py-6 w-[40rem] h-full flex-col justify-between items-center gap-4">
                    <h2 class="text-4xl barboskin text-center font-medium">
                        Составьте слова из:<br />
                        <span class="text-7xl tracking-wide font-bold barboskin">{{ wordCard.word }}</span>
                    </h2>

                    <div
                        v-if="wordCard.explanation && checkAnswer"
                        class="w-full prose break-words max-w-none"
                        v-html="renderMarkdown(wordCard.explanation)"
                    ></div>

                    <div class="flex flex-col items-center gap-10">
                        <div class="flex flex-col items-center gap-4">
                            <div class="text-7xl text-gray-900 barboskin">{{ formatTime(timer) }}</div>
                            <h1 class="text-4xl barboskin text-gray-900 font-bold text-center">
                                {{ phaseLabel }}
                            </h1>
                        </div>
                        <input
                            :class="wordPhase === 'input' ? 'opacity-100' : 'opacity-0 pointer-events-none'"
                            v-model="inputWord"
                            @keydown.enter.prevent="submitWord"
                            placeholder="Введите слово"
                            class="barboskin border-2 transition-all duration-500 border-gray-900 px-4 py-2 rounded w-[30rem] text-3xl"
                        />
                        <p v-if="errorMessage" class="text-3xl barboskin text-wrap text-center text-red-500 mt-1">
                            {{ errorMessage }}
                        </p>
                    </div>
                    <div class="text-gray-500 text-4xl barboskin">
                        Сейчас ходят: {{ currentTeam === 1 ? attacker.name : defender.name }}
                    </div>
                </div>

                <!-- Правый столбец — Защищающиеся -->
                <div class="w-[30rem] min-h-[50rem] bg-red-100 p-4 rounded-lg flex flex-col gap-2 overflow-auto">
                    <h3 :style="{ color: defender.color }" class="text-center barboskin text-5xl uppercase">
                        Защищают:<br />
                        {{ defender.name }}
                    </h3>
                    <div
                        v-for="(word, index) in team2Words"
                        :key="'t2-' + index"
                        class="barboskin text-center text-3xl p-2 bg-white rounded shadow"
                    >
                        {{ word }}
                    </div>
                </div>
            </div>

            <!-- Кнопки управления дуэлью -->
            <div class="absolute flex items-center gap-16" style="bottom: 2rem;">
                <div
                    :class="
                        !checkAnswer && duelCard.category !== 'word'
                            ? 'opacity-100 relative'
                            : 'opacity-0 absolute -z-10 pointer-events-none'
                    "
                    class="overflow-hidden bg-gray-600 w-[29rem] text-center border-gray-800 border-b-[.6rem] hover:border-b-[.2rem] transition-all rounded-lg px-6 py-4 group"
                    @click="checkAnswer = true"
                    style="cursor: url('/icons/Point.png') 0 0, auto"
                >
                    <h1 style="font-family: 'Barboskin', sans-serif;" class="text-3xl text-white">
                        Проверить ответ
                    </h1>
                    <div
                        class="absolute top-0 left-[-40%] w-[70%] h-full bg-white/20 transform rotate-[35deg] scale-150 transition-all blur-sm duration-1000 group-hover:left-[90%] pointer-events-none"
                    ></div>
                </div>

                <template v-if="checkAnswer || duelCard.category === 'word'">
                    <div
                        :class="[
                            duelCard.category === 'word'
                                ? wordPhase === 'input'
                                    ? 'opacity-100'
                                    : 'opacity-0 absolute -z-10 pointer-events-none'
                                : 'opacity-100',
                            {
                                'bg-gradient-to-r from-red-500 to-red-300': defender.name === 'Красные',
                                'bg-gradient-to-r from-blue-500 to-blue-300': defender.name === 'Синие',
                                'bg-gradient-to-r from-green-500 to-green-300': defender.name === 'Зелёные',
                                'bg-gradient-to-r from-yellow-500 to-yellow-200': defender.name === 'Жёлтые',
                                'bg-gradient-to-r from-violet-500 to-violet-300': defender.name === 'Фиолетовые',
                            },
                        ]"
                        class="relative overflow-hidden bg-pink-500 w-[29rem] text-center border-gray-800 border-b-[.6rem] hover:border-b-[.2rem] transition-all rounded-lg px-6 py-4 group"
                        @click="finishDuel(defender.id)"
                        style="cursor: url('/icons/Point.png') 0 0, auto"
                    >
                        <h1 style="font-family: 'Barboskin', sans-serif;" class="text-3xl text-gray-950">
                            Победили {{ defender.name }}
                        </h1>
                        <div
                            class="absolute top-0 left-[-30%] w-[40%] h-full bg-white/80 transform rotate-[45deg] scale-125 transition-all duration-700 group-hover:left-[90%] pointer-events-none"
                        ></div>
                    </div>

                    <div
                        :class="[
                            duelCard.category === 'word'
                                ? wordPhase === 'input'
                                    ? 'opacity-100'
                                    : 'opacity-0 absolute -z-10 pointer-events-none'
                                : 'opacity-100',
                            {
                                'bg-gradient-to-r from-red-500 to-red-300': attacker.name === 'Красные',
                                'bg-gradient-to-r from-blue-500 to-blue-300': attacker.name === 'Синие',
                                'bg-gradient-to-r from-green-500 to-green-300': attacker.name === 'Зелёные',
                                'bg-gradient-to-r from-yellow-500 to-yellow-200': attacker.name === 'Жёлтые',
                                'bg-gradient-to-r from-violet-500 to-violet-300': attacker.name === 'Фиолетовые',
                            },
                        ]"
                        class="relative overflow-hidden bg-pink-500 w-[29rem] text-center border-gray-800 border-b-[.6rem] hover:border-b-[.2rem] transition-all rounded-lg px-6 py-4 group"
                        @click="finishDuel(attacker.id)"
                        style="cursor: url('/icons/Point.png') 0 0, auto"
                    >
                        <h1 style="font-family: 'Barboskin', sans-serif;" class="text-3xl text-gray-950">
                            Победили {{ attacker.name }}
                        </h1>
                        <div
                            class="absolute top-0 left-[-30%] w-[40%] h-full bg-white/80 transform rotate-[45deg] scale-125 transition-all duration-700 group-hover:left-[90%] pointer-events-none"
                        ></div>
                    </div>
                </template>
            </div>
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

.barboskin {
    font-family: 'Barboskin', sans-serif;
}
</style>
