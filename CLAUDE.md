# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (localhost:3010)
npm run build        # Production build
npm run start        # Start production server (localhost:3010)
npm run lint         # ESLint (eslint-config-next with core-web-vitals + typescript)
```

Dev and production servers both run on port 3010. No test framework is configured — use `npm run build` to verify changes compile correctly.

If `npm run build` shows errors unrelated to your changes, they were likely introduced by another Claude Code instance or the user — ignore them and focus on your own work.

## Architecture

FireTime is a dual-user vacation time management app built with Next.js 16 (App Router). Two users (user1, user2) each manage daily schedules, tasks, and todos, and can view each other's data.

### Data Storage

All data is persisted as JSON files on the local filesystem under `data/`. There is no database.

- `lib/store.ts` — the single data access layer; all reads/writes go through this file using Node.js `fs`
- `data/days/YYYY-MM-DD.json` — per-day data (schedule + tasks for both users)
- `data/users.json`, `settings.json`, `templates.json`, `todos.json` — global data

When a day file doesn't exist, `getDayData()` auto-creates it from the default schedule template.

### API Layer

REST API routes under `app/api/` act as thin wrappers around `lib/store.ts`:
- `GET/PUT /api/days/[date]` — day data
- `PUT /api/schedules/[date]` — update one user's schedule within a day
- `PUT /api/tasks/[date]` — update one user's tasks within a day
- `GET/PUT /api/todos` — global todo list (independent of days)
- `GET/PUT /api/settings` — app settings (vacation, subjects, exams)
- `GET/PUT /api/templates` — schedule templates
- `GET/PUT /api/users` — user names

### Frontend Data Flow

- Custom hooks in `hooks/` use **SWR** to fetch from API routes and expose `mutate` functions
- `useDayData(date, userId)` — schedule and tasks for a specific day/user
- `useGlobalTodos()` — global todo list with add/cycle-status/delete
- `useSettings()` — vacation, subjects, exams settings
- `useCalendarData()` / `useWeekData()` — aggregated views

### Provider Hierarchy (app/layout.tsx)

`ThemeProvider` (next-themes) → `UserProvider` (React Context for current user identity)

Current user selection is stored in `localStorage` and exposed via `useUser()` hook. All `(app)/` pages are wrapped in a sidebar layout (`app/(app)/layout.tsx`).

### UI

- **shadcn/ui** (new-york style) with Radix UI primitives — components in `components/ui/`
- **Tailwind CSS 4** — styles in `app/globals.css`
- **lucide-react** for icons
- shadcn CLI configured via `components.json` (aliases: `@/components`, `@/lib`, `@/hooks`)

### Key Types (lib/types.ts)

- `DayData` — contains `date`, `user1: UserDayData`, `user2: UserDayData`
- `UserDayData` — contains `schedule: TimeBlock[]` and `tasks: Task[]`
- `TimeBlock` — time range with label and category
- `GlobalTodoItem` — status cycles: pending → in_progress → completed
- `AppSettings` — vacation dates, subjects with homework tracking, exam countdowns

### Date Conventions

All dates use `YYYY-MM-DD` string format. All times use `HH:mm` string format. Utility functions in `lib/dates.ts`.
