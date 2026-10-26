import type {
    CardAction,
    CardDecide,
    CardFound,
    CardLucky,
    CardQuestion,
    CardTF,
    CardWord,
    DuelCard,
    DuelCardCategory,
    NormalCard,
    NormalCardCategory,
    RawQuestionsPayload,
} from '@/Types/cards';

const NORMAL_CATEGORY_WEIGHTS: Record<NormalCardCategory, number> = {
    lucky: 0.05,
    action: 0.2375,
    cardQuestion: 0.2375,
    tf: 0.2375,
    decide: 0.2375,
};

const NORMAL_CATEGORIES: NormalCardCategory[] = ['decide', 'tf', 'cardQuestion', 'action', 'lucky'];
const DUEL_CATEGORIES: DuelCardCategory[] = ['word', 'cardFound'];

export class QuestionDeck {
    private pools: {
        lucky: CardLucky[];
        action: CardAction[];
        cardQuestion: CardQuestion[];
        tf: CardTF[];
        decide: CardDecide[];
        word: CardWord[];
        cardFound: CardFound[];
    } = {
        lucky: [],
        action: [],
        cardQuestion: [],
        tf: [],
        decide: [],
        word: [],
        cardFound: [],
    };

    constructor(payload?: RawQuestionsPayload) {
        if (payload) {
            this.load(payload);
        }
    }

    public load(payload: RawQuestionsPayload = {}): void {
        // Клонируем массивы, чтобы не мутировать входные пропсы Inertia
        this.pools.lucky = [...(payload.lucky ?? [])];
        this.pools.action = [...(payload.action ?? [])];
        this.pools.cardQuestion = [...(payload.questions ?? payload.cardQuestion ?? [])];
        this.pools.tf = [...(payload.tf ?? [])];
        this.pools.decide = [...(payload.decide ?? [])];
        this.pools.word = [...(payload.word ?? [])];
        this.pools.cardFound = [...(payload.found ?? payload.cardFound ?? [])];
    }

    /**
     * Выбирает случайную обычную карточку с учётом весов категорий и удаляет её из пула.
     */
    public drawNormalCard(): NormalCard | null {
        const availableCategories = NORMAL_CATEGORIES.filter(
            (cat) => this.pools[cat] && this.pools[cat].length > 0
        );

        if (availableCategories.length === 0) {
            console.warn('Все категории обычных карточек пусты.');
            return null;
        }

        const weights = availableCategories.map((cat) => NORMAL_CATEGORY_WEIGHTS[cat] ?? 0);
        const totalWeight = weights.reduce((acc, w) => acc + w, 0);
        let rand = Math.random() * totalWeight;

        let selectedCategory: NormalCardCategory = availableCategories[0];
        for (let i = 0; i < availableCategories.length; i++) {
            rand -= weights[i];
            if (rand <= 0) {
                selectedCategory = availableCategories[i];
                break;
            }
        }

        const pool = this.pools[selectedCategory];
        if (!pool || pool.length === 0) return null;

        const randomIndex = Math.floor(Math.random() * pool.length);
        const [rawCard] = pool.splice(randomIndex, 1);

        return {
            ...rawCard,
            category: selectedCategory,
        } as NormalCard;
    }

    /**
     * Выбирает случайную карточку дуэли ('word' или 'cardFound') и удаляет её из пула.
     */
    public drawDuelCard(): DuelCard | null {
        const availableCategories = DUEL_CATEGORIES.filter(
            (cat) => this.pools[cat] && this.pools[cat].length > 0
        );

        if (availableCategories.length === 0) {
            console.warn('Все категории дуэльных карточек пусты.');
            return null;
        }

        const selectedCategory =
            availableCategories[Math.floor(Math.random() * availableCategories.length)];
        const pool = this.pools[selectedCategory];
        if (!pool || pool.length === 0) return null;

        const randomIndex = Math.floor(Math.random() * pool.length);
        const [rawCard] = pool.splice(randomIndex, 1);

        return {
            ...rawCard,
            category: selectedCategory,
        } as DuelCard;
    }
}
