import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export interface BloomConfig {
    strength?: number;
    radius?: number;
    threshold?: number;
}

export class PostProcessingManager {
    private composer: EffectComposer;
    private bloomPass: UnrealBloomPass;
    private outputPass: OutputPass;

    constructor(
        renderer: THREE.WebGLRenderer,
        scene: THREE.Scene,
        camera: THREE.Camera,
        width: number,
        height: number,
        bloomConfig: BloomConfig = {}
    ) {
        this.composer = new EffectComposer(renderer);
        this.composer.setSize(width, height);

        const renderPass = new RenderPass(scene, camera);
        this.composer.addPass(renderPass);

        const strength = bloomConfig.strength ?? 0.2;
        const radius = bloomConfig.radius ?? 0.01;
        const threshold = bloomConfig.threshold ?? 0;

        this.bloomPass = new UnrealBloomPass(
            new THREE.Vector2(width, height),
            strength,
            radius,
            threshold
        );
        this.composer.addPass(this.bloomPass);

        this.outputPass = new OutputPass();
        this.composer.addPass(this.outputPass);
    }

    public setSize(width: number, height: number): void {
        this.composer.setSize(width, height);
        this.bloomPass.resolution.set(width, height);
    }

    public render(): void {
        this.composer.render();
    }

    public dispose(): void {
        this.outputPass.dispose?.();
        this.bloomPass.dispose?.();
        this.composer.dispose();
    }
}
