import * as THREE from 'three';
import { BoardView } from './BoardView';
import { CameraController } from './CameraController';
import { InteractionManager } from './InteractionManager';
import { PostProcessingManager } from './PostProcessingManager';
import { UnitManager } from './UnitManager';
import type { useGameStore } from '@/Stores/useGameStore';

type GameStoreInstance = ReturnType<typeof useGameStore>;

export class SceneManager {
    private readonly canvas: HTMLCanvasElement;
    private readonly store: GameStoreInstance;
    private readonly scene: THREE.Scene;
    private readonly renderer: THREE.WebGLRenderer;
    private readonly clock = new THREE.Clock();

    private readonly cameraController: CameraController;
    private readonly boardView: BoardView;
    private readonly unitManager: UnitManager;
    private readonly interactionManager: InteractionManager;
    private readonly postProcessing: PostProcessingManager;

    private animationFrameId: number | null = null;
    private unsubscribeStore: (() => void) | null = null;
    private readonly boundOnResize: () => void;

    constructor(canvas: HTMLCanvasElement, store: GameStoreInstance) {
        this.canvas = canvas;
        this.store = store;

        const width = window.innerWidth;
        const height = window.innerHeight;

        // 1. Scene & Renderer
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color('rgb(60, 42, 46)');

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            powerPreference: 'high-performance',
        });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(width, height);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // 2. Освещение
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
        directionalLight.position.set(0, 100, 0);
        directionalLight.lookAt(0, 0, 0);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);

        // 3. Камера
        this.cameraController = new CameraController(width / height);

        // 4. Поле и фишки
        this.boardView = new BoardView(this.store.cells);
        this.scene.add(this.boardView.group);

        this.unitManager = new UnitManager(this.store.players, this.store.currentPlayerIndex);
        this.scene.add(this.unitManager.group);

        // 5. Пост-процессинг (Bloom)
        this.postProcessing = new PostProcessingManager(
            this.renderer,
            this.scene,
            this.cameraController.camera,
            width,
            height,
            { strength: 0.2, radius: 0.01, threshold: 0 }
        );

        // 6. Raycaster (3D -> Pinia Actions)
        this.interactionManager = new InteractionManager(
            this.canvas,
            this.cameraController.camera,
            this.boardView.getInteractiveMeshes(),
            {
                onHover: (hexId) => this.store.hoverHex(hexId),
                onClick: (hexId) => this.store.selectHex(hexId),
                onDoubleClick: (hexId) => this.store.tryUpgradeHex(hexId),
            }
        );

        // 7. Первичная синхронизация и подписка на Pinia (Pinia -> 3D)
        this.syncFromStore();
        this.unsubscribeStore = this.store.$subscribe(() => {
            this.syncFromStore();
        });

        // 8. Обработка ресайза окна
        this.boundOnResize = this.handleResize.bind(this);
        window.addEventListener('resize', this.boundOnResize);

        // 9. Запуск рендер-цикла
        this.startLoop();
    }

    private syncFromStore(): void {
        const isMovePhase = this.store.phase === 'move';

        this.boardView.syncCells(
            this.store.cells,
            this.store.players,
            this.store.currentPlayerIndex,
            this.store.reachableHexIds,
            this.store.hoveredHexId,
            isMovePhase
        );

        this.unitManager.syncUnits(this.store.players, this.store.currentPlayerIndex);

        this.cameraController.syncWithState(
            this.store.phase,
            this.store.currentPlayer?.position ?? null
        );
    }

    private handleResize(): void {
        const width = window.innerWidth;
        const height = window.innerHeight;
        if (width === 0 || height === 0) return;

        this.cameraController.setAspect(width / height);
        this.renderer.setSize(width, height);
        this.postProcessing.setSize(width, height);
    }

    private startLoop(): void {
        this.clock.start();
        const animate = () => {
            this.animationFrameId = requestAnimationFrame(animate);
            const delta = this.clock.getDelta();

            this.cameraController.update(delta);
            this.unitManager.update(delta);
            this.postProcessing.render();
        };
        animate();
    }

    public dispose(): void {
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        if (this.unsubscribeStore) {
            this.unsubscribeStore();
            this.unsubscribeStore = null;
        }
        window.removeEventListener('resize', this.boundOnResize);

        this.interactionManager.dispose();
        this.boardView.dispose();
        this.unitManager.dispose();
        this.postProcessing.dispose();
        this.renderer.dispose();
    }
}
