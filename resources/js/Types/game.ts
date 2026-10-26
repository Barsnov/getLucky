import type { DuelCard, NormalCard } from './cards';

export type Vec3Tuple = [number, number, number];

export type GamePhase =
    | 'idle'             // Экран ожидания клика «Начать игру»
    | 'roulette'         // Рулетка выбора первого ходящего игрока
    | 'move'             // Фаза хода игрока на 3D-поле
    | 'question'         // Открыта карточка вопроса для захвата нейтрального гекса
    | 'upgrade_question' // Открыта карточка вопроса для укрепления своего гекса
    | 'duel'             // Открыта дуэль за чужой гекс
    | 'game_over';       // Игра окончена, показ экрана загрузки результатов

export type CursorType =
    | 'default'
    | 'point'
    | 'running'
    | 'upgrade'
    | 'shield'
    | 'sword'
    | 'not_allowed';

export interface PlayerConfig {
    id: number; // 0..4
    name: string;
    color: string;
    cardBannerColor: string;
    chipSvg: string;
    cardPng: string;
    modelPath: string;
}

export interface PlayerState extends PlayerConfig {
    baseScore: number;
    position: Vec3Tuple;
    currentHexId: string | null;
}

export interface RankedPlayer extends PlayerState {
    img: string;
    score: number;
    calculatedScore: number;
    place: number;
    stats: HexStats;
}

export interface HexStats {
    normal: number;
    immune: number;
    total: number;
}

export interface HexCellData {
    id: string;
    position: Vec3Tuple;
    ownerId: number | null;
    busyPlayerId: number | null;
    isImmune: boolean;
}

export interface ActiveDuelState {
    attackerId: number;
    defenderId: number;
    targetHexId: string;
    card: DuelCard;
}

export interface ActiveQuestionState {
    targetHexId: string;
    forUpgrade: boolean;
    card: NormalCard;
}
