# Командамен жұмыс ережелері

Қысқа ережелер — толығы сілтемелерде. Күмән болса, бар кодтағыдай жазыңыз.

## Код қайда жатады (Angular Style Guide)

Негізі: [Angular Style Guide](https://angular.dev/style-guide).

1. **Функция бойынша папкалар.** Бөлім — `src/app/features/<бөлім>/` (`pos`, `warehouse`, `inventory`,
   `documents`, `reports`, `login`, `shell`): оның беттері, компоненттері, сервисі, типтері және тесттері бірге.
   `components/`, `services/` сияқты түр бойынша папкалар жасамаңыз.
2. **`core/`** — қолданбада бір рет керек нәрсе: баптаулар (`config/`), API клиенті (`api/`), кіру/токен/guard/interceptor
   (`auth/`), навигация, toast. **`shared/`** — бірнеше бөлім қолданатын UI мен көмекшілер (`ui/`, `format/`, `models/`).
   Бір бөлімге ғана керек код `shared/`-ке емес, сол бөлімге жатады.
3. **Бір файл — бір ұғым.** Файл атауы — ішіндегі негізгі идентификатор, дефиспен: `SalePage` → `sale-page.ts`,
   `AuthService` → `auth.service.ts`. Тест жанында: `sale-page.spec.ts`. `utils.ts`, `helpers.ts` деген атаулар жоқ.
4. **Standalone компоненттер, signals, жаңа control flow** (`@if`, `@for`, `@switch`). Күй — `signal`/`computed`,
   `input()`/`output()`/`viewChild()`; `*ngIf`, `NgClass`, `@Input()` декораторлары қолданылмайды.
5. **`inject()`** — конструктор параметрлерінің орнына. Тек шаблонда қолданылатын мүшелер — `protected`;
   input/output/query — `readonly`.
6. **Компонент — тек көрсету.** HTTP — сервисте (`ApiService` арқылы, `HttpClient` тікелей емес),
   есептеулер мен тексерулер — бөлек таза функцияларда (мысалы, `cart.ts`, `audit-counts.ts`) — оларды тесттеу оңай.
7. **Формалар — reactive forms** (`FormControl`, `NonNullableFormBuilder`).
8. **Стильдер:** жалпы класстар — `src/styles.css`; түстер мен өлшемдер тек CSS токендері арқылы (`var(--primary)`),
   жаңа түс керек болса — `:root`-қа токен қосыңыз. Оқиға өңдеушісі не істейтінін атайды: `sell()`, `saveCounts()`,
   `onClick()` емес.
9. **Мәтіндер — қазақ тілінде**, бар терминдермен (Түгендеу, Есептен шығару, Күшін жою…).

## TypeScript

[Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html) негіздері:
`const`/`let` (ешқашан `var`), `any` жоқ (`unknown` + тексеру), `===`, атаулар: `UpperCamelCase` — класс/тип,
`lowerCamelCase` — айнымалы/функция, `CONSTANT_CASE` — тұрақтылар; `export default` жоқ; түсініктемелер — «неге», «не» емес.
`tsconfig` — `strict` + Angular `strictTemplates`: қатесіз жиналуы міндетті.

## Линтер және форматтау

```bash
npm run lint          # ESLint: angular-eslint + typescript-eslint (шаблондар мен a11y ережелері де)
npm run typecheck     # tsc --noEmit
npm run format        # Prettier (тексеру: npm run format:check)
npm test              # Vitest
```

CI осылардың бәрін тексереді. Ережені өшіру (`eslint-disable`) — тек себебі жазылған түсініктемемен.
Қаласаңыз: `pre-commit install` (`.pre-commit-config.yaml`).

## Тармақтар, коммиттер, PR

- **Тармақ** — Linear ID-мен: `QLDB-123-chekke-zhenildik` (Linear-дағы «Copy git branch name»). `main`-ге тікелей push жоқ.
- **Коммиттер** — [Conventional Commits](https://www.conventionalcommits.org/): `feat(pos): ...`, `fix(inventory): ...`,
  `refactor:`, `test:`, `docs:`, `chore:`. Бір коммит — бір логикалық өзгеріс.
- **Бір PR = бір тапсырма.** PR сипаттамасы — `.github/pull_request_template.md` бойынша; UI өзгерсе — скриншот.
  Кіші PR (≈400 жолға дейін) тез әрі сапалы қаралады.
- **Code review** — [Google code review practices](https://google.github.io/eng-practices/review/):
  қарайтын адам кодтың жалпы сапасын жақсартатын PR-ды мақұлдайды (мінсіз болуын күтпейді); ескертулер — кодқа,
  адамға емес; маңызсыз ескертуді `Nit:` деп белгілеңіз; автор әр ескертуге жауап береді. CI жасыл болмаса — merge жоқ.
