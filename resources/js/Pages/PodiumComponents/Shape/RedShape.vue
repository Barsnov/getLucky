<script setup>
import { useGLTF } from '@tresjs/cientos'

const { scene: model} = await useGLTF(
    '/shapes/Red_shape.gltf',
)
</script>

<template>
    <primitive cast-shadow receive-shadow :object="model" :scale="[0.2, 0.2, 0.2]"/>
</template>
