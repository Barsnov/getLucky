<?php

namespace App\Services;

require_once app_path('Libraries/phpMorphy/src/common.php');

use phpMorphy;

class MorphyService
{
    protected $morphy;

    public function __construct()
    {
        $dir = app_path('Libraries/phpMorphy/dicts');
        $locale = 'ru_RU';
        $opts = [
            'storage' => PHPMORPHY_STORAGE_FILE,
            'predict_by_suffix' => true,
            'predict_by_db' => true,
        ];

        $this->morphy = new phpMorphy($dir, $locale, $opts);
    }

    public function isTargetWord(string $word): bool
    {
        if (mb_strlen($word) < 4) {
            return false; // пропускаем слишком короткие слова
        }

        $word = mb_strtoupper($word);
        $grammems = $this->morphy->getGramInfo($word);

        $diminutives = [
            'ЧИК', 'ШК', 'ОК', 'ЁК', 'ИК', 'ОЧКА', 'ЕНЬК', 'ЮШК', 'ЕЧК', 'УШК', 'ЮША', 'ОНЬК'
        ];

        $feminineSuffixes = [
            'ИНКА', 'ЕССА', 'ИСА', 'ИХА', 'ЫНЯ', 'УРКА', 'ЯНКА'
        ];

        if (count($grammems) > 1) {
            // У слова несколько значений — пропускаем
            return false;
        }

        if (!$grammems) {
//            dump("NO GRAMMEMS: $word");
            return false;
        }

//        dump("GRAMMEMS: $word", $grammems);

        $exclude = ['СОБСТВ', 'ФАМ', 'ИМЯ', 'ОРГ', 'ТОП', 'ДФСТ'];

        foreach ($grammems as $forms) {
            foreach ($forms as $form) {
                $formGrammems = $form['grammems'] ?? [];
                if (is_string($formGrammems)) {
                    $formGrammems = explode(',', $formGrammems);
                }
                if (
                    ($form['pos'] ?? null) === 'С' &&
                    in_array('ИМ', $formGrammems) &&
                    in_array('ЕД', $formGrammems) &&
                    in_array('ИМ', $formGrammems) &&
                    empty(array_intersect($exclude, $formGrammems))
                ) {
                    if (preg_match('/ец$/u', $word)) {
                        return false;
                    }
                    foreach (array_merge($diminutives, $feminineSuffixes) as $suffix) {
                        if (mb_substr($word, -mb_strlen($suffix)) === $suffix) {
                            return false;
                        }
                    }
                    if (mb_substr($word, -2) === 'ка' && mb_strlen($word) <= 6) {
                        return false;
                    }

                    $trimmed = mb_strtolower(trim($word));

                    if (!preg_match('/[аеёиоуыэюя]/u', $trimmed)) {
                        return false;
                    }

                    // Дополнительно: можно исключить слова из 2–4 букв без гласных
                    if (preg_match('/^[а-яё]{2,5}$/u', $trimmed) && !preg_match('/[аеёиоуыэюя]/u', $trimmed)) {
                        return false;
                    }
                    return true;
                }
            }
        }
        return false;
    }
}
