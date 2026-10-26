<script setup lang="ts">
import { onMounted, onUnmounted, shallowRef } from 'vue';
import { WelcomeSceneManager } from '@/Game/Renderer/WelcomeSceneManager';

const canvasRef = shallowRef<HTMLCanvasElement | null>(null);
let sceneManager: WelcomeSceneManager | null = null;

onMounted(() => {
    if (canvasRef.value) {
        sceneManager = new WelcomeSceneManager(canvasRef.value);
    }
});

onUnmounted(() => {
    sceneManager?.dispose();
    sceneManager = null;
});
</script>

<template>
    <canvas ref="canvasRef" class="block w-screen h-screen" />
</template>
