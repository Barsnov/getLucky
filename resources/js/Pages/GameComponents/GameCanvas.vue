<script setup lang="ts">
import { onMounted, onUnmounted, shallowRef } from 'vue';
import { useGameStore } from '@/Stores/useGameStore';
import { SceneManager } from '@/Game/Renderer/SceneManager';

const gameStore = useGameStore();
const canvasRef = shallowRef<HTMLCanvasElement | null>(null);
let sceneManager: SceneManager | null = null;

onMounted(() => {
    if (canvasRef.value) {
        sceneManager = new SceneManager(canvasRef.value, gameStore);
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
        class="block w-screen h-screen"
        :style="{ cursor: gameStore.cursorStyle }"
    />
</template>
