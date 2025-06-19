<script setup>
import * as THREE from 'three'
import {computed} from "vue";

const props = defineProps({
    position: Array
})

const newPosition = computed(() => {
    return props.position.map((value, index) =>
        index === 1 ? value + .6 : value
    );
});

const haloGeometry = new THREE.TorusGeometry(0.2, 0.05, 32, 100)
const haloMaterial = new THREE.MeshBasicMaterial({
    color: '#ffffff',
    transparent: true,
    opacity: 0.6
})

</script>

<template>
    <TresMesh :geometry="haloGeometry" :material="haloMaterial"
        :position="newPosition" :position-y="1" :rotation="[-Math.PI / 2, 0, 0]"
    />
</template>

<style scoped>

</style>
