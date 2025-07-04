<script setup>
import CameraAnimation from "./CameraAnimation.vue";
import BloomPodium from "./BloomPodium.vue";
import RedShape from "../PodiumComponents/Shape/RedShape.vue";
import YellowShape from "../PodiumComponents/Shape/YellowShape.vue";
import PurpleShape from "../PodiumComponents/Shape/PurpleShape.vue";
import GreenShape from "../PodiumComponents/Shape/GreenShape.vue";
import BlueShape from "../PodiumComponents/Shape/BlueShape.vue";

const props = defineProps({
    players: Array
})

const podiums = [
    {position: [0, .1, 0], arg: [.8, 1.5, .8]},
    {position: [.9, 0, 0], arg: [.8, 1, .8]},
    {position: [-.9, -.2, 0], arg: [.8, .7, .8]},
    {position: [-.5, -.31, 1], arg: [.8, .4, .9]},
    {position: [.4, -.35, 1], arg: [.8, .1, .8]}
]

const shapeComponents = {
    'Красные': RedShape,
    'Синие': BlueShape,
    'Зелёные': GreenShape,
    'Жёлтые': YellowShape,
    'Фиолетовые': PurpleShape,
}

const podiumPositions = {
    1: [0, 1.2, 0],
    2: [0.9, 0.9, 0],
    3: [-.9, .5, 0],
    4: [-.5, .3, 1],
    5: [.4, .1, 1],
}
</script>

<template>
    <TresAmbientLight :intensity=".7"/>
    <TresSpotLight :position="[0, 5, 0]" :angle="Math.PI / 6" :penumbra=".1" :decay="1" :distance="50" cast-shadow
                   :intensity="15"/>
    <CameraAnimation/>
    <TresGroup>
        <TresMesh position-y="-.5" receive-shadow>
            <TresBoxGeometry :args="[100, .2, 100]" />
            <TresMeshStandardMaterial :color="'#1a1616'" />
        </TresMesh>
    </TresGroup>

    <TresGroup>
        <template v-for="(podium, index) in podiums" :key="index">
            <TresMesh v-if="index < players.length" :position="podium.position" cast-shadow receive-shadow>
                <TresBoxGeometry :args="podium.arg" />
                <TresMeshStandardMaterial :color="'#c9b6ff'" metalness="0.4" roughness="0.6" />
            </TresMesh>
        </template>
    </TresGroup>

    <TresGroup>
        <Suspense v-for="player in players" :key="player.id">
            <component
                :is="shapeComponents[player.name]"
                :position="podiumPositions[player.place]"
            />
        </Suspense>
    </TresGroup>
    <BloomPodium></BloomPodium>
</template>
