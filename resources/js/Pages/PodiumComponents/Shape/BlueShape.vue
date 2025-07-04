<script setup>
import { useGLTF } from '@tresjs/cientos'

const { scene: model } = await useGLTF(
    '/shapes/Blue_shape.gltf',
)
</script>

<template>
    <primitive :object="model" cast-shadow receive-shadow
               :scale="[0.2, 0.2, 0.2]"
    />
</template>
