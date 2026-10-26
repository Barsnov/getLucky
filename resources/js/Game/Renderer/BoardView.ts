import * as THREE from 'three';
import { HexBoard } from '@/Game/Core/HexBoard';
import type { HexCellData, PlayerState } from '@/Types/game';

interface HexMeshEntry {
    hexMesh: THREE.Mesh<THREE.CylinderGeometry, THREE.MeshStandardMaterial>;
    beamMesh: THREE.Mesh<THREE.CylinderGeometry, THREE.MeshBasicMaterial>;
}

export class BoardView {
    public readonly group = new THREE.Group();

    private readonly sharedHexGeometry = new THREE.CylinderGeometry(0.7, 0.7, 0.1, 6);
    private readonly sharedBeamGeometry = new THREE.CylinderGeometry(0.7, 0.7, 0.2, 6, 1, true);
    private readonly defaultSurfaceColor = new THREE.Color('rgb(56, 56, 56)');

    private readonly entries = new Map<string, HexMeshEntry>();
    private readonly interactiveMeshes: THREE.Mesh[] = [];

    // Вспомогательные объекты для расчётов без аллокаций в цикле
    private readonly tempColor = new THREE.Color();
    private readonly tempHsl = { h: 0, s: 0, l: 0 };

    constructor(cells: HexCellData[]) {
        this.buildBoard(cells);
    }

    private buildBoard(cells: HexCellData[]): void {
        for (const cell of cells) {
            const material = new THREE.MeshStandardMaterial({
                color: this.defaultSurfaceColor.clone(),
                roughness: 0.75,
                metalness: 0.25,
                emissive: this.defaultSurfaceColor.clone(),
                emissiveIntensity: 0.01,
            });

            const hexMesh = new THREE.Mesh(this.sharedHexGeometry, material);
            hexMesh.position.set(cell.position[0], cell.position[1], cell.position[2]);
            hexMesh.receiveShadow = true;
            hexMesh.userData = { hexId: cell.id };

            const beamMaterial = new THREE.MeshBasicMaterial({
                color: new THREE.Color('#ffffff'),
                transparent: true,
                opacity: 0.6,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
            });

            const beamMesh = new THREE.Mesh(this.sharedBeamGeometry, beamMaterial);
            beamMesh.position.set(cell.position[0], cell.position[1] + 0.15, cell.position[2]);
            beamMesh.visible = false;

            this.group.add(hexMesh);
            this.group.add(beamMesh);

            this.entries.set(cell.id, { hexMesh, beamMesh });
            this.interactiveMeshes.push(hexMesh);
        }
    }

    public getInteractiveMeshes(): THREE.Mesh[] {
        return this.interactiveMeshes;
    }

    /**
     * Синхронизирует цвета клеток и лучей иммунитета с текущим состоянием в Pinia.
     */
    public syncCells(
        cells: HexCellData[],
        players: PlayerState[],
        currentPlayerIndex: number,
        reachableHexIds: Set<string>,
        hoveredHexId: string | null,
        isMovePhase: boolean
    ): void {
        const activePlayer = players[currentPlayerIndex];
        const activePlayerColorHex = activePlayer?.color ?? '#ff0000';

        for (const cell of cells) {
            const entry = this.entries.get(cell.id);
            if (!entry) continue;

            const isReachable = isMovePhase && reachableHexIds.has(cell.id);
            const isHovered = isMovePhase && hoveredHexId === cell.id;

            // 1. Базовый цвет поверхности (surfaceColor)
            let surfaceColor = this.defaultSurfaceColor;

            if (cell.ownerId !== null && players[cell.ownerId]) {
                surfaceColor = this.tempColor.set(players[cell.ownerId].color).clone();
            } else if (isReachable && activePlayer) {
                const dist = HexBoard.distanceBetween(activePlayer.position, cell.position);
                const intensity = 1 - dist / 3;
                this.tempColor.set(activePlayerColorHex).getHSL(this.tempHsl);
                const newLightness = Math.min(1, Math.max(0, this.tempHsl.l + intensity * 0.5));
                surfaceColor = new THREE.Color().setHSL(this.tempHsl.h, this.tempHsl.s, newLightness);
            }

            // 2. Цвет при наведении курсора (gameColor)
            let displayColor = surfaceColor;

            if (isHovered && isReachable) {
                if (cell.ownerId === null) {
                    // Свободный доступный гекс подсвечивается цветом активного игрока
                    displayColor = new THREE.Color(activePlayerColorHex);
                } else if (cell.ownerId !== currentPlayerIndex && cell.busyPlayerId === null) {
                    if (cell.isImmune) {
                        // Иммунная вражеская клетка слегка высветляется
                        surfaceColor.getHSL(this.tempHsl);
                        const shieldLightness = Math.min(
                            1,
                            Math.max(0, this.tempHsl.l + (0.5 / 3) * 0.5)
                        );
                        displayColor = new THREE.Color().setHSL(
                            this.tempHsl.h,
                            this.tempHsl.s,
                            shieldLightness
                        );
                    } else {
                        // Атакуемая вражеская клетка подсвечивается цветом атакующего
                        displayColor = new THREE.Color(activePlayerColorHex);
                    }
                }
            }

            entry.hexMesh.material.color.copy(displayColor);
            entry.hexMesh.material.emissive.copy(surfaceColor);

            // 3. Световой луч иммунитета (beamMesh)
            if (cell.isImmune && cell.ownerId !== null && players[cell.ownerId]) {
                entry.beamMesh.visible = true;
                entry.beamMesh.material.color.set(players[cell.ownerId].color);
            } else {
                entry.beamMesh.visible = false;
            }
        }
    }

    public dispose(): void {
        this.sharedHexGeometry.dispose();
        this.sharedBeamGeometry.dispose();
        for (const entry of this.entries.values()) {
            entry.hexMesh.material.dispose();
            entry.beamMesh.material.dispose();
        }
        this.entries.clear();
        this.interactiveMeshes.length = 0;
    }
}
