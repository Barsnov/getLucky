<script setup>
import { useGLTF } from '@tresjs/cientos'

const { scene: model } = await useGLTF(
    '/shapes/White_shape.gltf',
)
</script>

<template>
    <primitive :object="model"
               :scale="[0.2, 0.2, 0.2]"
    />
</template>
