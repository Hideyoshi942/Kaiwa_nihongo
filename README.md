# Kaiwa Nihongo — Japanese Conversation Simulator

AI-powered web platform for practicing real-world Japanese conversations through interactive role-play scenarios.

## Features

### Phase 7 — Avatars, Leaderboard & Business Japanese
- **AI conversation avatars** — Role-based emoji avatars in chat (server, manager, client, etc.)
- **Leaderboard** — XP rankings for signed-in users with PostgreSQL
- **Business Japanese hub** — Dedicated `/business` page with 6 keigo, email, and meeting scenarios
- **46 scenarios** — Expanded library across all categories including pharmacy, hotel, izakaya, interview drills, and more

### Phase 1 (MVP)
- **Scenario library** — 14 scenarios across Daily Life, Workplace, Study Abroad, Job Interviews, and Customer Service
- **AI conversation chat** — Multi-turn role-play with instant feedback
- **Response evaluation** — Grammar, Vocabulary, Naturalness, and Politeness scoring (out of 100)
- **Progress dashboard** — Conversations, average score, study streak, XP & levels
- **Conversation history** — Review past sessions

### Phase 2 — Vietnamese support
- **Bilingual UI** — Full English and Vietnamese interface (switch via navbar)
- **Vietnamese translations** — All 14 scenarios localized (titles, descriptions, opening lines)
- **Locale-aware chat** — AI feedback comments and message translations in selected language
- **Persistent language preference** — Saved in browser localStorage

### Phase 3 — Gamification & Voice
- **Achievements** — 7 unlockable badges with bonus XP (first conversation, streaks, voice, collections)
- **Level-based unlocks** — Intermediate scenarios at Lv.2, advanced at Lv.5
- **Voice mode** — Speak in Japanese via browser speech recognition (Chrome/Edge)
- **Voice evaluation** — Pronunciation, fluency, and speed scores on voice messages
- **Text-to-speech** — Listen to AI responses in Japanese

### Phase 6 — Mobile, Analytics & JLPT Drills
- **Mobile bottom navigation** — 5-tab nav for phone users (Scenarios, Dashboard, Drills, Analytics, History)
- **PWA-ready** — Web app manifest for add-to-home-screen
- **Learning analytics** — Skill breakdown, score trends, vocabulary & grammar pattern tracking
- **JLPT drills** — 12 focused quizzes (grammar, vocabulary, politeness) from N5 to N2

### Phase 5 — Adaptive AI, Whisper & Expanded Library
- **Adaptive difficulty** — AI adjusts to your JLPT level (N5–N1) based on recent scores
- **OpenAI Whisper** — Accurate Japanese speech-to-text when API key is set
- **25 scenarios** — 11 new scenarios (supermarket, bank, post office, train, dormitory, etc.) — later expanded to 46 total
- **Voice mode toggle** — Switch between Whisper AI and browser speech recognition

### Phase 4 — Database, Auth & Recommendations
- **PostgreSQL** — Persistent users, conversations, and messages via Drizzle ORM
- **NextAuth** — Email/password registration and sign-in
- **Cloud sync** — Progress saved to database when signed in; local fallback for guests
- **Personalized recommendations** — AI-driven suggestions based on weak skills and categories

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- PostgreSQL + Drizzle ORM
- NextAuth (credentials)
- OpenAI API (optional)

## Getting Started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Database setup (for cloud sync + auth)

```bash
# Start PostgreSQL
docker compose up -d

# Push schema to database
npm run db:push
```

Set in `.env.local`:
```
DATABASE_URL=postgresql://kaiwa:kaiwa_secret@localhost:5432/kaiwa_nihongo
AUTH_SECRET=<generate-a-random-secret>
AUTH_URL=http://localhost:3000
```

Without `DATABASE_URL`, the app falls back to browser localStorage (guest mode).

### Optional: Enable real AI

The conversation partner is powered by **Google Gemini**. Set:

```
GEMINI_API_KEY=...            # from https://aistudio.google.com/apikey
GEMINI_MODEL=gemini-2.5-flash # optional, this is the default
```

Without a key (or on any API error), the app falls back to the built-in mock
replies so it always runs. `OPENAI_API_KEY` is now only used (optionally) for
Whisper speech-to-text; leave it empty to use browser speech recognition.

## Project Structure

```
src/
  app/           # Pages and API routes
  components/    # UI components
  lib/           # Scenarios, AI, storage, types
```

## Roadmap (from product plan)

- [x] Voice conversation mode
- [x] Achievements & gamification
- [x] PostgreSQL + persistent user data
- [x] NextAuth authentication
- [x] Personalized recommendations
- [x] OpenAI Whisper for improved speech recognition
- [x] Adaptive difficulty
- [x] Mobile-responsive PWA
- [x] JLPT drills & learning analytics
- [x] AI conversation avatars
- [x] Leaderboards
- [x] Business Japanese specialization
- [ ] Native mobile app
