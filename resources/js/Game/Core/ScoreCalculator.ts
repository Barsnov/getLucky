import type { HexStats, PlayerState, RankedPlayer } from '@/Types/game';

export class ScoreCalculator {
    /**
     * Вычисляет итоговые очки команды с учётом территориального коэффициента:
     * multiplier = normal * 3 + immune * 10
     * calculatedScore = Math.round(baseScore * (1 + multiplier * 0.02))
     */
    public static calculatePlayerScore(baseScore: number, stats?: HexStats): number {
        const normal = stats?.normal ?? 0;
        const immune = stats?.immune ?? 0;
        const multiplier = normal * 3 + immune * 10;
        return Math.round(baseScore * (1 + multiplier * 0.02));
    }

    /**
     * Возвращает отсортированный по убыванию итоговых очков массив игроков с проставленными местами (1..N).
     */
    public static rankPlayers(
        players: PlayerState[],
        statsByPlayer: Record<number, HexStats>
    ): RankedPlayer[] {
        const ranked: RankedPlayer[] = players.map((player) => {
            const stats = statsByPlayer[player.id] ?? { normal: 0, immune: 0, total: 0 };
            const calculatedScore = ScoreCalculator.calculatePlayerScore(player.baseScore, stats);

            return {
                ...player,
                img: player.chipSvg,
                score: player.baseScore,
                calculatedScore,
                place: 1,
                stats,
            };
        });

        ranked.sort((a, b) => b.calculatedScore - a.calculatedScore);

        ranked.forEach((player, idx) => {
            player.place = idx + 1;
        });

        return ranked;
    }
}
