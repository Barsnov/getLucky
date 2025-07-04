<script lang="ts" setup>
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass'
import { UnrealBloomPass } from 'three-stdlib'
import { extend, useLoop, useTres } from '@tresjs/core'
import {shallowRef} from 'vue'
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'

extend({ ShaderPass })
extend({ EffectComposer, OutputPass, UnrealBloomPass, RenderPass })
const { camera, renderer, scene, sizes} = useTres()

const composer : shallowRef<EffectComposer | null> = shallowRef(null)

const pixelRatio = renderer.value.getPixelRatio()
const fxaaPass = new ShaderPass(FXAAShader)
fxaaPass.material.uniforms['resolution'].value = new THREE.Vector2(
    1 / (sizes.width * pixelRatio),
    1 / (sizes.height * pixelRatio)
)

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
        :set-size="[sizes.width?.value, sizes.height?.value]"
    >
        <TresRenderPass
            :args="[scene, camera]"
            attach="passes-0"
        />
        <TresUnrealBloomPass
            :args="[undefined, .2, .01, 0]"
            attach="passes-1"
        />
        <TresOutputPass
            attach="passes-2"
            :set-size="[sizes.width?.value, sizes.height?.value]"
        />
    </TresEffectComposer>
</template>
