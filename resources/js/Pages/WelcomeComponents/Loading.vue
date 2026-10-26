<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { router } from '@inertiajs/vue3';
import type { RawQuestionsPayload, Specialization } from '@/Types/cards';

const props = defineProps<{
    progress: number;
    specialization: Specialization;
    players: number;
    questions: RawQuestionsPayload | null;
}>();

const emit = defineEmits<{
    (e: 'nextPage'): void;
}>();

const show = ref(true);

watch(
    () => props.progress,
    (val) => {
        if (val >= 100) {
            setTimeout(() => {
                sessionStorage.removeItem('gameReloaded');
                emit('nextPage');
                router.post('/game/store', {
                    questions: props.questions as any,
                    players: props.players,
                });
            }, 1000);
        }
    }
);

const loadingMessage = computed(() => {
    if (props.progress < 40) return 'Подготовка игры...';
    if (props.progress < 80 && props.specialization.method === 1) return 'Генерируем вопросы...';
    if (props.progress < 80 && props.specialization.method === 0) return 'Получаем вопросы...';
    return 'Почти готово...';
});

const helperText = computed(() => {
    if (props.progress < 70) return 'Пожалуйста, подождите ⏳';
    return 'Это займёт всего несколько секунд 😊';
});
</script>

<template>
    <transition>
        <div v-if="show" class="flex flex-col items-center justify-center h-screen text-white">
            <h2
                class="text-6xl font-bold mb-4 animate-pulse text-white"
                style="text-shadow: 0 0 2rem #fff"
            >
                {{ loadingMessage }}
            </h2>

            <div class="w-2/3 mt-3 bg-white rounded-full h-5 shadow-inner overflow-hidden mb-2">
                <div
                    class="h-full transition-all duration-500 ease-in-out bg-blue-300"
                    :style="{ width: `${progress}%` }"
                ></div>
            </div>

            <p class="text-xl font-medium text-white">{{ progress }}%</p>

            <p class="mt-4 text-2xl text-white animate-blink" style="text-shadow: 0 0 1rem #fff">
                {{ helperText }}
            </p>
        </div>
    </transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

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
