# TIC Platform — Futures Church

Hybrid discipleship site: watch the TIC (The Investigative Course) videos, submit questions, and confirm attendance at TIC night. TIC-night RSVPs sync to Planning Center.

## Stack
- Next.js (App Router) + Tailwind CSS
- Supabase (Auth, Postgres, RLS)
- Netlify (hosting + serverless functions for PCO API calls)
- Planning Center API (event registration)

## Branding
Brand tokens (colours, fonts, logo usage) are pulled from the Futures Church Brand Guidelines v1.0 and wired into `src/app/globals.css` as Tailwind theme vars. Font files and logo assets live in `public/fonts` and `public/brand`.

## Status
Early scaffold — see the project plan doc (shared with Shannon via the Claude project) for the full architecture, data model, and open questions.

## Getting started
\`\`\`bash
npm install
npm run dev
\`\`\`
