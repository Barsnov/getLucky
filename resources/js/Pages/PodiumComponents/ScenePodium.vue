<script setup lang="ts">
import { onMounted, onUnmounted, shallowRef } from 'vue';
import { PodiumSceneManager } from '@/Game/Renderer/PodiumSceneManager';
import type { RankedPlayer } from '@/Types/game';

const props = defineProps<{
    players: RankedPlayer[];
}>();

const canvasRef = shallowRef<HTMLCanvasElement | null>(null);
let sceneManager: PodiumSceneManager | null = null;

onMounted(() => {
    if (canvasRef.value) {
        sceneManager = new PodiumSceneManager(canvasRef.value, props.players);
    }
});

onUnmounted(() => {
    sceneManager?.dispose();
    sceneManager = null;
});
</script>

<template>
    <canvas
        ref="canvasRef"
        style="cursor: url('/icons/Default.png') 0 5, auto"
        class="canvas cursor-pointer block w-full h-full"
    />
</template>
