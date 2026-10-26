import * as THREE from 'three';
import { AssetLoader } from './AssetLoader';
import type { PlayerState } from '@/Types/game';

interface PlayerUnitEntry {
    container: THREE.Group;
    targetPosition: THREE.Vector3;
}

export class UnitManager {
    public readonly group = new THREE.Group();

    private readonly units = new Map<number, PlayerUnitEntry>();
    private readonly crownGeometry = new THREE.TorusGeometry(0.2, 0.05, 32, 100);
    private readonly crownMaterial = new THREE.MeshBasicMaterial({
        color: '#ffffff',
        transparent: true,
        opacity: 0.6,
    });
    private readonly crownMesh: THREE.Mesh;
    private readonly targetCrownPosition = new THREE.Vector3(0, 1.06, 0);
    private isDisposed = false;

    constructor(players: PlayerState[], activePlayerIndex: number) {
        this.crownMesh = new THREE.Mesh(this.crownGeometry, this.crownMaterial);
        this.crownMesh.rotation.set(-Math.PI / 2, 0, 0);

        const activePlayer = players[activePlayerIndex];
        if (activePlayer) {
            this.crownMesh.position.set(
                activePlayer.position[0],
                activePlayer.position[1] + 0.6,
                activePlayer.position[2]
            );
            this.targetCrownPosition.copy(this.crownMesh.position);
        }

        this.group.add(this.crownMesh);
        this.initUnits(players);
    }

    private initUnits(players: PlayerState[]): void {
        for (const player of players) {
            const container = new THREE.Group();
            container.position.set(player.position[0], player.position[1], player.position[2]);
            this.group.add(container);

            const targetPosition = new THREE.Vector3(
                player.position[0],
                player.position[1],
                player.position[2]
            );

            this.units.set(player.id, { container, targetPosition });

            AssetLoader.loadModelClone(player.modelPath, [0.2, 0.2, 0.2])
                .then((modelGroup) => {
                    if (this.isDisposed) return;
                    container.add(modelGroup);
                })
                .catch((err) => {
                    console.error(`Не удалось загрузить модель игрока ${player.name}:`, err);
                });
        }
    }

    public syncUnits(players: PlayerState[], activePlayerIndex: number): void {
        for (const player of players) {
            const unit = this.units.get(player.id);
            if (!unit) continue;
            unit.targetPosition.set(player.position[0], player.position[1], player.position[2]);
        }

        const activePlayer = players[activePlayerIndex];
        if (activePlayer) {
            this.targetCrownPosition.set(
                activePlayer.position[0],
                activePlayer.position[1] + 0.6,
                activePlayer.position[2]
            );
        }
    }

    public update(delta: number): void {
        const lerpAlpha = Math.min(1, delta * 12);

        for (const unit of this.units.values()) {
            const distXZ = Math.hypot(
                unit.container.position.x - unit.targetPosition.x,
                unit.container.position.z - unit.targetPosition.z
            );

            unit.container.position.x = THREE.MathUtils.lerp(
                unit.container.position.x,
                unit.targetPosition.x,
                lerpAlpha
            );
            unit.container.position.z = THREE.MathUtils.lerp(
                unit.container.position.z,
                unit.targetPosition.z,
                lerpAlpha
            );

            // Небольшая дуга прыжка по высоте при перемещении фишки между клетками
            const hopOffset = distXZ > 0.02 ? Math.min(0.45, distXZ * 0.25) : 0;
            unit.container.position.y = THREE.MathUtils.lerp(
                unit.container.position.y,
                unit.targetPosition.y + hopOffset,
                lerpAlpha
            );
        }

        this.crownMesh.position.lerp(this.targetCrownPosition, lerpAlpha);
    }

    public dispose(): void {
        this.isDisposed = true;
        this.crownGeometry.dispose();
        this.crownMaterial.dispose();
        this.units.clear();
    }
}
