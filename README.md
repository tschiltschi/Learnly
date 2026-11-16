# Learnly

**Learn smarter. Not harder.**

Learnly is an AI-assisted learning platform for students. This repository is the frontend MVP: a complete, interactive React app with three learning areas (Languages, Mathematics, Theory), flashcards, tests, progress statistics, a Free/Premium model and the Premium AI screens (Learning Coach, Learning Plan, Voice Mode).

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # production build in dist/
npm run build:single # one self-contained HTML file in dist-single/
```

Requires Node 18+.

## What works

| Area | Features |
| --- | --- |
| Auth | Sign in / sign up screens with validation, Google button, sign out (demo auth, stored locally) |
| Dashboard | Greeting, daily goal ring, streak, total study time, completed exercises, three subject cards, recent activity, weekly chart |
| Languages | Create / edit / delete vocabulary lists, add / edit / delete words, bulk paste, flashcards with 3D flip in both directions, multiple-choice tests, per-word accuracy |
| Mathematics | Algebra, Geometry, Percentages with 18 exercises, formula sheets, numeric and multiple-choice answers, step-by-step solutions, performance tracking, timed exam simulation (Premium) |
| Theory | Topics grouped by subject, notes editor, PDF / DOCX / TXT / MD upload (drag and drop), flashcard generation from notes, quizzes with score history |
| My Flashcards | All decks, smart review across decks with Leitner spaced repetition (Premium) |
| Learning Progress | Stats, 7 / 30-day study chart, subject breakdown, weakness analysis (Premium), session history |
| Premium | Pricing page, comparison table, upgrade modal, locked features with badges, demo upgrade toggle |
| AI Learning Coach | Chat UI, conversation history, suggested questions, subject selection |
| Learning Plan | Weekly calendar, daily goal, exams with countdown, add / complete / delete sessions, suggested sessions |
| Voice Mode | Mic button, listening / thinking / speaking states, transcript, subject selection |
| Settings | Profile, plan, preferences, AI integration status, reset data |

All user content (lists, words, topics, cards, documents metadata, attempts, plans, chats, settings) is persisted in `localStorage`.

## Demo vs. real functionality

No AI model and no payment provider are connected. Nothing pretends to be AI:

- **AI Coach**: shows pre-written sample conversations (e.g. "I don't understand mitosis."). Any other question returns a clear "no AI connected" notice. Every sample answer is labelled *Sample answer · demo*.
- **Voice Mode**: plays a pre-written sample conversation. The microphone is not used. Answers can be read aloud with the browser's speech synthesis.
- **Flashcard generation**: uses a rule-based extractor (`Term: definition` lines and `X is Y` sentences), labelled *Rule-based · no AI*. It counts towards the Free plan's 10 generations per month.
- **Study plan suggestions**: rule-based scheduler that weights subjects by exam proximity, labelled *Rule-based*.
- **Document analysis**: PDF / DOCX files are stored with the topic; analysis returns "needs a connected AI provider". TXT / MD text is added to notes.
- **Premium upgrade**: a demo toggle, no payment is taken. Switch back in Settings or on the pricing page.
- **Sign in**: any email and password work; accounts live in the browser.

Quizzes, tests, spaced repetition, math checking, statistics and weakness analysis are real and computed from your answers.

## Plugging in a real AI

All AI calls go through one interface, `src/services/ai/types.ts` (`AIProvider`):

```
chat()               -> AI Learning Coach
generateFlashcards() -> Theory "Generate flashcards"
suggestStudyPlan()   -> Learning Plan "Suggest sessions"
voiceTurn()          -> Voice Mode (browser speech-to-text and text-to-speech around it)
analyzeDocument()    -> Premium document analysis
```

- `demoProvider.ts`: the demo implementation (scripted samples, rule-based generators, all labelled "Demo").
- `httpProvider.ts`: the production provider. It POSTs to the Supabase `ai` function (`supabase/functions/ai`), which calls Claude with the key stored on the server, checks the plan and counts Free generations.

Set `VITE_AI_PROVIDER=http` to switch. `VITE_AI_BASE_URL` can point at a different backend that implements the same routes.

## Going live: Supabase, Stripe and Claude

Without configuration Learnly stays a browser-only demo. With it:

| Part | Where | What it does |
|---|---|---|
| Accounts | Supabase Auth | Email and password (with confirmation and password reset), optional Google |
| Data sync | `app_state` table | The whole learning state per user as JSON, saved 1.5 s after each change |
| Plan | `profiles.plan` | Written only by the Stripe webhook; the browser can read it, not change it |
| Payments | `create-checkout`, `customer-portal`, `stripe-webhook` | Stripe Checkout subscription, self-service cancel, plan updates |
| AI | `ai` | Claude for coach, voice, flashcards, plan and document summaries; Premium checks and the Free limit on the server |

Database schema and row level security: `supabase/migrations/`. Frontend glue: `src/services/backend/` (`BackendSync` loads and saves the state, `usePlanActions` picks demo, Stripe or disabled buttons).

Step-by-step setup in the browser only (in German): [docs/EINRICHTUNG.md](docs/EINRICHTUNG.md). Database and functions deploy from GitHub Actions (`.github/workflows/supabase-deploy.yml`) on every push to main that touches `supabase/`. Environment variables: [.env.example](.env.example).

## Languages (English / Deutsch)

The interface is available in English and German. The language is picked from the browser on first visit and can be switched in **Settings → Language** or with the EN/DE switch on the login screen; the choice is saved with the other settings.

- `src/i18n/index.ts` has `useT()`. English source text is the key: `t('Save profile')`. Placeholders use `{name}`.
- `src/i18n/de.ts` holds the German strings. A missing key falls back to English, so nothing breaks while a translation is pending.
- Built-in content has German versions: math topics and exercises (`src/data/math.de.ts`, same ids so progress is shared) and the demo coach and voice scripts (`src/data/coachScripts.de.ts`).
- The AI layer receives `language` on every request, so a real provider can answer in the user's language.
- Sample lists, theory topics, their cards and the sample coach chat exist in both languages (`src/data/samples.de.ts`). Switching the language swaps only text the user has not changed, and keeps all progress (`src/data/localizeSamples.ts`).
- The rule-based card extractor understands German sentences too ("X ist Y.", "X bezeichnet Y.").

## Project structure

```
src/
  App.tsx                 routes (hash based: #dashboard, #languages-<id>-study-fwd, ...)
  store/AppStore.tsx      app state, persistence, plan, toasts, upgrade modal
  services/ai/            AI provider interface, demo provider, HTTP provider, config
  data/                   sample vocabulary, math exercises, theory topics, tutor scripts
  lib/                    router, spaced repetition, quiz builder, stats, planner, card extractor
  components/ui/          Button, Card, Badge, Modal, Progress, EmptyState, ...
  components/layout/      Sidebar, AppShell, Logo, navigation
  components/study/       Flashcard, StudySession, MultipleChoiceTest
  components/premium/     UpgradeModal, PremiumPageGate, LockedFeature, plan data
  pages/                  Dashboard, languages/, math/, theory/, Flashcards, Progress, Coach, Plan, Voice, Pricing, Settings, Auth
```

Stack: React 18, TypeScript, Vite, Tailwind CSS, lucide-react icons.
