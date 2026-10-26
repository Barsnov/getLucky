import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { router } from '@inertiajs/vue3';
import { useAudioStore } from './useAudioStore';
import { HexBoard } from '@/Game/Core/HexBoard';
import { CURSOR_STYLE_MAP, PlayerRegistry } from '@/Game/Core/PlayerRegistry';
import { QuestionDeck } from '@/Game/Core/QuestionDeck';
import { ScoreCalculator } from '@/Game/Core/ScoreCalculator';
import type { RawQuestionsPayload } from '@/Types/cards';
import type {
    ActiveDuelState,
    ActiveQuestionState,
    CursorType,
    GamePhase,
    HexCellData,
    PlayerState,
    Vec3Tuple,
} from '@/Types/game';

export const useGameStore = defineStore('game', () => {
    const audio = useAudioStore();
    const deck = new QuestionDeck();

    // --- STATE ---
    const phase = ref<GamePhase>('idle');
    const players = ref<PlayerState[]>([]);
    const currentPlayerIndex = ref<number>(0);
    const cells = ref<HexCellData[]>([]);

    const hoveredHexId = ref<string | null>(null);
    const activeTurnHexId = ref<string | null>(null);
    const activeQuestion = ref<ActiveQuestionState | null>(null);
    const activeDuel = ref<ActiveDuelState | null>(null);

    const cursorType = ref<CursorType>('default');
    const isHexClickable = ref<boolean>(true);

    // Рулетка выбора первого игрока
    const rouletteHighlightedIndex = ref<number>(0);
    const rouletteFinalIndex = ref<number | null>(null);
    const rouletteWinnerLocked = ref<boolean>(false);

    // Таймер игры (30 минут)
    const remainingTime = ref<number>(30 * 60);
    const isTimerBlinking = ref<boolean>(false);

    let rouletteIntervalId: ReturnType<typeof setInterval> | null = null;
    let gameTimerIntervalId: ReturnType<typeof setInterval> | null = null;
    let transitionTimeoutId: ReturnType<typeof setTimeout> | null = null;

    // --- GETTERS ---
    const currentPlayer = computed<PlayerState | null>(
        () => players.value[currentPlayerIndex.value] ?? null
    );

    const cellMap = computed<Map<string, HexCellData>>(() => {
        const map = new Map<string, HexCellData>();
        for (const cell of cells.value) {
            map.set(cell.id, cell);
        }
        return map;
    });

    const reachableHexIds = computed<Set<string>>(() => {
        const player = currentPlayer.value;
        if (!player || phase.value !== 'move') {
            return new Set<string>();
        }
        return HexBoard.getReachableHexIds(cells.value, player.position);
    });

    const hexStatsByPlayer = computed(() => HexBoard.calculateStatsByPlayer(cells.value));

    const rankedPlayers = computed(() =>
        ScoreCalculator.rankPlayers(players.value, hexStatsByPlayer.value)
    );

    const cursorStyle = computed<string>(() => CURSOR_STYLE_MAP[cursorType.value]);

    const formattedTime = computed<string>(() => {
        const minutes = String(Math.floor(remainingTime.value / 60)).padStart(2, '0');
        const seconds = String(remainingTime.value % 60).padStart(2, '0');
        return `${minutes}:${seconds}`;
    });

    const activeAttacker = computed<PlayerState | null>(() =>
        activeDuel.value ? (players.value[activeDuel.value.attackerId] ?? null) : null
    );

    const activeDefender = computed<PlayerState | null>(() =>
        activeDuel.value ? (players.value[activeDuel.value.defenderId] ?? null) : null
    );

    // --- INTERNAL HELPERS ---
    function clearAllTimers(): void {
        if (rouletteIntervalId) {
            clearInterval(rouletteIntervalId);
            rouletteIntervalId = null;
        }
        if (gameTimerIntervalId) {
            clearInterval(gameTimerIntervalId);
            gameTimerIntervalId = null;
        }
        if (transitionTimeoutId) {
            clearTimeout(transitionTimeoutId);
            transitionTimeoutId = null;
        }
    }

    function movePlayerPieceToCell(playerId: number, targetCell: HexCellData): void {
        const player = players.value[playerId];
        if (!player) return;

        // Освобождаем предыдущую клетку
        for (const cell of cells.value) {
            if (cell.busyPlayerId === playerId) {
                cell.busyPlayerId = null;
            }
        }

        targetCell.busyPlayerId = playerId;
        player.currentHexId = targetCell.id;
        player.position = [
            targetCell.position[0],
            targetCell.position[1] + HexBoard.PIECE_HEIGHT_OFFSET,
            targetCell.position[2],
        ] as Vec3Tuple;
    }

    function addScore(playerId: number, points: number): void {
        const player = players.value[playerId];
        if (player) {
            player.baseScore += Number(points) || 0;
        }
    }

    // --- ACTIONS ---
    function initGame(playersCount: number, rawQuestions: RawQuestionsPayload): void {
        clearAllTimers();
        players.value = PlayerRegistry.createPlayers(playersCount);
        cells.value = HexBoard.createGrid(3);
        deck.load(rawQuestions);

        currentPlayerIndex.value = 0;
        hoveredHexId.value = null;
        activeTurnHexId.value = null;
        activeQuestion.value = null;
        activeDuel.value = null;
        cursorType.value = 'point';
        isHexClickable.value = true;

        rouletteHighlightedIndex.value = 0;
        rouletteFinalIndex.value = null;
        rouletteWinnerLocked.value = false;

        remainingTime.value = 30 * 60;
        isTimerBlinking.value = false;
        phase.value = 'idle';
    }

    function startRoulette(): void {
        if (phase.value !== 'idle') return;

        phase.value = 'roulette';
        cursorType.value = 'default';
        rouletteWinnerLocked.value = false;
        rouletteFinalIndex.value = null;

        const count = players.value.length;
        let step = 0;

        transitionTimeoutId = setTimeout(() => {
            rouletteIntervalId = setInterval(() => {
                rouletteHighlightedIndex.value = step % count;
                currentPlayerIndex.value = rouletteHighlightedIndex.value;
                step++;

                if (step > 20) {
                    if (rouletteIntervalId) {
                        clearInterval(rouletteIntervalId);
                        rouletteIntervalId = null;
                    }
                    const winnerIdx = Math.floor(Math.random() * count);
                    rouletteFinalIndex.value = winnerIdx;
                    rouletteHighlightedIndex.value = winnerIdx;
                    currentPlayerIndex.value = winnerIdx;
                    rouletteWinnerLocked.value = true;

                    transitionTimeoutId = setTimeout(() => {
                        startMainPhase();
                    }, 1000);
                }
            }, 200);
        }, 600);
    }

    function startMainPhase(): void {
        phase.value = 'move';
        isHexClickable.value = true;
        cursorType.value = 'default';
        audio.playSfx('whoosh');
        audio.playBgm();
        startGameTimer();
    }

    function startGameTimer(): void {
        if (gameTimerIntervalId) clearInterval(gameTimerIntervalId);
        const targetTimestamp = Date.now() + remainingTime.value * 1000;

        gameTimerIntervalId = setInterval(() => {
            const diff = Math.max(Math.floor((targetTimestamp - Date.now()) / 1000), 0);
            remainingTime.value = diff;

            if (diff <= 0 && phase.value !== 'game_over') {
                if (gameTimerIntervalId) {
                    clearInterval(gameTimerIntervalId);
                    gameTimerIntervalId = null;
                }
                isTimerBlinking.value = true;
                setTimeout(() => {
                    isTimerBlinking.value = false;
                    finishGame();
                }, 3000);
            }
        }, 1000);
    }

    /**
     * Вызывается из 3D-сцены (InteractionManager -> Raycaster) при наведении/уходе луча с гекса.
     */
    function hoverHex(hexId: string | null): void {
        if (phase.value !== 'move' || !isHexClickable.value) {
            hoveredHexId.value = null;
            cursorType.value = 'default';
            return;
        }

        if (hoveredHexId.value === hexId) return;
        hoveredHexId.value = hexId;

        if (!hexId) {
            cursorType.value = 'default';
            return;
        }

        const cell = cellMap.value.get(hexId);
        if (!cell) {
            cursorType.value = 'default';
            return;
        }

        const isReachable = reachableHexIds.value.has(cell.id);
        const isOwnedByCurrent = cell.ownerId === currentPlayerIndex.value;
        const isOccupied = cell.ownerId !== null;

        if (isReachable) {
            if (!isOccupied) {
                cursorType.value = 'point';
                audio.playSfx('pointer');
            } else if (isOwnedByCurrent) {
                if (cell.busyPlayerId === null) {
                    cursorType.value = 'running';
                    audio.playSfx('hexAction');
                } else if (cell.isImmune) {
                    cursorType.value = 'not_allowed';
                } else {
                    cursorType.value = 'upgrade';
                    audio.playSfx('upgrade');
                }
            } else {
                // Чужая клетка в радиусе хода
                if (cell.busyPlayerId === null) {
                    if (cell.isImmune) {
                        cursorType.value = 'shield';
                        audio.playSfx('shield');
                    } else {
                        cursorType.value = 'sword';
                        audio.playSfx('attack');
                    }
                } else {
                    cursorType.value = 'not_allowed';
                    audio.playSfx('wrong');
                }
            }
        } else {
            // За пределами радиуса 2: можно свободно перемещаться по своим клеткам
            if (isOwnedByCurrent && cell.busyPlayerId === null) {
                cursorType.value = 'running';
                audio.playSfx('hexAction');
            } else {
                cursorType.value = 'not_allowed';
            }
        }
    }

    /**
     * Вызывается из 3D-сцены (InteractionManager -> Raycaster) при одиночном клике по гексу.
     */
    function selectHex(hexId: string): void {
        if (phase.value !== 'move' || !isHexClickable.value) return;

        const cell = cellMap.value.get(hexId);
        if (!cell) return;

        const isReachable = reachableHexIds.value.has(cell.id);
        const isOwnedByCurrent = cell.ownerId === currentPlayerIndex.value;

        if (!isReachable && !isOwnedByCurrent) return;

        // 1. Клетка уже кем-то захвачена
        if (cell.ownerId !== null) {
            if (isOwnedByCurrent) {
                // Свободное перемещение по своим клеткам без траты хода
                if (cell.busyPlayerId === null) {
                    movePlayerPieceToCell(currentPlayerIndex.value, cell);
                    audio.playSfx('whip');
                    hoveredHexId.value = null;
                    hoverHex(cell.id);
                }
                return;
            }

            // Атака чужой клетки (дуэль)
            if (!isReachable || cell.busyPlayerId !== null || cell.isImmune) return;

            const defenderId = cell.ownerId;
            const duelCard = deck.drawDuelCard();
            if (!duelCard) {
                // Если дуэльные карточки закончились, передаём клетку атакующему
                cell.ownerId = currentPlayerIndex.value;
                cell.isImmune = true;
                nextTurn();
                return;
            }

            isHexClickable.value = false;
            activeTurnHexId.value = cell.id;
            cursorType.value = 'default';

            transitionTimeoutId = setTimeout(() => {
                activeDuel.value = {
                    attackerId: currentPlayerIndex.value,
                    defenderId,
                    targetHexId: cell.id,
                    card: duelCard,
                };
                phase.value = 'duel';
            }, 400);
            return;
        }

        // 2. Обычный захват нейтральной клетки
        const questionCard = deck.drawNormalCard();
        if (!questionCard) {
            // Если вопросы закончились, захватываем клетку сразу
            cell.ownerId = currentPlayerIndex.value;
            movePlayerPieceToCell(currentPlayerIndex.value, cell);
            audio.playSfx('whip');
            nextTurn();
            return;
        }

        isHexClickable.value = false;
        activeTurnHexId.value = cell.id;
        cursorType.value = 'default';

        transitionTimeoutId = setTimeout(() => {
            activeQuestion.value = {
                targetHexId: cell.id,
                forUpgrade: false,
                card: questionCard,
            };
            phase.value = 'question';
        }, 400);
    }

    /**
     * Вызывается из 3D-сцены (InteractionManager -> Raycaster) при двойном клике по гексу для его укрепления.
     */
    function tryUpgradeHex(hexId: string): void {
        if (phase.value !== 'move' || !isHexClickable.value) return;

        const cell = cellMap.value.get(hexId);
        if (!cell) return;

        const canUpgrade =
            cell.ownerId === currentPlayerIndex.value &&
            cell.busyPlayerId === currentPlayerIndex.value &&
            !cell.isImmune;

        if (!canUpgrade) return;

        const questionCard = deck.drawNormalCard();
        if (!questionCard) {
            cell.isImmune = true;
            nextTurn();
            return;
        }

        isHexClickable.value = false;
        activeTurnHexId.value = cell.id;
        cursorType.value = 'default';

        transitionTimeoutId = setTimeout(() => {
            activeQuestion.value = {
                targetHexId: cell.id,
                forUpgrade: true,
                card: questionCard,
            };
            phase.value = 'upgrade_question';
        }, 400);
    }

    /**
     * Вызывается из Vue HUD (Questions.vue) после ответа команды на карточку вопроса.
     */
    function resolveQuestion(isCorrect: boolean, points = 0): void {
        const questionState = activeQuestion.value;
        if (!questionState) return;

        const cell = cellMap.value.get(questionState.targetHexId);
        const awardedPoints = isCorrect ? Number(points) || 0 : 5;
        addScore(currentPlayerIndex.value, awardedPoints);

        activeQuestion.value = null;

        if (questionState.forUpgrade) {
            if (isCorrect && cell) {
                cell.isImmune = true;
            }
            transitionTimeoutId = setTimeout(() => {
                nextTurn();
            }, 400);
            return;
        }

        // Обычный захват клетки
        if (cell) {
            cell.ownerId = currentPlayerIndex.value;
            movePlayerPieceToCell(currentPlayerIndex.value, cell);
            audio.playSfx('whip');
        }

        transitionTimeoutId = setTimeout(() => {
            nextTurn();
        }, 400);
    }

    /**
     * Вызывается из Vue HUD (Fight.vue) после завершения дуэли.
     * @param winnerPlayerId ID победившего игрока (0..N-1) или null в случае ничьей
     */
    function resolveDuel(winnerPlayerId: number | null): void {
        const duelState = activeDuel.value;
        if (!duelState) return;

        const cell = cellMap.value.get(duelState.targetHexId);
        activeDuel.value = null;

        if (winnerPlayerId !== null && players.value[winnerPlayerId]) {
            addScore(winnerPlayerId, 30);
            if (cell) {
                cell.ownerId = winnerPlayerId;
                cell.isImmune = true;
            }
        }

        transitionTimeoutId = setTimeout(() => {
            nextTurn();
        }, 400);
    }

    function nextTurn(): void {
        if (players.value.length === 0) return;
        currentPlayerIndex.value = (currentPlayerIndex.value + 1) % players.value.length;
        hoveredHexId.value = null;
        activeTurnHexId.value = null;
        isHexClickable.value = true;
        cursorType.value = 'default';
        phase.value = 'move';
    }

    function finishGame(): void {
        clearAllTimers();
        phase.value = 'game_over';
        cursorType.value = 'default';
        audio.stopBgm();

        setTimeout(() => {
            router.post('/game/end', {
                players: rankedPlayers.value as any,
            });
        }, 3000);
    }

    function disposeGame(): void {
        clearAllTimers();
        audio.stopBgm();
    }

    return {
        // State
        phase,
        players,
        currentPlayerIndex,
        cells,
        hoveredHexId,
        activeTurnHexId,
        activeQuestion,
        activeDuel,
        cursorType,
        isHexClickable,
        rouletteHighlightedIndex,
        rouletteFinalIndex,
        rouletteWinnerLocked,
        remainingTime,
        isTimerBlinking,

        // Getters
        currentPlayer,
        cellMap,
        reachableHexIds,
        hexStatsByPlayer,
        rankedPlayers,
        cursorStyle,
        formattedTime,
        activeAttacker,
        activeDefender,

        // Actions
        initGame,
        startRoulette,
        startMainPhase,
        hoverHex,
        selectHex,
        tryUpgradeHex,
        resolveQuestion,
        resolveDuel,
        nextTurn,
        finishGame,
        disposeGame,
    };
});
