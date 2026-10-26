import type { Specialization } from './cards';

export type AdminCategoryKey =
    | 'Specialization'
    | 'Lucky'
    | 'TF'
    | 'Action'
    | 'Decide'
    | 'Found'
    | 'Question'
    | 'Word';

export interface AdminMenuItem {
    id: number;
    value: AdminCategoryKey;
    name: string;
}

export interface AdminEntityItem {
    id: number;
    name?: string;
    method?: number;
    points?: number;
    action?: string;
    question?: string;
    answer?: string | boolean | number;
    explanation?: string | null;
    word?: string;
    words?: string[];
    urlQuestion?: string;
    urlAnswer?: string;
    specializations?: Specialization[];
    [key: string]: any;
}
