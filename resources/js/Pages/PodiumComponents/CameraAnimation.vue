<script setup>
import { useLoop } from '@tresjs/core'
import {shallowRef} from "vue";

const CameraAfk = shallowRef()

const { onBeforeRender } = useLoop()

let t = 0

onBeforeRender(() => {
    if (!CameraAfk.value) return

    t += 0.002  // медленно вращается

    const radius = 6    // радиус окружности
    const height = 2    // высота камеры

    const x = radius * Math.sin(t)
    const z = radius * Math.cos(t)

    CameraAfk.value.position.set(x, height, z)
    CameraAfk.value.lookAt(0, 0, 0)
})
</script>

<template>
    <TresPerspectiveCamera ref="CameraAfk" :position="[0, 2, 6]" :look-at="[0, 0, 0]"  :fov="60"/>
</template>
