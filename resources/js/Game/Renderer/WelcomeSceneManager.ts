import * as THREE from 'three';
import { PostProcessingManager } from './PostProcessingManager';

interface HexLineEntry {
    material: THREE.LineBasicMaterial;
    remainingHighlightTime: number;
}

export class WelcomeSceneManager {
    private readonly canvas: HTMLCanvasElement;
    private readonly scene: THREE.Scene;
    private readonly camera: THREE.PerspectiveCamera;
    private readonly renderer: THREE.WebGLRenderer;
    private readonly postProcessing: PostProcessingManager;
    private readonly clock = new THREE.Clock();

    private readonly sharedGeometries: THREE.EdgesGeometry[] = [];
    private readonly entries: HexLineEntry[] = [];
    private bgGeometry: THREE.PlaneGeometry | null = null;
    private bgMaterial: THREE.MeshBasicMaterial | null = null;

    private cameraTime = 0;
    private spawnAccumulator = 0;
    private animationFrameId: number | null = null;
    private readonly boundOnResize: () => void;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color('#000000');

        this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
        this.camera.position.set(0, 0, 10);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            powerPreference: 'high-performance',
        });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(width, height);

        this.buildHexWall();
        this.buildBackgroundPlane();

        this.postProcessing = new PostProcessingManager(
            this.renderer,
            this.scene,
            this.camera,
            width,
            height,
            { strength: 0.5, radius: 1, threshold: 0 }
        );

        this.boundOnResize = this.handleResize.bind(this);
        window.addEventListener('resize', this.boundOnResize);

        this.startLoop();
    }

    private buildHexWall(): void {
        // Предсоздаём всего 6 общих геометрий (для сегментов 3..8) вместо 721
        for (let segCount = 3; segCount <= 8; segCount++) {
            const cyl = new THREE.CylinderGeometry(0.5, 0.5, 0.1, segCount);
            const edges = new THREE.EdgesGeometry(cyl);
            cyl.dispose();
            this.sharedGeometries.push(edges);
        }

        const group = new THREE.Group();
        const circleCount = 15;
        const unit = Math.sqrt(3) * 0.6 * 1.022;
        const angle = Math.PI / 3;
        const axis = new THREE.Vector3(0, 0, 1);
        const axisVector = new THREE.Vector3(0, -unit, 0);
        const sideVector = new THREE.Vector3(0, unit, 0).applyAxisAngle(axis, -angle);
        const vec3 = new THREE.Vector3();

        const addPolygonAt = (pos: THREE.Vector3) => {
            const randomGeoIndex = Math.floor(Math.random() * this.sharedGeometries.length);
            const geometry = this.sharedGeometries[randomGeoIndex];
            const material = new THREE.LineBasicMaterial({
                color: new THREE.Color(0, 0, 0),
                toneMapped: false,
            });

            const lineSegments = new THREE.LineSegments(geometry, material);
            lineSegments.position.copy(pos);
            lineSegments.rotation.set(Math.PI / 2, 0, 0);
            group.add(lineSegments);

            this.entries.push({
                material,
                remainingHighlightTime: 0,
            });
        };

        for (let seg = 0; seg < 6; seg++) {
            for (let ax = 1; ax <= circleCount; ax++) {
                for (let sd = 0; sd < ax; sd++) {
                    vec3.copy(axisVector)
                        .multiplyScalar(ax)
                        .addScaledVector(sideVector, sd)
                        .applyAxisAngle(axis, angle * seg + Math.PI / 6);
                    addPolygonAt(vec3);
                }
            }
        }

        addPolygonAt(new THREE.Vector3(0, 0, 0));
        this.scene.add(group);
    }

    private buildBackgroundPlane(): void {
        this.bgGeometry = new THREE.PlaneGeometry(200, 200);
        this.bgMaterial = new THREE.MeshBasicMaterial({ color: '#0e030e' });
        const plane = new THREE.Mesh(this.bgGeometry, this.bgMaterial);
        plane.position.set(0, 0, -50);
        this.scene.add(plane);
    }

    private updateHighlights(delta: number): void {
        // Каждые 100 мс подсвечиваем случайный многоугольник на 5 секунд (без утечек setInterval/setTimeout)
        this.spawnAccumulator += delta;
        while (this.spawnAccumulator >= 0.1) {
            this.spawnAccumulator -= 0.1;
            if (this.entries.length > 0) {
                const idx = Math.floor(Math.random() * this.entries.length);
                const entry = this.entries[idx];
                entry.material.color.setRGB(Math.random(), Math.random(), Math.random());
                entry.remainingHighlightTime = 5.0;
            }
        }

        for (const entry of this.entries) {
            if (entry.remainingHighlightTime > 0) {
                entry.remainingHighlightTime -= delta;
                if (entry.remainingHighlightTime <= 0) {
                    entry.remainingHighlightTime = 0;
                    entry.material.color.setRGB(0, 0, 0);
                }
            }
        }
    }

    private updateCamera(delta: number): void {
        const speedFactor = Math.min(delta * 60, 2.5);
        this.cameraTime += 0.01 * speedFactor;
        const radius = 1;
        this.camera.position.x = radius * Math.sin(this.cameraTime);
        this.camera.position.y = radius * Math.cos(this.cameraTime);
        this.camera.position.z = 10 + Math.sin(this.cameraTime * 0.5) * 2;
        this.camera.lookAt(0, 0, 0);
    }

    private handleResize(): void {
        const width = window.innerWidth;
        const height = window.innerHeight;
        if (width === 0 || height === 0) return;

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
            this.updateHighlights(delta);
            this.postProcessing.render();
        };
        animate();
    }

    public dispose(): void {
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        window.removeEventListener('resize', this.boundOnResize);

        for (const geo of this.sharedGeometries) {
            geo.dispose();
        }
        for (const entry of this.entries) {
            entry.material.dispose();
        }
        this.bgGeometry?.dispose();
        this.bgMaterial?.dispose();
        this.postProcessing.dispose();
        this.renderer.dispose();
    }
}
