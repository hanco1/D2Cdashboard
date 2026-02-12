# Informa Collect

Lightweight Next.js prototype for D2C internal process assessment.

## What is included

- Public assessment form (`/form`) with 6 sections, 20 questions, conditional logic, progress bar, and validation.
- Internal dashboard (`/dashboard`) with glassmorphism OS-style cards, key metrics, and submission list.
- Detail page (`/dashboard/[id]`) showing full answers grouped by section.
- Submission API (`POST /api/submissions`) with server-side validation.

## Tech stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- Supabase Postgres

## Local run

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
copy .env.example .env.local
```

3. Fill `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
CLEAR_ALL_USERNAME=...
CLEAR_ALL_PASSWORD=...
```

4. Start:

```bash
npm run dev
```

If database env vars are missing, the app falls back to in-memory demo data.

## Supabase setup

1. Create a Supabase project.
2. Open SQL Editor.
3. Run `supabase/schema.sql`.
4. Copy `Project URL` to `NEXT_PUBLIC_SUPABASE_URL`.
5. Copy `service_role` key to `SUPABASE_SERVICE_ROLE_KEY`.

## Deploy to Vercel

1. Import this repository into Vercel.
2. In project settings, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `CLEAR_ALL_USERNAME`
   - `CLEAR_ALL_PASSWORD`
3. Redeploy.
4. Use `/form` URL for QR code destination.

## Notes

- All UI copy is English.
- The form schema lives in `src/lib/form-definition.ts`.
- Dashboard metrics are computed in `src/lib/analysis.ts`.
- `Clear All Data` uses `CLEAR_ALL_USERNAME` and `CLEAR_ALL_PASSWORD`.
