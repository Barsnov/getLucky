<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { Head } from '@inertiajs/vue3';
import { Swiper, SwiperSlide } from 'swiper/vue';
import type { Swiper as SwiperInstance } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/a11y';

import { useAudioStore } from '@/Stores/useAudioStore';
import OneSlider from './WelcomeComponents/OneSlider.vue';
import TwoSlider from './WelcomeComponents/TwoSlider.vue';
import ThreeSlider from './WelcomeComponents/ThreeSlider.vue';
import BackScene from './WelcomeComponents/BackScene.vue';
import type { Specialization } from '@/Types/cards';

defineProps<{
    specializations: Specialization[];
}>();

const audio = useAudioStore();

const opacityGame = ref(false);
const swiperOne = ref<SwiperInstance | null>(null);
const canProceedNext = ref(false);
const showContinuePrompt = ref(true);
const continueReady = ref(false);
const continueBlinking = ref(false);

const threeSlide = ref(false);
const playersCount = ref<number>(2);
const selectedSpecialization = ref<Specialization | null>(null);

const timers: ReturnType<typeof setTimeout>[] = [];

function onSwiperOne(swiper: SwiperInstance): void {
    swiperOne.value = swiper;
}

function handleScreenClick(): void {
    if (!canProceedNext.value) return;
    canProceedNext.value = false;
    swiperOne.value?.slideNext();
    timers.push(
        setTimeout(() => {
            showContinuePrompt.value = false;
        }, 700)
    );
    audio.playSfx('whoosh');
}

function startGame(players: number, specialization: Specialization): void {
    audio.fadeWelcomeBgm(0.02, 1000);
    audio.playSfx('whoosh');
    swiperOne.value?.slideNext();
    playersCount.value = players;
    selectedSpecialization.value = specialization;
    threeSlide.value = true;
}

function nextPage(): void {
    audio.stopBgm();
}

onMounted(() => {
    timers.push(
        setTimeout(() => {
            opacityGame.value = true;
            timers.push(
                setTimeout(() => {
                    continueReady.value = true;
                    canProceedNext.value = true;
                    audio.playWelcomeBgm();
                    timers.push(
                        setTimeout(() => {
                            continueBlinking.value = true;
                        }, 1000)
                    );
                }, 2000)
            );
        }, 2000)
    );
});

onUnmounted(() => {
    timers.forEach((t) => clearTimeout(t));
});
</script>

<template>
    <Head title="Начальная" />
    <div
        @click="handleScreenClick"
        class="relative w-screen h-screen"
        :class="[opacityGame ? 'opacity-100' : 'opacity-0', canProceedNext ? 'point' : '']"
        style="transition: 2s; cursor: url('/icons/Default.png') 0 0, auto"
    >
        <div class="h-screen w-screen backdrop-blur overflow-hidden">
            <BackScene />
        </div>

        <h2
            v-if="showContinuePrompt"
            class="absolute z-50 bottom-10 left-1/2 text-white underline text-3xl tracking-wider transition-opacity duration-1000"
            :class="[
                continueReady ? 'opacity-100' : 'opacity-0',
                continueBlinking ? 'continueGame' : '',
            ]"
            style="
                transform: translate(-50%, 50%);
                font-family: 'Barboskin', sans-serif;
                text-shadow: 0 0 0.2rem #fff;
            "
        >
            Нажмите, чтобы продолжить
        </h2>

        <Swiper
            direction="vertical"
            :mousewheel="false"
            :speed="2000"
            :allowTouchMove="false"
            class="w-screen left-0 top-0 h-screen absolute z-20"
            @swiper="onSwiperOne"
        >
            <SwiperSlide>
                <OneSlider />
            </SwiperSlide>
            <SwiperSlide>
                <TwoSlider @startGame="startGame" :specializations="specializations" />
            </SwiperSlide>
            <SwiperSlide>
                <ThreeSlider
                    v-if="threeSlide && selectedSpecialization"
                    @nextPage="nextPage"
                    :players="playersCount"
                    :specialization="selectedSpecialization"
                />
            </SwiperSlide>
        </Swiper>
    </div>
</template>

<style>
.continueGame {
    animation: animateContinue 1.5s alternate infinite ease-in-out;
}
.point {
    cursor: url('/icons/Point.png') 5 0, auto !important;
}
@keyframes animateContinue {
    0% {
        opacity: 1;
    }
    100% {
        opacity: 0.2;
    }
}
</style>
