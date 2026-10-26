<script setup lang="ts">
import { ref } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Pagination } from 'swiper/modules';
import type { Swiper as SwiperInstance } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/a11y';

import { useAudioStore } from '@/Stores/useAudioStore';
import type { Specialization } from '@/Types/cards';

defineProps<{
    specializations: Specialization[];
}>();

const emit = defineEmits<{
    (e: 'startGame', players: number, specialization: Specialization): void;
}>();

const modules = [Pagination];
const audio = useAudioStore();

const players = ref<number | null>(null);
const swiperOne = ref<SwiperInstance | null>(null);
const swiperTwo = ref<SwiperInstance | null>(null);
const selectedSpecialization = ref<Specialization | null>(null);
const isDropdownOpen = ref(false);

const smartChipOne = ref<HTMLImageElement | null>(null);
const smartChipTwo = ref<HTMLImageElement | null>(null);
const smartChipThree = ref<HTMLImageElement | null>(null);

function onSwiperOne(swiper: SwiperInstance): void {
    swiperOne.value = swiper;
}

function onSwiperTwo(swiper: SwiperInstance): void {
    swiperTwo.value = swiper;
}

function changeSwiperTwo(index: number): void {
    swiperTwo.value?.slideTo(index);
}

function restartChipAnimation(el: HTMLImageElement | null, className: string): void {
    if (!el) return;
    el.classList.remove(className);
    void el.offsetWidth;
    el.classList.add(className);
}

function animationSmartChipOne(): void {
    audio.playSfx('whip');
    restartChipAnimation(smartChipOne.value, 'smartChipOne');
    smartChipTwo.value?.classList.remove('smartChipTwo');
}

function animationSmartChipTwo(): void {
    audio.playSfx('whip');
    restartChipAnimation(smartChipTwo.value, 'smartChipTwo');
    smartChipThree.value?.classList.remove('smartChipThree');
}

function animationSmartChipThree(): void {
    audio.playSfx('whip');
    restartChipAnimation(smartChipThree.value, 'smartChipThree');
}

function chosePlayer(chosen: number): void {
    audio.playSfx('hexAction');
    players.value = chosen;
}

function handleStartGame(): void {
    if (players.value !== null && selectedSpecialization.value !== null) {
        emit('startGame', players.value, selectedSpecialization.value);
    }
}
</script>

