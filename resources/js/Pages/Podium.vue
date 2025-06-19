<script setup>
import {TresCanvas} from "@tresjs/core";
import ScenePodium from './PodiumComponents/ScenePodium.vue'

const props = defineProps({
    players: Array
});
</script>

<template>
    <TresCanvas class="cursor-pointer" ref="canvasRef" :clear-color="'#572f2f'" window-size :antialias="true">
        <ScenePodium :players="players"/>
    </TresCanvas>
</template>

<style scoped>

</style>
