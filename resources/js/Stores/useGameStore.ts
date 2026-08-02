import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import * as THREE from 'three';

interface Player {
    id: number;
    name: string;
    color: string;
}

interface Hex {
    id: string;
    position: THREE.Vector3;
    ownerId: number | null;
    busy: number | null; // ID игрока, чья фишка сейчас стоит здесь физически
    immune: boolean;
    occupied: boolean;
    surfaceColor: THREE.Color;
    gameColor: THREE.Color | null; // Для временной подсветки
}

export const useGameStore = defineStore('game', () => {
    // --- STATE ---
    const players = ref<Player[]>([]);
    const currentPlayerIndex = ref(0);
    const hexGrid = ref<Hex[]>([]);
    const isMovePhase = ref(false);
    const remainingTime = ref(30 * 60);
    const isHexClickable = ref(true);

    // --- GETTERS ---
    const currentPlayer = computed(() => players.value[currentPlayerIndex.value]);

    const hexStatsByPlayer = computed(() => {
        const stats: Record<number, { normal: number, immune: number, total: number }> = {};
        hexGrid.value.forEach(hex => {
            if (hex.ownerId === null) return;
            if (!stats[hex.ownerId]) {
                stats[hex.ownerId] = { normal: 0, immune: 0, total: 0 };
            }
            if (hex.immune) stats[hex.ownerId].immune++;
            else stats[hex.ownerId].normal++;
            stats[hex.ownerId].total++;
        });
        return stats;
    });

    // --- ACTIONS ---
    function initPlayers(count: number) {
        const names = ['Красные', 'Синие', 'Зелёные', 'Жёлтые', 'Фиолетовые'];
        const colors = ['#ff0000', '#0000ff', '#00ff00', '#ffbb00', '#9100cd'];
        
        players.value = Array.from({ length: count }, (_, i) => ({
            id: i,
            name: names[i],
            color: colors[i],
        }));
    }

    function nextTurn() {
        currentPlayerIndex.value = (currentPlayerIndex.value + 1) % players.value.length;
        isMovePhase.value = true;
        // Сбрасываем временные подсветки на поле
        hexGrid.value.forEach(h => h.gameColor = null);
    }

    function setHexOwner(hexId: string, playerId: number, isImmune = false) {
        const hex = hexGrid.value.find(h => h.id === hexId);
        if (hex) {
            hex.ownerId = playerId;
            hex.occupied = true;
            hex.surfaceColor = new THREE.Color(players.value[playerId].color);
            if (isImmune) hex.immune = true;
        }
    }

    return {
        players,
        currentPlayerIndex,
        currentPlayer,
        hexGrid,
        isMovePhase,
        remainingTime,
        hexStatsByPlayer,
        isHexClickable,
        initPlayers,
        nextTurn,
        setHexOwner
    };
});