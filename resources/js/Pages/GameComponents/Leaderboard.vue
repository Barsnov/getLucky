<script setup lang="ts">
import { useGameStore } from '@/Stores/useGameStore';

const gameStore = useGameStore();
</script>

<template>
    <div class="absolute z-40 right-[1rem] top-[7rem] shadow shadow-gray-800 bg-gray-950/50 rounded-xl backdrop-blur-md">
        <transition-group name="player" tag="div" class="flex p-4 flex-col gap-2">
            <div
                v-for="player in gameStore.rankedPlayers"
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
                <div class="bg-black ring-4 w-14 h-14 flex items-end justify-center ring-white/85 shadow rounded-full overflow-hidden">
                    <img :src="player.img" class="h-12 w-10 object-cover object-top" :alt="player.name" />
                </div>
                <div class="flex justify-between w-[10rem] items-center">
                    <h2 class="text-gray-800 barboskin text-2xl">{{ player.name }}</h2>
                    <h1 class="text-gray-800 barboskin text-3xl" style="font-family: 'Barboskin', sans-serif;">
                        {{ player.calculatedScore }}
                    </h1>
                </div>
            </div>
        </transition-group>
    </div>
</template>

<style scoped>
.barboskin {
    font-family: Barboskin, sans-serif;
}

.player-card {
    padding: 0.5rem;
    border-radius: 1rem;
    transition: all 0.3s ease;
}
</style>
