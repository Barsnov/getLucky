import * as THREE from 'three';
import type { GamePhase, Vec3Tuple } from '@/Types/game';

export class CameraController {
    public readonly camera: THREE.PerspectiveCamera;

    private orbitAngle = 0;
    private isIdleOrbit = true;
    private isFinalCircle = false;
    private isFocusingOnTarget = false;
    private readonly targetCameraPos = new THREE.Vector3(0, 10, 15);
    private readonly lookAtCenter = new THREE.Vector3(0, 0, 0);

    constructor(aspect: number) {
        this.camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 1000);
        this.camera.position.set(0, 10, 15);
        this.camera.lookAt(this.lookAtCenter);
    }

    public setAspect(aspect: number): void {
        this.camera.aspect = aspect;
        this.camera.updateProjectionMatrix();
    }

    /**
     * Обновляет целевую точку камеры при смене фазы игры или активного игрока.
     */
    public syncWithState(phase: GamePhase, activePiecePos: Vec3Tuple | null): void {
        const isStarted = phase !== 'idle' && phase !== 'roulette';

        if (isStarted && this.isIdleOrbit) {
            this.isIdleOrbit = false;
            this.isFinalCircle = false;
            this.isFocusingOnTarget = true;
            this.orbitAngle = 2 * Math.PI;
        }

        if (activePiecePos) {
            this.computeQuadrantCameraTarget(activePiecePos);
            if (isStarted) {
                this.isFocusingOnTarget = true;
            }
        }
    }

    private computeQuadrantCameraTarget(pos: Vec3Tuple): void {
        const [px, py, pz] = pos;
        this.targetCameraPos.set(px, py, pz);

        if (px > 0) {
            if (pz > 0) {
                this.targetCameraPos.x = 6;
                this.targetCameraPos.z = 7.7;
            } else if (pz < 0) {
                this.targetCameraPos.x = 6;
                this.targetCameraPos.z = -7.7;
            } else {
                this.targetCameraPos.x = 10;
            }
        } else if (px < 0) {
            if (pz > 0) {
                this.targetCameraPos.x = -6;
                this.targetCameraPos.z = 7.7;
            } else if (pz < 0) {
                this.targetCameraPos.x = -6;
                this.targetCameraPos.z = -7.7;
            } else {
                this.targetCameraPos.x = -10;
            }
        } else {
            if (pz > 0) {
                this.targetCameraPos.z = 10;
            } else if (pz < 0) {
                this.targetCameraPos.z = -10;
            } else {
                this.targetCameraPos.z = 10;
            }
        }

        this.targetCameraPos.y = py + 6;
    }

    public update(delta: number): void {
        const speedFactor = Math.min(delta * 60, 2.5);

        if (this.isIdleOrbit && !this.isFinalCircle) {
            this.orbitAngle += 0.001 * speedFactor;
            const radius = 15;
            this.camera.position.x = radius * Math.sin(this.orbitAngle);
            this.camera.position.z = radius * Math.cos(this.orbitAngle);
            this.camera.position.y = 10 + Math.sin(this.orbitAngle * 0.5) * 3;
            this.camera.lookAt(this.lookAtCenter);
            return;
        }

        if (this.isFocusingOnTarget) {
            const lerpAlpha = Math.min(1, 0.05 * speedFactor);
            this.camera.position.lerp(this.targetCameraPos, lerpAlpha);
            this.camera.lookAt(this.lookAtCenter);

            if (this.camera.position.distanceTo(this.targetCameraPos) < 0.05) {
                this.isFocusingOnTarget = false;
            }
        }
    }
}
