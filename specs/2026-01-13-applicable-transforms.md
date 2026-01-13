# Спецификация (Quest)

## 1. Цель
- Добавить публичный API для получения списка применимых преобразований к выбранному подвыражению и для применения выбранного преобразования детерминированно.

## 2. Текущее состояние (AS-IS)
- Публичные API: `simplifyExpression`, `solveEquation`, `factorPolynomial` в `index.js`.
- Упрощение выражений выполняется через `lib/simplifyExpression/stepThrough.js`, где шаги ищутся сверху вниз по дереву.
- Поиск шагов реализован через searcher-модули (`basicsSearch`, `fractionsSearch`, и т.д.), которые возвращают `Node.Status`.
- `changeType` задается константами из `lib/ChangeTypes.js`, `changeGroup` хранится на узлах AST.

## 3. Проблема
- Нельзя получить список применимых правил для конкретного выделенного подвыражения.
- Нельзя применить преобразование к выбранному поддереву и получить детерминированный `NodeStatus` для полного выражения.

## 4. Целевое состояние (TO-BE)
- Появляется новый публичный модуль `applicableTransforms`, экспортируется из корня.
- Новые функции:
  - `listApplicableTransforms(expressionString, selectionPath, options) -> ApplicableTransform[]`
  - `applyTransform(expressionString, selectionPath, transformId, options) -> NodeStatus`
  - `normalizeExpressionString(expressionString) -> string`
- Функции работают с выбранным поддеревом, применяя правила mathsteps только к нему.
- Для UI доступны список ходов, превью изменения и подсветка через `changedPaths`.

## 5. Non-Goals
- Не добавлять новые домены кроме `simplify`.
- Не менять существующую логику `simplifyExpression/solveEquation/factor`.
- Не расширять UI/MathHelper в этом репозитории.

## 6. Области ответственности
- `lib/applicableTransforms/index.js` -> новый публичный API.
- `index.js` -> экспорт нового API.
- `lib/simplifyExpression/*Search` -> остаются без изменений, используются как источники правил.
- `lib/util/print.js` -> используется для стабильной сериализации.

## 7. Точки интеграции
- Внутренние: `lib/simplifyExpression/stepThrough.js` (порядок searchers), `lib/TreeSearch.js`, `lib/node/Status.js`.
- Публичные: `index.js` (экспорт `applicableTransforms`).

## 8. Бизнес-правила
- Каждый “ход” должен быть применим к выделенному узлу или его локальному контексту (родитель).
- `applyTransform` должен возвращать тот же `newNode`, что и `preview` из `listApplicableTransforms`.
- Дедупликация по сигнатуре `print.ascii(newRoot)` при `options.dedupe`.

## 9. Обработка ошибок
- `listApplicableTransforms` и `applyTransform` выбрасывают `Error` с кодом:
  - `INVALID_EXPRESSION` при ошибке парсинга;
  - `INVALID_PATH` при неверном `selectionPath`;
  - `UNKNOWN_TRANSFORM` при неизвестном `transformId`;
  - `INVALID_DOMAIN` если `options.domain` не поддерживается (пока допустим только `simplify`).

## 10. Производительность
- Ограничение `maxTransforms` обрезает список после дедупликации.
- Поиск идет по списку searchers в фиксированном порядке, как в `simplifyExpression`.

## 11. Изменения модели данных
- Новый тип данных `ApplicableTransform`.
- Новый тип пути `NodePath` (формат A: массив шагов `['args', 0, 'content', ...]`).
- Новое поле `changedPaths` в ответах API для UI-подсветки.

## 12. План миграции
- Без миграций данных. Новый API добавляется поверх текущих.

## 13. Обратная совместимость / откат
- Обратная совместимость сохраняется, существующие API не меняются.
- Откат: удалить новый модуль и экспорт из `index.js`.

## 14. Критерии приемки
- [ ] `listApplicableTransforms` возвращает 0+ ходов для валидного выражения и пути.
- [ ] Каждый ход содержит `id`, `title`, `changeType`, `searcher`, `path`, `preview`, `changedPaths`.
- [ ] `applyTransform` возвращает `NodeStatus` и совпадает с `preview` по `newNode`.
- [ ] Дедупликация работает по `print.ascii(newRoot)`.
- [ ] Обработка ошибок соответствует кодам, включая `INVALID_DOMAIN` для неподдерживаемого `options.domain`.
- [ ] Юнит-тесты покрывают новые функции и edge cases.

## 15. План тестирования и команды
- Тесты: `test/applicableTransforms/*.test.js`
- Команды: `npm test`, `npm run lint`
- Результаты SPEC-LINTER:
  1. PASS — цель описана.
  2. PASS — AS-IS описан.
  3. PASS — проблема сформулирована.
  4. PASS — цели ограничивают решение.
  5. PASS — Non-Goals заданы.
  6. PASS — ответственности распределены.
  7. PASS — точки интеграции указаны.
  8. PASS — бизнес-правила формализованы.
  9. PASS — обработка ошибок описана.
  10. PASS — производительность учтена.
  11. PASS — изменения модели данных описаны.
  12. PASS — план миграции указан.
  13. PASS — совместимость и откат описаны.
  14. PASS — критерии приемки измеримы.
  15. PASS — план тестирования есть.
  16. PASS — команды проверки есть.
  17. PASS — пошаговый план есть.
  18. PASS — открытые вопросы отсутствуют.
  19. PASS — масштаб задачи соответствует глубине спеки.
  20. PASS — профиль учтен.