<template>
    <div class="absolute left-0 top-0 z-20 flex flex-col items-center justify-around w-full h-full">
        <Swiper
            :modules="modules"
            :allow-touch-move="false"
            :pagination="{ clickable: false }"
            :slides-per-view="1"
            :nested="true"
            :space-between="50"
            :centered-slides="true"
            :enabled="true"
            @swiper="onSwiperOne"
            class="bg-white w-4/6 h-4/5 transition-all px-8 py-6 rounded-2xl"
            style="position: relative !important; box-shadow: 0 0 3rem rgba(255, 255, 255, 0.7)"
        >
            <div class="swiper-pagination"></div>

            <!-- Слайд 1: Описание игры -->
            <SwiperSlide>
                <div class="w-full h-full flex flex-col items-end justify-between py-10 relative">
                    <img
                        ref="smartChipOne"
                        class="smartChipOne absolute w-48"
                        src="/images/Swiper_One_Slide.svg"
                        alt="умная фишка"
                        style="left: -10rem; bottom: -25rem; rotate: 25deg"
                    />
                    <div class="w-full">
                        <div class="relative">
                            <h1 class="barboskin relative text-7xl ms-10 -tracking-tighter font-black black uppercase">
                                Что такое <span class="barboskin font-black text-black">"Лови Удачу!"</span>
                            </h1>
                            <h1
                                class="barboskin absolute top-0 -tracking-tighter left-9 text-7xl font-medium text-fuchsia-300 uppercase"
                                style="text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black;"
                            >
                                Что такое <span class="barboskin font-black text-fuchsia-500">"Лови Удачу!"</span>
                            </h1>
                        </div>
                        <div class="w-full flex justify-end relative">
                            <p class="mt-10 barboskin tracking-wide indent-12 text-justify text-5xl text-gray-900 font-black">
                                Это увлекательная, динамичная командная игра, в которой участники соревнуются за звание
                                лучших специалистов в своей области. Команды отвечают на вопросы различной сложности,
                                проверяя свои знания, зарабатывают очки и захватывают поля.
                            </p>
                        </div>
                    </div>

                    <div
                        class="barboskin px-4 py-2 transition-all duration-150 rounded bg-fuchsia-500 text-3xl font-medium border-2 text-white border-black border-b-8 hover:border-b-2"
                        style="cursor: url('/icons/Point.png') 5 0, auto"
                        @click="
                            swiperOne?.slideNext();
                            animationSmartChipTwo();
                        "
                    >
                        Выбрать категорию
                    </div>
                </div>
            </SwiperSlide>

            <!-- Слайд 2: Выбор специальности -->
            <SwiperSlide>
                <div class="w-full h-full flex flex-col items-center justify-between py-10">
                    <img
                        ref="smartChipTwo"
                        class="absolute w-48"
                        src="/images/Swiper_One_Slide.svg"
                        alt="умная фишка"
                        style="left: -24rem; top: -24rem; rotate: 135deg"
                    />
                    <div class="flex justify-between mt-60 gap-10">
                        <p class="barboskin indent-8 text-justify text-4xl font-black w-6/12">
                            Прежде чем начинать сражение, нужно определиться со специальностью, в которой будет
                            происходить состязание
                        </p>

                        <div class="relative w-6/12">
                            <div
                                @click="isDropdownOpen = !isDropdownOpen"
                                class="barboskin custom-select border-2 border-black rounded text-3xl tracking-widest font-medium py-2 px-4 w-full text-center"
                                style="cursor: url('/icons/Point.png') 5 0, auto"
                            >
                                {{ selectedSpecialization?.name || 'Выберите специальность' }}
                            </div>

                            <div
                                v-show="isDropdownOpen"
                                class="absolute w-full bg-white border border-black rounded mt-1 z-30"
                            >
                                <div
                                    v-for="specialization in specializations"
                                    :key="specialization.id"
                                    @click="
                                        isDropdownOpen = false;
                                        selectedSpecialization = specialization;
                                    "
                                    class="barboskin option tracking-widest p-2 hover:bg-gray-200 text-2xl text-gray-600"
                                    style="cursor: url('/icons/Point.png') 5 0, auto"
                                >
                                    {{ specialization.name }}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="w-full flex justify-between items-end">
                        <div
                            class="barboskin px-4 py-2 rounded transition-all duration-150 text-white bg-indigo-500 text-3xl font-medium border-2 border-black border-b-8 hover:border-b-2"
                            style="cursor: url('/icons/Point.png') 5 0, auto"
                            @click="
                                swiperOne?.slidePrev();
                                animationSmartChipOne();
                            "
                        >
                            Об игрушке
                        </div>
                        <div
                            class="barboskin px-4 py-2 rounded transition-all duration-150 text-white bg-fuchsia-500 text-3xl font-medium border-2 border-black border-b-8 hover:border-b-2"
                            style="cursor: url('/icons/Point.png') 5 0, auto"
                            @click="
                                swiperOne?.slideNext();
                                animationSmartChipThree();
                            "
                        >
                            Выбрать количество команд
                        </div>
                    </div>
                </div>
            </SwiperSlide>

            <!-- Слайд 3: Выбор количества команд -->
            <SwiperSlide>
                <div class="w-full h-full flex flex-col items-center justify-between py-10">
                    <img
                        ref="smartChipThree"
                        class="smartChipThree absolute w-48"
                        src="/images/Swiper_One_Slide.svg"
                        alt="умная фишка"
                        style="left: 20rem; bottom: -30rem;"
                    />
                    <div class="w-full flex justify-between items-center mt-16">
                        <p class="indent-10 text-justify barboskin text-balance text-4xl font-bold w-5/12">
                            Перед началом нужно определиться с количеством команд, участвующих в сражении!
                        </p>
                        <div class="w-6/12 flex flex-col items-center">
                            <Swiper
                                :allow-touch-move="false"
                                :nested="true"
                                :slides-per-view="1"
                                :space-between="70"
                                :centered-slides="true"
                                :enabled="true"
                                @swiper="onSwiperTwo"
                                class="w-full transition-all px-8 py-6 rounded-2xl"
                            >
                                <SwiperSlide>
                                    <div
                                        class="w-full flex gap-2 items-center justify-center p-5 rounded-2xl"
                                        style="box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.4)"
                                    >
                                        <img class="w-20" src="/images/Swiper_One_Slide.svg" alt="" />
                                    </div>
                                </SwiperSlide>
                                <SwiperSlide>
                                    <div
                                        class="w-full flex gap-2 items-center justify-center p-5 rounded-2xl"
                                        style="box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.4)"
                                    >
                                        <img class="w-20" src="/images/Blue_chip.svg" alt="" />
                                        <img class="w-20" src="/images/Red_chip.svg" alt="" />
                                    </div>
                                </SwiperSlide>
                                <SwiperSlide>
                                    <div
                                        class="w-full flex gap-2 items-center justify-center p-5 rounded-2xl"
                                        style="box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.4)"
                                    >
                                        <img class="w-20" src="/images/Blue_chip.svg" alt="" />
                                        <img class="w-20" src="/images/Red_chip.svg" alt="" />
                                        <img class="w-20" src="/images/Green_chip.svg" alt="" />
                                    </div>
                                </SwiperSlide>
                                <SwiperSlide>
                                    <div
                                        class="w-full flex gap-2 items-center justify-center p-5 rounded-2xl"
                                        style="box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.4)"
                                    >
                                        <img class="w-20" src="/images/Blue_chip.svg" alt="" />
                                        <img class="w-20" src="/images/Red_chip.svg" alt="" />
                                        <img class="w-20" src="/images/Green_chip.svg" alt="" />
                                        <img class="w-20" src="/images/Yellow_chip.svg" alt="" />
                                    </div>
                                </SwiperSlide>
                                <SwiperSlide>
                                    <div
                                        class="w-full flex gap-2 items-center justify-center p-5 rounded-2xl"
                                        style="box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.4)"
                                    >
                                        <img class="w-[4.8rem]" src="/images/Blue_chip.svg" alt="" />
                                        <img class="w-[4.8rem]" src="/images/Red_chip.svg" alt="" />
                                        <img class="w-[4.8rem]" src="/images/Green_chip.svg" alt="" />
                                        <img class="w-[4.8rem]" src="/images/Yellow_chip.svg" alt="" />
                                        <img class="w-[4rem]" src="/images/Purple_chip.svg" alt="" />
                                    </div>
                                </SwiperSlide>
                            </Swiper>
                            <h4 class="text-3xl mt-5 barboskin">Количество игроков</h4>
                            <div class="flex gap-4 items-center mt-8">
                                <div
                                    v-for="(count, idx) in [2, 3, 4, 5]"
                                    :key="count"
                                    @click="
                                        chosePlayer(count);
                                        changeSwiperTwo(idx + 1);
                                    "
                                    :class="
                                        players === count
                                            ? 'bg-blue-400 border-b-2'
                                            : 'bg-gray-400 border-b-8'
                                    "
                                    style="cursor: url('/icons/Point.png') 5 0, auto"
                                    class="barboskin px-10 py-4 rounded-xl text-4xl border-black border-2 transition-all duration-150"
                                >
                                    {{ count }}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="w-full flex justify-between items-end">
                        <div
                            class="barboskin px-4 py-2 transition-all duration-150 rounded text-white bg-indigo-500 text-3xl font-medium border-2 border-black border-b-8 hover:border-b-2"
                            style="cursor: url('/icons/Point.png') 15 15, auto"
                            @click="
                                swiperOne?.slidePrev();
                                animationSmartChipTwo();
                            "
                        >
                            Выбрать категорию
                        </div>
                        <div
                            class="barboskin px-4 py-2 transition-all duration-150 rounded text-white text-3xl font-medium border-2 border-black border-b-8"
                            :style="
                                players !== null && selectedSpecialization !== null
                                    ? `cursor: url('/icons/Point.png') 5 0, auto`
                                    : `cursor: url('/icons/NotAllowed.png') 5 0, auto`
                            "
                            :class="
                                players !== null && selectedSpecialization !== null
                                    ? 'bg-fuchsia-500 hover:border-b-2'
                                    : 'bg-gray-500'
                            "
                            @click="handleStartGame"
                        >
                            Начать игру
                        </div>
                    </div>
                </div>
            </SwiperSlide>
        </Swiper>
    </div>
</template>

<style scoped>
.barboskin {
    font-family: Barboskin, sans-serif;
}

p {
    font-family: RobotoCondensed, serif;
}

.custom-select {
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    background-image: url('data:image/svg+xml;utf8,<svg fill="%23000000" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5H7z"/></svg>');
    background-repeat: no-repeat;
    background-position: right 10px center;
    background-size: 16px;
    padding-right: 30px;
}

.smartChipOne {
    animation: swiperSlideOne 2s ease-out forwards;
}

.smartChipTwo {
    animation: swiperSlideTwo 2s ease-out forwards;
}

.smartChipThree {
    animation: swiperSlideThree 2s ease-out forwards;
}

@keyframes swiperSlideOne {
    0% {
        left: -20rem;
        bottom: -20rem;
    }
    100% {
        left: -3rem;
        bottom: -10rem;
    }
}

@keyframes swiperSlideTwo {
    0% {
        left: -20rem;
        top: -20rem;
    }
    100% {
        left: -4rem;
        top: -10rem;
    }
}

@keyframes swiperSlideThree {
    0% {
        bottom: -30rem;
    }
    100% {
        bottom: -8rem;
    }
}
</style>
