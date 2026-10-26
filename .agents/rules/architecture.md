# Архитектура проекта и правила работы со стеком

## 1. Обзор стека
- **Backend:** Laravel 12 (PHP 8.2+, SQLite локально / MariaDB в Docker Sail, библиотека морфологии `phpMorphy`).
- **Frontend-ядро:** Vue 3 (`<script setup lang="ts">`), Inertia.js (`@inertiajs/vue3`), Pinia (`pinia`), TypeScript (`tsconfig.json`).
- **3D и графика:** Чистый Three.js (`three` + постпроцессинг `EffectComposer`/`UnrealBloomPass` + `GLTFLoader`) через изолированные ООП-классы в `resources/js/Game/Renderer/`.
- **Звук и UI:** Howler.js (`howler` через `useAudioStore`), Swiper (`swiper`), Tailwind CSS + `@tailwindcss/typography`, Markdown (`markdown-it` + `markdown-it-mark` через composable `useMarkdown`).

---

## 2. Слоистая архитектура фронтенда (`resources/js/`)

Проект разделён на 4 изолированных слоя:

### 2.1. Типы (`resources/js/Types/`)
- `cards.ts` — интерфейсы всех 7 типов карточек (`CardLucky`, `CardAction`, `CardQuestion`, `CardTF`, `CardDecide`, `CardWord`, `CardFound`), категорий и входного пула вопросов (`RawQuestionsPayload`).
- `game.ts` — типы конечного автомата фаз игры (`GamePhase`), курсоров (`CursorType`), игроков (`PlayerConfig`, `PlayerState`, `RankedPlayer`), клеток поля (`HexCellData`, `HexStats`) и активной дуэли/вопроса.
- `admin.ts` — типы сущностей и разделов админ-панели.

### 2.2. Доменное ядро (`resources/js/Game/Core/`) — Чистый TypeScript без привязки к Vue и Three.js-мешам
- `PlayerRegistry.ts` — единый реестр конфигураций команд (`PLAYER_CONFIGS`, стартовые 3D-координаты `INITIAL_POSITIONS_BY_COUNT`, карта CSS-курсоров `CURSOR_STYLE_MAP`).
- `HexBoard.ts` — математическая генерация гексагональной сетки из 3 колец (37 клеток), расчёт 3D-дистанций, поиск доступных для хода гексов (`getReachableHexIds`) и подсчёт территориальной статистики (`calculateStatsByPlayer`).
- `QuestionDeck.ts` — класс управления пулом карточек: взвешенный рандом обычных карточек (`drawNormalCard`) и случайный выбор дуэлей (`drawDuelCard`).
- `ScoreCalculator.ts` — чистый расчёт очков с учётом территориального коэффициента (`multiplier = normal * 3 + immune * 10`, `Math.round(baseScore * (1 + multiplier * 0.02))`) и ранжирование мест (`rankPlayers`).

### 2.3. Сторы Pinia (`resources/js/Stores/`) — Единый источник правды (Single Source of Truth)
- `useGameStore.ts` — централизованный стор состояния игры:
  - Управляет конечным автоматом фаз (`phase`: `'idle' | 'roulette' | 'move' | 'question' | 'upgrade_question' | 'duel' | 'game_over'`).
  - Хранит сериализуемое состояние игроков (`players`), клеток поля (`cells`), активного вопроса (`activeQuestion`), активной дуэли (`activeDuel`), таймера и курсора.
  - Обрабатывает команды от 3D-сцены (`hoverHex`, `selectHex`, `tryUpgradeHex`) и от Vue HUD (`startRoulette`, `resolveQuestion`, `resolveDuel`, `finishGame`).
- `useAudioStore.ts` — единый менеджер звука поверх `Howler` (`playSfx`, `playBgm`, `playWelcomeBgm`, `fadeWelcomeBgm`, `stopBgm`).

### 2.4. 3D-движок на чистом Three.js (`resources/js/Game/Renderer/`)
Ни один объект `THREE.Object3D` / `THREE.Mesh` / `THREE.Material` не оборачивается в глубокую реактивность Vue (`ref`).
- `SceneManager.ts` — главный оркестратор игровой 3D-сцены (`GameCanvas.vue`). Подписывается на изменения в `useGameStore` через `store.$subscribe`, управляет циклом `requestAnimationFrame` и очисткой ресурсов (`dispose()`).
- `BoardView.ts` — рендерит 37 клеток и лучи иммунитета на базе общих геометрий (`sharedHexGeometry`, `sharedBeamGeometry`), обновляя цвета и видимость лучей при изменениях в сторе.
- `UnitManager.ts` — управляет 3D-моделями фишек игроков и короной активного игрока с плавной `lerp`-интерполяцией и дугой прыжка при перемещении.
- `CameraController.ts` — управляет орбитальным облётом камеры и фокусировкой на квадранте активного игрока.
- `InteractionManager.ts` — обрабатывает `pointermove`, `click`, `dblclick` на `<canvas>` через `THREE.Raycaster` и вызывает экшены `useGameStore`.
- `PostProcessingManager.ts` — обёртка над `EffectComposer` + `RenderPass` + `UnrealBloomPass` + `OutputPass`.
- `AssetLoader.ts` — кэширующий загрузчик GLTF-моделей фишек (`GLTFLoader`).
- `WelcomeSceneManager.ts` — 3D-сцена стартового экрана (`BackScene.vue`) с общими геометриями и без утечек таймеров.
- `PodiumSceneManager.ts` — 3D-сцена пьедестала награждения (`ScenePodium.vue`).

### 2.5. Vue HUD и страницы (`resources/js/Pages/`)
- `Welcome.vue` + `WelcomeComponents/` — стартовый экран с `BackScene.vue` и слайдерами выбора специальности и числа команд.
- `Game.vue` + `GameComponents/` — игровой экран: рендерит `<GameCanvas />` и чистые HUD-компоненты (`Leaderboard.vue`, `Fight.vue`, `Questions.vue` + `QuestionComponents/*`), которые читают состояние и вызывают экшены напрямую из `useGameStore`.
- `Podium.vue` + `PodiumComponents/ScenePodium.vue` — экран результатов.
- `Admin.vue` + `AdminComponents/` и `Authorization.vue` — админ-панель.

---

## 3. Правила работы со стеком
1. **Единый источник правды:** Вся игровая логика и переходы фаз живут в `useGameStore.ts` и доменных классах `resources/js/Game/Core/`. Vue-компоненты выступают исключительно в роли HUD.
2. **Изоляция Three.js от Vue Reactivity:** Не помещать экземпляры `THREE.Scene`, `THREE.Mesh`, `THREE.Geometry`, `THREE.Material` внутрь `ref()` или Pinia state. Для ссылки на `<canvas>` использовать `shallowRef<HTMLCanvasElement | null>(null)` и освобождать ресурсы в `onUnmounted(() => sceneManager?.dispose())`.
3. **Аудио:** Все звуки и фоновая музыка вызываются централизованно через `useAudioStore`.
4. **Markdown:** Использовать composable `useMarkdown()` (`resources/js/Composables/useMarkdown.ts`).
