<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { Head, Link } from '@inertiajs/vue3';
import { useGameStore } from '@/Stores/useGameStore';
import GameCanvas from './GameComponents/GameCanvas.vue';
import Leaderboard from './GameComponents/Leaderboard.vue';
import Questions from './GameComponents/Questions.vue';
import Fight from './GameComponents/Fight.vue';
import type { RawQuestionsPayload } from '@/Types/cards';

const props = withDefaults(
    defineProps<{
        gameReloaded?: boolean;
        players: number;
        questions: RawQuestionsPayload;
    }>(),
    {
        gameReloaded: false,
        players: 2,
        questions: () => ({}),
    }
);

const gameStore = useGameStore();
const opacityGame = ref(false);
let introFadeTimer: ReturnType<typeof setTimeout> | null = null;

gameStore.initGame(props.players, props.questions);

const isMainGameActive = computed(
    () => gameStore.phase !== 'idle' && gameStore.phase !== 'roulette'
);

const isQuestionOverlayVisible = computed(
    () => gameStore.phase === 'question' || gameStore.phase === 'upgrade_question'
);

const isRouletteVisible = computed(() => gameStore.phase === 'roulette');
const isGameOver = computed(() => gameStore.phase === 'game_over');

const highlightedRoulettePlayer = computed(
    () => gameStore.players[gameStore.rouletteHighlightedIndex] ?? null
);

function handleScreenClick(): void {
    if (gameStore.phase === 'idle') {
        gameStore.startRoulette();
    }
}

onMounted(() => {
    introFadeTimer = setTimeout(() => {
        opacityGame.value = true;
    }, 1500);
});

onUnmounted(() => {
    if (introFadeTimer) {
        clearTimeout(introFadeTimer);
    }
    gameStore.disposeGame();
});
</script>

<template>
    <Head title="Мистерия" />
    <div
        @click="handleScreenClick"
        class="w-screen h-screen overflow-hidden relative"
        :style="{ cursor: gameStore.cursorStyle, transition: '2s' }"
        :class="opacityGame ? 'opacity-100' : 'opacity-0'"
    >
        <!-- 3D-сцена (Three.js + Raycaster) -->
        <GameCanvas />

        <!-- HUD: Дуэль -->
        <Fight />

        <!-- HUD: Карточки вопросов и действий -->
        <Questions />

        <!-- HUD: Рулетка выбора очерёдности хода -->
        <div
            :class="isRouletteVisible ? 'opacity-100 z-50' : 'opacity-0 -z-10 pointer-events-none'"
            class="w-max absolute flex flex-col items-center gap-20 top-1/2 left-1/2 transition-all duration-1000"
            style="transform: translate(-50%, -50%)"
        >
            <h1
                class="text-center font-black text-5xl uppercase"
                style="font-family: 'Barboskin', serif; top: -5rem; color: #a6ffed;"
            >
                Игру начинают
                <span
                    style="font-family: 'Barboskin', serif"
                    :style="{
                        color: gameStore.rouletteWinnerLocked
                            ? highlightedRoulettePlayer?.cardBannerColor || '#a6ffed'
                            : '#a6ffed',
                    }"
                >
                    {{
                        gameStore.rouletteWinnerLocked && highlightedRoulettePlayer
                            ? highlightedRoulettePlayer.name
                            : '. . .'
                    }}
                </span>
            </h1>
            <div class="flex gap-10">
                <div
                    v-for="(player, index) in gameStore.players"
                    :key="player.id"
                    class="relative transition-all duration-300"
                    :class="{
                        'scale-110 drop-shadow-[0_0_.3rem_#ffffff]':
                            gameStore.rouletteHighlightedIndex === index,
                        'opacity-50':
                            gameStore.rouletteFinalIndex !== null &&
                            gameStore.rouletteFinalIndex !== index,
                    }"
                >
                    <img :src="player.cardPng" :alt="player.name" style="width: 19rem" />
                </div>
            </div>
        </div>

        <!-- HUD: Индикатор текущего хода -->
        <div
            :class="[
                isMainGameActive ? 'opacity-100' : 'opacity-0 pointer-events-none',
                !isQuestionOverlayVisible ? 'text-white' : 'text-gray-900',
            ]"
            class="transition-all text-4xl duration-1000 absolute top-8 left-1/2 z-30"
            style="transform: translate(-50%); font-family: 'Barboskin', serif"
        >
            Очередь:
            <span
                v-if="gameStore.currentPlayer"
                :style="{ color: gameStore.currentPlayer.color }"
                style="font-family: 'Barboskin', serif"
            >
                {{ gameStore.currentPlayer.name }}
            </span>
            <span v-else>...</span>
        </div>

        <!-- HUD: Таблица лидеров -->
        <Leaderboard v-if="isMainGameActive" />

        <!-- HUD: Логотип -->
        <Link class="absolute left-4 top-4 w-[7rem] z-20 ms-3 text-white" href="/">
            <img
                class="text-white cursor-pointer"
                src="/images/Logo_project_white_simple.svg"
                alt="project_logo"
            />
        </Link>

        <!-- HUD: Таймер и экран окончания игры -->
        <div
            :class="[
                'z-50 transition-all duration-1000 ease-in-out flex items-center justify-center',
                isGameOver
                    ? 'fixed top-0 left-0 w-screen h-screen bg-black opacity-100'
                    : 'absolute top-4 right-4 bg-black/85 rounded-lg p-4 opacity-0 sm:opacity-100',
            ]"
        >
            <h2
                style="font-family: 'Barboskin', sans-serif"
                :class="[
                    'text-4xl',
                    isGameOver ? 'text-9xl text-white' : 'w-[18rem] text-center',
                    gameStore.isTimerBlinking
                        ? 'animate-pulse text-red-600'
                        : gameStore.remainingTime <= 300
                          ? 'text-red-500'
                          : 'text-white',
                ]"
            >
                {{ isGameOver ? 'Игра окончена!' : `Осталось: ${gameStore.formattedTime}` }}
            </h2>
        </div>

        <!-- HUD: Спиннер загрузки результатов -->
        <div
            v-if="isGameOver"
            class="absolute z-50 left-1/2 mt-40 top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center"
        >
            <div class="w-24 h-24 border-8 border-white border-t-transparent rounded-full animate-spin"></div>
            <div class="mt-4 text-4xl text-white">Загрузка результатов, подождите…</div>
        </div>

        <!-- HUD: Приглашение начать игру -->
        <h1
            :class="[
                gameStore.phase === 'idle' ? 'opacity-100 bottom-10 animate-blink' : 'opacity-0 -bottom-40 pointer-events-none',
            ]"
            class="absolute z-50 border-b-2 border-white left-1/2 text-4xl text-white font-bold uppercase transition-all duration-700"
            style="transform: translate(-50%); font-family: 'Barboskin', serif"
        >
            Начать игру
        </h1>
    </div>
</template>

<style scoped>
@keyframes blink {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0.3;
    }
}

.animate-blink {
    animation: blink 1.5s infinite;
}
</style>
