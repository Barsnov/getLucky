<script lang="ts" setup>
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass'
import { UnrealBloomPass } from 'three-stdlib'
import { extend, useLoop, useTres } from '@tresjs/core'
import { shallowRef } from 'vue'

extend({ EffectComposer, OutputPass, UnrealBloomPass, RenderPass })
const { camera, renderer, scene, sizes} = useTres()

const composer = shallowRef<EffectComposer>()

useLoop().render(() => {
    if (composer.value) {
        composer.value!.render()
    }
})
</script>

<template>
    <TresEffectComposer
        ref="composer"
        :args="[renderer]"
        :set-size="[sizes.width?.value, sizes.height?.value]">
        <TresRenderPass
            :args="[scene, camera]"
            attach="passes-0"/>
        <TresUnrealBloomPass
            :args="[undefined, .5, 1, 0]"
            attach="passes-1"/>
        <TresOutputPass
            attach="passes-2"
            :set-size="[sizes.width?.value, sizes.height?.value]"/>
    </TresEffectComposer>
</template>
