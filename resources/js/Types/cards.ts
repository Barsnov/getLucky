export interface Specialization {
    id: number;
    name: string;
    method: number; // 0 = Из базы, 1 = Генеративный
    created_at?: string;
    updated_at?: string;
}

export type NormalCardCategory = 'lucky' | 'action' | 'cardQuestion' | 'tf' | 'decide';
export type DuelCardCategory = 'word' | 'cardFound';
export type CardCategory = NormalCardCategory | DuelCardCategory;

export interface BaseCard {
    id: number;
    points: number;
    category?: CardCategory;
    specializations?: Specialization[];
}

export interface CardLucky extends BaseCard {
    category?: 'lucky';
}

export interface CardAction extends BaseCard {
    category?: 'action';
    action: string;
}

export interface CardQuestion extends BaseCard {
    category?: 'cardQuestion';
    question: string;
    answer: string;
    explanation?: string | null;
}

export interface CardTF extends BaseCard {
    category?: 'tf';
    question: string;
    answer: boolean | number;
    explanation?: string | null;
}

export interface CardDecide extends BaseCard {
    category?: 'decide';
    question: string;
    answer: string;
    explanation?: string | null;
}

export interface CardWord {
    id: number;
    word: string;
    words: string[];
    explanation?: string | null;
    points?: number;
    category?: 'word';
    specializations?: Specialization[];
}

export interface CardFound {
    id: number;
    urlQuestion: string;
    urlAnswer: string;
    points?: number;
    category?: 'cardFound';
    specializations?: Specialization[];
}

export type NormalCard = (CardLucky | CardAction | CardQuestion | CardTF | CardDecide) & {
    category: NormalCardCategory;
};

export type DuelCard = (CardWord | CardFound) & {
    category: DuelCardCategory;
};

export type AnyGameCard = NormalCard | DuelCard;

export interface RawQuestionsPayload {
    lucky?: CardLucky[];
    action?: CardAction[];
    questions?: CardQuestion[];
    cardQuestion?: CardQuestion[];
    tf?: CardTF[];
    decide?: CardDecide[];
    word?: CardWord[];
    found?: CardFound[];
    cardFound?: CardFound[];
}
