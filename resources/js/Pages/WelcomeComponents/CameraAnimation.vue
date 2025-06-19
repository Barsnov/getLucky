<script setup>
import { useLoop } from '@tresjs/core'
import {shallowRef} from "vue";

const CameraAfk = shallowRef()

const { onBeforeRender } = useLoop()

let t = 0

onBeforeRender(() => {
    t += 0.01
    const radius = 1
    CameraAfk.value.position.x = radius * Math.sin(t)
    CameraAfk.value.position.y = radius * Math.cos(t)
    CameraAfk.value.position.z = 10 + Math.sin(t * 0.5) * 2
    CameraAfk.value.lookAt(0, 0, 0)
})
</script>

<template>
    <TresPerspectiveCamera ref="CameraAfk" :position="[0, 0, 0]" :fov="50" />
</template>
