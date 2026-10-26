import * as THREE from 'three';
import type { HexCellData, HexStats, Vec3Tuple } from '@/Types/game';

export class HexBoard {
    public static readonly PIECE_HEIGHT_OFFSET = 0.46;
    public static readonly DEFAULT_REACH_DISTANCE = 2;

    /**
     * Генерирует массив данных 37 клеток (3 кольца вокруг центрального гекса)
     * с сохранением точной геометрии исходного поля.
     */
    public static createGrid(circleCount = 3): HexCellData[] {
        const cells: HexCellData[] = [];
        const unit = Math.sqrt(3) * 0.72 * 1.022;
        const angle = Math.PI / 3;
        const axis = new THREE.Vector3(0, 1, 0);
        const axisVector = new THREE.Vector3(0, 0, -unit);
        const sideVector = new THREE.Vector3(0, 0, unit).applyAxisAngle(axis, -angle);
        const vec3 = new THREE.Vector3();

        for (let seg = 0; seg < 6; seg++) {
            for (let ax = 1; ax <= circleCount; ax++) {
                for (let sd = 0; sd < ax; sd++) {
                    vec3.copy(axisVector)
                        .multiplyScalar(ax)
                        .addScaledVector(sideVector, sd)
                        .applyAxisAngle(axis, angle * seg + Math.PI / 6);

                    cells.push({
                        id: `${seg}, ${ax}, ${sd}`,
                        position: [vec3.x, vec3.y, vec3.z],
                        ownerId: null,
                        busyPlayerId: null,
                        isImmune: false,
                    });
                }
            }
        }

        // Центральный шестиугольник
        cells.push({
            id: '0, 0, 0',
            position: [0, 0, 0],
            ownerId: null,
            busyPlayerId: null,
            isImmune: false,
        });

        return cells;
    }

    /**
     * Вычисляет 3D-расстояние между двумя точками.
     */
    public static distanceBetween(a: Vec3Tuple, b: Vec3Tuple): number {
        const dx = a[0] - b[0];
        const dy = a[1] - b[1];
        const dz = a[2] - b[2];
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    /**
     * Возвращает множество ID гексов, находящихся в радиусе хода от позиции фишки.
     */
    public static getReachableHexIds(
        cells: HexCellData[],
        fromPiecePos: Vec3Tuple,
        maxDistance = HexBoard.DEFAULT_REACH_DISTANCE
    ): Set<string> {
        const reachable = new Set<string>();
        for (const cell of cells) {
            const dist = HexBoard.distanceBetween(fromPiecePos, cell.position);
            if (dist > 0 && dist <= maxDistance) {
                reachable.add(cell.id);
            }
        }
        return reachable;
    }

    /**
     * Вычисляет статистику захваченных и укреплённых клеток по каждому игроку.
     */
    public static calculateStatsByPlayer(cells: HexCellData[]): Record<number, HexStats> {
        const stats: Record<number, HexStats> = {};
        for (const cell of cells) {
            if (cell.ownerId === null || cell.ownerId === undefined) continue;
            if (!stats[cell.ownerId]) {
                stats[cell.ownerId] = { normal: 0, immune: 0, total: 0 };
            }
            if (cell.isImmune) {
                stats[cell.ownerId].immune++;
            } else {
                stats[cell.ownerId].normal++;
            }
            stats[cell.ownerId].total++;
        }
        return stats;
    }
}
