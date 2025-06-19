<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\MorphyService;

class FilterWords extends Command
{
    protected $signature = 'words:filter';
    protected $description = 'Фильтрует слова, оставляя только нарицательные сущ. ед.ч. именит. падеж';

    public function handle()
    {
        $service = new MorphyService();

        $inputPath = storage_path('app/russian.txt');
        $outputPath = storage_path('app/words.txt');

        $words = file($inputPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        $filtered = [];

        foreach ($words as $word) {
            if ($service->isTargetWord($word)) {
                dump("OK: $word");
                $filtered[] = $word;
            }else{
                dump("SKIP: $word");
            }
        }
        file_put_contents($outputPath, implode("\n", $filtered));
        $this->info('Готово. Сохранено в word.txt');
    }
}
