<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Head, router } from '@inertiajs/vue3';
import ScenePodium from './PodiumComponents/ScenePodium.vue';
import type { RankedPlayer } from '@/Types/game';

const props = defineProps<{
    players: RankedPlayer[];
}>();

const visible = ref(false);

const buttonBottomStyle = computed(() => {
    const len = props.players.length;
    if (len === 2) return { bottom: '22rem' };
    if (len === 3) return { bottom: '19rem' };
    if (len === 4) return { bottom: '16rem' };
    if (len === 5) return { bottom: '13rem' };
    return {};
});

function back(): void {
    router.get('/');
}

onMounted(() => {
    setTimeout(() => {
        visible.value = true;
    }, 1000);
});
</script>

<template>
    <Head title="Результаты" />
    <div
        :class="visible ? 'opacity-100' : 'opacity-0'"
        style="cursor: url('/icons/Default.png') 0 5, auto"
        class="bg-black transition-all duration-1000 w-screen h-screen flex items-center justify-around"
    >
        <!-- 3D-сцена пьедестала (Чистый Three.js) -->
        <div class="w-7/12 h-full">
            <ScenePodium :players="players" />
        </div>

        <!-- Итоговая таблица лидеров -->
        <div class="w-5/12 h-full flex flex-col pb-14 items-center justify-center bg-black">
            <h2 class="text-5xl text-white barboskin">Итог:</h2>
            <transition-group name="player" tag="div" class="flex p-4 flex-col gap-2">
                <div
                    v-for="player in players"
                    :key="player.id"
                    class="flex py-3 px-6 items-center rounded-lg gap-4 transition-all border-gray-950 border-2 duration-300"
                    :class="{
                        'bg-gradient-to-r from-red-500 to-red-300': player.name === 'Красные',
                        'bg-gradient-to-r from-blue-500 to-blue-300': player.name === 'Синие',
                        'bg-gradient-to-r from-green-500 to-green-300': player.name === 'Зелёные',
                        'bg-gradient-to-r from-yellow-500 to-yellow-200': player.name === 'Жёлтые',
                        'bg-gradient-to-r from-violet-500 to-violet-300': player.name === 'Фиолетовые',
                    }"
                >
                    <div
                        class="bg-black ring-4 w-14 h-14 flex items-end justify-center ring-white/85 shadow rounded-full overflow-hidden"
                    >
                        <img :src="player.img" class="h-12 w-10 object-cover object-top" :alt="player.name" />
                    </div>
                    <div class="flex justify-between w-[20rem] items-center">
                        <h2 class="text-gray-800 barboskin text-3xl">{{ player.name }}</h2>
                        <h1
                            class="text-gray-800 barboskin text-4xl"
                            style="font-family: 'Barboskin', sans-serif;"
                        >
                            {{ player.calculatedScore }}
                        </h1>
                    </div>
                </div>
            </transition-group>

            <transition name="fade">
                <div class="absolute flex items-center gap-16" :style="buttonBottomStyle">
                    <div
                        class="relative overflow-hidden bg-pink-500 w-max text-center border-gray-800 border-b-[.6rem] hover:border-b-[.2rem] transition-all rounded-lg px-6 py-4 group"
                        @click="back"
                        style="cursor: url('/icons/Point.png') 0 0, auto"
                    >
                        <h1 style="font-family: 'Barboskin', sans-serif;" class="text-3xl text-white">
                            Вернуться на главную страницу
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

<style scoped>
.barboskin {
    font-family: 'Barboskin', sans-serif;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
.fade-enter-to,
.fade-leave-from {
    opacity: 1;
}
</style>
