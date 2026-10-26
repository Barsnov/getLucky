import type { CursorType, PlayerConfig, PlayerState, Vec3Tuple } from '@/Types/game';

export const PLAYER_CONFIGS: readonly PlayerConfig[] = [
    {
        id: 0,
        name: 'Красные',
        color: '#ff0000',
        cardBannerColor: '#ff0000',
        chipSvg: '/images/Red_chip.svg',
        cardPng: '/images/CardRedChip.png',
        modelPath: '/shapes/Red_shape.gltf',
    },
    {
        id: 1,
        name: 'Синие',
        color: '#0000ff',
        cardBannerColor: '#0000ff',
        chipSvg: '/images/Blue_chip.svg',
        cardPng: '/images/CardBlueChip.png',
        modelPath: '/shapes/Blue_shape.gltf',
    },
    {
        id: 2,
        name: 'Зелёные',
        color: '#00ff00',
        cardBannerColor: '#00ff00',
        chipSvg: '/images/Green_chip.svg',
        cardPng: '/images/CardGreenChip.png',
        modelPath: '/shapes/Green_shape.gltf',
    },
    {
        id: 3,
        name: 'Жёлтые',
        color: '#ffbb00',
        cardBannerColor: '#ffff00',
        chipSvg: '/images/Yellow_chip.svg',
        cardPng: '/images/CardYellowChip.png',
        modelPath: '/shapes/Yellow_shape.gltf',
    },
    {
        id: 4,
        name: 'Фиолетовые',
        color: '#9100cd',
        cardBannerColor: '#AA53CF',
        chipSvg: '/images/Purple_chip.svg',
        cardPng: '/images/CardPurpleChip.png',
        modelPath: '/shapes/Purple_shape.gltf',
    },
];

export const INITIAL_POSITIONS_BY_COUNT: Record<number, Vec3Tuple[]> = {
    2: [
        [5, 0.46, 0],
        [-5, 0.46, 0],
    ],
    3: [
        [5, 0.46, 0],
        [-2.52, 0.46, -4.4],
        [-2.52, 0.46, 4.4],
    ],
    4: [
        [5, 0.46, 0],
        [-5, 0.46, 0],
        [0, 0.46, 4.4],
        [0, 0.46, -4.4],
    ],
    5: [
        [2.52, 0.46, -4.4],
        [-2.52, 0.46, -4.4],
        [-2.52, 0.46, 4.4],
        [2.52, 0.46, 4.4],
        [5, 0.46, 0],
    ],
};

export const CURSOR_STYLE_MAP: Record<CursorType, string> = {
    default: "url('/icons/Default.png') 15 15, auto",
    point: "url('/icons/Point.png') 15 15, auto",
    running: "url('/icons/Running.png') 20 20, auto",
    upgrade: "url('/icons/Upgrade.png') 20 20, auto",
    shield: "url('/icons/Shield.png') 10 10, auto",
    sword: "url('/icons/Sword.png') 15 15, auto",
    not_allowed: "url('/icons/NotAllowed.png') 15 15, auto",
};

export class PlayerRegistry {
    public static createPlayers(count: number): PlayerState[] {
        const clampedCount = Math.min(5, Math.max(2, Number(count) || 2));
        const startPositions = INITIAL_POSITIONS_BY_COUNT[clampedCount] ?? INITIAL_POSITIONS_BY_COUNT[2];

        return PLAYER_CONFIGS.slice(0, clampedCount).map((cfg, index) => ({
            ...cfg,
            baseScore: 0,
            position: [...startPositions[index]] as Vec3Tuple,
            currentHexId: null,
        }));
    }
}
