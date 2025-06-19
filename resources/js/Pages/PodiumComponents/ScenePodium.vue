<script setup>
import {ref} from "vue";
import CameraAnimation from "./CameraAnimation.vue";
import BloomPodium from "./BloomPodium.vue";
import RedShape from "../PodiumComponents/Shape/RedShape.vue";
import YellowShape from "../PodiumComponents/Shape/YellowShape.vue";
import WhiteShape from "../PodiumComponents/Shape/WhiteShape.vue";
import GreenShape from "../PodiumComponents/Shape/GreenShape.vue";
import BlueShape from "../PodiumComponents/Shape/BlueShape.vue";
import {OrbitControls} from "@tresjs/cientos";

const props = defineProps({
    players: Array
})



</script>

<template>
    <TresAmbientLight :intensity=".2" />
    <TresDirectionalLight :position="[0, 100, 0]" :intensity=".6" :look-at="[0, 0, 0]" cast-shadow/>
    <OrbitControls/>
    <CameraAnimation/>
    <TresGroup>
        <TresMesh position-y="-2" receive-shadow>
            <TresBoxGeometry :args="[100, .2, 100]" />
            <TresMeshStandardMaterial :color="'#e6e74e'" />
        </TresMesh>
    </TresGroup>

    <TresGroup>
        <Suspense><RedShape cast-shadow ref="redShape" :position="[0, 1, 0]"></RedShape></Suspense>
        <Suspense><BlueShape cast-shadow ref="blueShape" :position="[1, 0, 1]"></BlueShape></Suspense>
        <Suspense><GreenShape cast-shadow ref="greenShape" :position="[-1, 0, 1]"></GreenShape></Suspense>
        <Suspense><YellowShape cast-shadow ref="yellowShape" :position="[1, 0, -1]"></YellowShape></Suspense>
        <Suspense><WhiteShape cast-shadow ref="whiteShape" :position="[-1, 0, -1]"></WhiteShape></Suspense>
    </TresGroup>
    <BloomPodium></BloomPodium>
</template>

<style scoped>

</style>
