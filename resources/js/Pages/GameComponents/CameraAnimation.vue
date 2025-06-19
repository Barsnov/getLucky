<script setup>
import {useLoop} from '@tresjs/core'
import {shallowRef, watch} from "vue"
import * as THREE from 'three'

const props = defineProps({
    startGameIf: Boolean,
    targetPosition: Array, // [x, y, z] из Game.vue
})

const CameraAfk = shallowRef()
let t = 0
let afk = true
let doFinalCircle = false
let finalCircleComplete = false

const targetVec = new THREE.Vector3()

watch(() => props.startGameIf, (val) => {
    if (val)
        doFinalCircle = true
        t = 2 * Math.PI // Чтобы камера сразу переместилась в нужное положение
})

// watch(() => props.targetPosition, (val) => {
// })

watch(() => props.targetPosition, (pos) => {
    if(props.startGameIf === true) finalCircleComplete = true
    if (Array.isArray(pos) && pos.length === 3) {
        targetVec.set(...pos)
        if(pos[0] > 0){
            if(pos[2] > 0){
                targetVec.x = 6
                targetVec.z = 7.7
            }else if(pos[2] < 0){
                targetVec.x = 6
                targetVec.z = - 7.7
            }else{
                targetVec.x = 10
            }
        }else if(pos[0] < 0){
            if(pos[2] > 0){
                targetVec.x = -6
                targetVec.z = 7.7
            }else if(pos[2] < 0){
                targetVec.x = -6
                targetVec.z = - 7.7
            }else{
                targetVec.x = -10
            }
        }else{
            if(pos[2] > 0){
                targetVec.z = 10
            }else if(pos[2] < 0){
                targetVec.z = -10
            }else{
                targetVec.z = 10
            }
        }
        targetVec.y += 6 // чтобы камера смотрела сверху
    }
})

const {onBeforeRender} = useLoop()

onBeforeRender(() => {
    if (!CameraAfk.value) return

    if (afk && !doFinalCircle) {
        t += 0.001
        const radius = 15
        CameraAfk.value.position.x = radius * Math.sin(t)
        CameraAfk.value.position.z = radius * Math.cos(t)
        CameraAfk.value.position.y = 10 + Math.sin(t * 0.5) * 3
        CameraAfk.value.lookAt(0, 0, 0)
    }

    if (doFinalCircle && !finalCircleComplete) {
        t += 0.005
        const radius = 15
        CameraAfk.value.position.x = radius * Math.sin(t)
        CameraAfk.value.position.z = radius * Math.cos(t)
        CameraAfk.value.position.y = 8 + Math.sin(t * 0.5) * 3
        CameraAfk.value.lookAt(0, 0, 0)

        if (t >= 2 * Math.PI) {
            afk = false
            doFinalCircle = false
            finalCircleComplete = true
        }
    }

    if (finalCircleComplete) {
        CameraAfk.value.position.lerp(targetVec, 0.05)
        CameraAfk.value.lookAt(0, 0, 0)

        if (CameraAfk.value.position.distanceTo(targetVec) < 0.1) {
            finalCircleComplete = false
        }
    }
})
</script>

<template>
    <TresPerspectiveCamera ref="CameraAfk" :fov="40"/>
</template>