- Результаты SPEC-RUBRIC: 30/30.
- Слабые места: нет.

## 16. Пошаговый план реализации
1. Добавить новый модуль `lib/applicableTransforms/index.js` и экспорт.
2. Реализовать `normalizeExpressionString`, парсинг и навигацию по `NodePath`.
3. Реализовать `listApplicableTransforms` с поиском по searchers и дедупликацией.
4. Реализовать `applyTransform` с детерминированным применением по `transformId`.
5. Добавить тесты для API и golden-снимки.

## 17. Открытые вопросы
- Нет.

## 18. Соответствие профилю
- Профиль: `product-system-design`.
- Выполненные требования профиля:
  - цели / non-goals
  - архитектура и публичный API
  - настройки и UX-параметры (`options`)
  - безопасность (обработка ошибок)

## 19. Таблица изменений файлов
| Файл | Изменения | Причина |
| --- | --- | --- |
| lib/applicableTransforms/index.js | новый модуль | API применимых преобразований |
| index.js | экспорт модуля | публичный доступ |
| test/applicableTransforms/*.test.js | новые тесты | покрытие API |
| specs/2026-01-13-applicable-transforms.md | спецификация | Quest Mode |

## 20. Таблица соответствий (было -> стало)
| Область | Было | Стало |
| --- | --- | --- |
| Публичный API | simplify/solve/factor | + applicableTransforms |
| Применение правил | только к корню | к выбранному поддереву |
| Подсветка | changeGroup в узлах | changedPaths на уровне API |

## 21. Альтернативы и компромиссы
- Вариант: не вводить `normalizeExpressionString`.
  - Плюсы: меньше логики.
  - Минусы: нестабильные `id` и дубликаты.

---

## Приложение A: Аудит searchers и контрактов

### A1. Порядок searchers (simplifyExpression)
1. `basicsSearch`
2. `divisionSearch`
3. `fractionsSearch`
4. `collectAndCombineSearch`
5. `arithmeticSearch`
6. `breakUpNumeratorSearch`
7. `multiplyFractionsSearch`
8. `distributeSearch`
9. `functionsSearch`

### A2. Контракт searcher
- Вход: `node` (mathjs AST).
- Выход: `Node.Status`:
  - `changeType` (строка из `lib/ChangeTypes.js`)
  - `oldNode`, `newNode`
  - `substeps` (массив `Node.Status`)
- Searcher реализует дерево обходом через `TreeSearch.preOrder` или `TreeSearch.postOrder`.
- `changeGroup` задается на узлах AST внутри конкретных правил.

### A3. Таблица “Searcher -> changeType -> когда срабатывает” (кратко)
| Searcher | Примеры changeType | Когда срабатывает |
| --- | --- | --- |
| basicsSearch | `REMOVE_ADDING_ZERO`, `REARRANGE_COEFF`, `REDUCE_EXPONENT_BY_ZERO` | Базовые локальные упрощения узла |
| divisionSearch | `SIMPLIFY_DIVISION`, `MULTIPLY_BY_INVERSE` | Переписывание цепочек деления |
| fractionsSearch | `SIMPLIFY_FRACTION`, `CANCEL_TERMS`, `ADD_FRACTIONS` | Упрощение дробей и сложение дробей |
| collectAndCombineSearch | `COLLECT_AND_COMBINE_LIKE_TERMS`, `ADD_POLYNOMIAL_TERMS` | Сбор и объединение однотипных членов |
| arithmeticSearch | `SIMPLIFY_ARITHMETIC` | Вычисление констант |
| breakUpNumeratorSearch | `BREAK_UP_FRACTION` | Разбиение числителя |
| multiplyFractionsSearch | `MULTIPLY_FRACTIONS` | Перемножение дробей |
| distributeSearch | `DISTRIBUTE`, `EXPAND_EXPONENT` | Раскрытие скобок и степеней |
| functionsSearch | `ABSOLUTE_VALUE`, `CANCEL_ROOT` | Упрощение функций (abs, nthRoot) |

---

## Приложение B: Проектирование API

### B1. Типы данных (TS-совместимые)
```ts
type NodePath = Array<string | number>;

type ApplicableTransform = {
  id: string;
  title: string;
  changeType: string;
  searcher: string;
  path: NodePath;
  preview: NodeStatus;
  changedPaths: Array<{ path: NodePath; groupId: number }>;
};

type ApplicableTransformsOptions = {
  domain: 'simplify';
  maxTransforms?: number;
  dedupe?: 'byNewNode' | 'byId';
  includeSubsteps?: boolean;
};
```

### B2. Формирование id
- `id = ${searcherName}:${changeType}:${sha1(signature)}`
- `signature = print.ascii(newRoot)`

### B3. normalizeExpressionString
- `normalizeExpressionString(expressionString)` возвращает `print.ascii(math.parse(expressionString))`
- Используется для стабилизации ввода и сигнатур.

### B4. Применимость к выделенному подвыражению
- Базовый запуск searcher на выбранном узле.
- Контекстный запуск: searcher вызывается на родителе выбранного узла.
- Из результата выбираются только изменения, где измененный узел совпадает с `selectionPath`.
  - Если изменение вне `selectionPath`, ход не включается.

### B5. Подсветка изменений
- В `ApplicableTransform` добавляется `changedPaths`.
- `changedPaths` получается из `changeGroup` в `preview` с префиксом `selectionPath`.
