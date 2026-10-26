import * as THREE from 'three';
import { AssetLoader } from './AssetLoader';
import { PostProcessingManager } from './PostProcessingManager';
import { PLAYER_CONFIGS } from '@/Game/Core/PlayerRegistry';
import type { RankedPlayer, Vec3Tuple } from '@/Types/game';

interface PodiumSpec {
    position: Vec3Tuple;
    size: Vec3Tuple;
}

const PODIUM_SPECS: readonly PodiumSpec[] = [
    { position: [0, 0.1, 0], size: [0.8, 1.5, 0.8] },
    { position: [0.9, 0, 0], size: [0.8, 1.0, 0.8] },
    { position: [-0.9, -0.2, 0], size: [0.8, 0.7, 0.8] },
    { position: [-0.5, -0.31, 1], size: [0.8, 0.4, 0.9] },
    { position: [0.4, -0.35, 1], size: [0.8, 0.1, 0.8] },
];

const PODIUM_PIECE_POSITIONS: Record<number, Vec3Tuple> = {
    1: [0, 1.2, 0],
    2: [0.9, 0.9, 0],
    3: [-0.9, 0.5, 0],
    4: [-0.5, 0.3, 1],
    5: [0.4, 0.1, 1],
};

const MODEL_BY_NAME: Record<string, string> = Object.fromEntries(
    PLAYER_CONFIGS.map((cfg) => [cfg.name, cfg.modelPath])
);

export class PodiumSceneManager {
    private readonly canvas: HTMLCanvasElement;
    private readonly scene: THREE.Scene;
    private readonly camera: THREE.PerspectiveCamera;
    private readonly renderer: THREE.WebGLRenderer;
    private readonly postProcessing: PostProcessingManager;
    private readonly clock = new THREE.Clock();

    private readonly disposableGeometries: THREE.BufferGeometry[] = [];
    private readonly disposableMaterials: THREE.Material[] = [];

    private orbitAngle = 0;
    private animationFrameId: number | null = null;
    private isDisposed = false;
    private readonly boundOnResize: () => void;

    constructor(canvas: HTMLCanvasElement, players: RankedPlayer[]) {
        this.canvas = canvas;
        const { width, height } = this.getCanvasDimensions();

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color('#000000');

        this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
        this.camera.position.set(0, 2, 6);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            powerPreference: 'high-performance',
        });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(width, height);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.setupLights();
        this.buildFloorAndPodiums(players.length);
        this.loadWinnerModels(players);

        this.postProcessing = new PostProcessingManager(
            this.renderer,
            this.scene,
            this.camera,
            width,
            height,
            { strength: 0.2, radius: 0.01, threshold: 0 }
        );

        this.boundOnResize = this.handleResize.bind(this);
        window.addEventListener('resize', this.boundOnResize);

        this.startLoop();
    }

    private getCanvasDimensions(): { width: number; height: number } {
        const parent = this.canvas.parentElement;
        const width = parent?.clientWidth || Math.floor(window.innerWidth * (7 / 12));
        const height = parent?.clientHeight || window.innerHeight;
        return { width: Math.max(1, width), height: Math.max(1, height) };
    }

    private setupLights(): void {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        this.scene.add(ambientLight);

        const spotLight = new THREE.SpotLight(0xffffff, 15, 50, Math.PI / 6, 0.1, 1);
        spotLight.position.set(0, 5, 0);
        spotLight.castShadow = true;
        this.scene.add(spotLight);
    }

    private buildFloorAndPodiums(playersCount: number): void {
        const floorGeo = new THREE.BoxGeometry(100, 0.2, 100);
        const floorMat = new THREE.MeshStandardMaterial({ color: '#1a1616' });
        const floorMesh = new THREE.Mesh(floorGeo, floorMat);
        floorMesh.position.set(0, -0.5, 0);
        floorMesh.receiveShadow = true;
        this.scene.add(floorMesh);

        this.disposableGeometries.push(floorGeo);
        this.disposableMaterials.push(floorMat);

        const podiumMat = new THREE.MeshStandardMaterial({
            color: '#c9b6ff',
            metalness: 0.4,
            roughness: 0.6,
        });
        this.disposableMaterials.push(podiumMat);

        const count = Math.min(PODIUM_SPECS.length, playersCount);
        for (let i = 0; i < count; i++) {
            const spec = PODIUM_SPECS[i];
            const geo = new THREE.BoxGeometry(spec.size[0], spec.size[1], spec.size[2]);
            const mesh = new THREE.Mesh(geo, podiumMat);
            mesh.position.set(spec.position[0], spec.position[1], spec.position[2]);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            this.scene.add(mesh);
            this.disposableGeometries.push(geo);
        }
    }

    private loadWinnerModels(players: RankedPlayer[]): void {
        for (const player of players) {
            const modelUrl = player.modelPath || MODEL_BY_NAME[player.name];
            const pos = PODIUM_PIECE_POSITIONS[player.place];
            if (!modelUrl || !pos) continue;

            AssetLoader.loadModelClone(modelUrl, [0.2, 0.2, 0.2])
                .then((modelGroup) => {
                    if (this.isDisposed) return;
                    modelGroup.position.set(pos[0], pos[1], pos[2]);
                    this.scene.add(modelGroup);
                })
                .catch((err) => {
                    console.error(`Ошибка загрузки модели пьедестала для ${player.name}:`, err);
                });
        }
    }

    private updateCamera(delta: number): void {
        const speedFactor = Math.min(delta * 60, 2.5);
        this.orbitAngle += 0.002 * speedFactor;
        const radius = 6;
        const height = 2;
        this.camera.position.set(
            radius * Math.sin(this.orbitAngle),
            height,
            radius * Math.cos(this.orbitAngle)
        );
        this.camera.lookAt(0, 0, 0);
    }

    private handleResize(): void {
        const { width, height } = this.getCanvasDimensions();
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
        this.postProcessing.setSize(width, height);
    }

    private startLoop(): void {
        this.clock.start();
        const animate = () => {
            this.animationFrameId = requestAnimationFrame(animate);
            const delta = this.clock.getDelta();
            this.updateCamera(delta);
            this.postProcessing.render();
        };
        animate();
    }

    public dispose(): void {
        this.isDisposed = true;
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        window.removeEventListener('resize', this.boundOnResize);

        for (const geo of this.disposableGeometries) {
            geo.dispose();
        }
        for (const mat of this.disposableMaterials) {
            mat.dispose();
        }
        this.postProcessing.dispose();
        this.renderer.dispose();
    }
}
