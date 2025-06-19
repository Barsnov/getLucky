<script setup>
import {ref, onMounted} from 'vue';
import { TresCanvas, extend } from '@tresjs/core';
import { OrbitControls } from '@tresjs/cientos';
import * as THREE from 'three';

import CameraAnimation from "./CameraAnimation.vue";
import BloomBack from "./BloomBack.vue";

extend({ OrbitControls})

const hexGrid = ref([]);

const getRandomColor = () => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return new THREE.Color(r / 255, g / 255, b / 255);
};

const createHex = (position) => {
    const segments = Math.floor(Math.random() * 6) + 3; // от 3 до 7
    const radius = 0.5;
    const height = 0.1;

    const geometry = new THREE.CylinderGeometry(radius, radius, height, segments);
    const edgesGeometry = new THREE.EdgesGeometry(geometry);
    const color = new THREE.Color(0, 0, 0);
    const rotation = new THREE.Euler(Math.PI / 2, 0, 0);

    const lineMaterial = new THREE.LineBasicMaterial({
        color,
        toneMapped: false,
    });

    return {
        position,
        rotation,
        color,
        edgesGeometry,
        lineMaterial,
    };
};

const createHexGrid = () => {
    const hexes = [];
    const circleCount = 15;
    const unit = Math.sqrt(3) * 0.6 * 1.022;
    const angle = Math.PI / 3;
    const axis = new THREE.Vector3(0, 0, 1);
    const axisVector = new THREE.Vector3(0, -unit, 0);
    const sideVector = new THREE.Vector3(0, unit, 0).applyAxisAngle(axis, -angle);
    const vec3 = new THREE.Vector3();

    for (let seg = 0; seg < 6; seg++) {
        for (let ax = 1; ax <= circleCount; ax++) {
            for (let sd = 0; sd < ax; sd++) {
                vec3.copy(axisVector)
                    .multiplyScalar(ax)
                    .addScaledVector(sideVector, sd)
                    .applyAxisAngle(axis, (angle * seg) + (Math.PI / 6));

                hexes.push(createHex(vec3.clone()));
            }
        }
    }

    hexes.push(createHex(new THREE.Vector3()));

    hexGrid.value = hexes;
};

const timer = ref()

const highlightRandomHex = () => {
    setInterval(() => {
        const randomIndex = Math.floor(Math.random() * hexGrid.value.length);
        const randomHex = hexGrid.value[randomIndex];
        randomHex.lineMaterial.color = getRandomColor(); // Меняем цвет

        timer.value = setTimeout(()=>{randomHex.lineMaterial.color = new THREE.Color('#000000')}, 5000) // Меняем цвет)
    }, 100); // Интервал 100ms
};

onMounted(()=>{
    createHexGrid()
    highlightRandomHex();
})
</script>

<template>
    <TresCanvas preset="realistic" :clear-color="'#000000'" window-size>
        <CameraAnimation/>
        <BloomBack></BloomBack>
        <TresGroup>
            <!-- Грани шестиугольников -->
            <TresLineSegments
                v-for="(hex, index) in hexGrid"
                :key="'edge' + index"
                :geometry="hex.edgesGeometry"
                :material="hex.lineMaterial"
                :position="[hex.position.x, hex.position.y, hex.position.z]"
                :rotation="[hex.rotation.x, hex.rotation.y, hex.rotation.z]"
                :emissive="hex.lineMaterial" :emissive-intensity="10"
            />
        </TresGroup>
        <TresMesh :position="[0, 0, -50]">
            <TresPlaneGeometry :args="[200, 200]" />
            <TresMeshBasicMaterial :color="'#0e030e'" />
        </TresMesh>
    </TresCanvas>
</template>
