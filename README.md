# GlobalFriends

**Connect students. Share knowledge. Build a better world.**

GlobalFriends is a student community where learners from different countries find peers with shared interests, become pen pals, and exchange ideas. Built for the CSC Winter Sparkathon 2026 (theme: technology that helps people connect, cooperate and share meaningful experiences).

## What works
- Email and password sign-up and sign-in (Supabase Auth)
- Student profiles: display name, country, language, bio, interests, skills and learning goals
- Community feed: text posts, likes and comments (visible to signed-in members only)
- Pen pal requests: send, accept or decline
- Peer matching with a visible explanation (shared interests, skills, goals and complementary skills)
- Learning roadmap tool ("Intelligence" page), built from hand-written templates and keyword rules
- Safety: report and block controls
- Admin panel (`/admin`): review reports, delete posts and comments, and remove any profile. Removed people are banned from creating a new profile. Only one account, `ariyantsf@gmail.com`, has these powers, and this is enforced by the database (Row Level Security), not only by the interface.

## Not included (yet)
Photo and video uploads, direct messaging and voice or video calls are not implemented. We left them out on purpose: unmoderated private contact between students is a safety risk that needs proper moderation first.

## Safety and privacy
- No phone numbers, home addresses, school schedules or live location are collected.
- Members must agree to the community rules when they sign up.
- Row Level Security protects every table. Never put the Supabase `service_role` key in the frontend.
- This is a small project, not a staffed moderation service. Reports are reviewed manually by the admin.

## Tech
React, TypeScript, Vite, Tailwind CSS, React Router, Supabase (Auth + PostgreSQL).

## Setup
1. Create a free project at supabase.com.
2. Open the SQL Editor and run `supabase/schema.sql` completely. It is safe to run again.
3. Authentication > Providers: keep Email enabled and keep **Confirm email ON** (the admin role depends on a confirmed email).
4. Authentication > URL Configuration: set Site URL to your deployed address and add `http://localhost:5173` as a redirect URL for local work.
5. Copy `.env.example` to `.env.local` and fill in your Project URL and anon (publishable) key.
6. Run `npm install`, then `npm run dev`.
7. Before deploying, run `npm run typecheck` and `npm run build`.

## Deployment
Deploy to Vercel (`vercel.json` handles page reloads) or Cloudflare Pages (`public/_redirects` handles it). Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the hosting dashboard, then add the live address to Supabase redirect URLs.

## Credits and outside resources
React, React Router, Vite, Tailwind CSS, lucide-react (icons), Supabase and supabase-js. All are open source or free-tier services used under their own licences. No datasets and no external AI API are used.

## AI use
See [AI_USE_DISCLOSURE.md](AI_USE_DISCLOSURE.md). Summary: ChatGPT drafted the first source files, Lovable produced the initial visual prototype, and Claude (Anthropic) reviewed the code, fixed build problems and added the admin tools. The "Intelligence" and matching features are rule-based code, not generative AI.

## Earlier work
The design started from a visual-only Lovable prototype with sample content and no backend. Sign-in, database, posts, likes, comments, pen pal requests, matching, report and block, and the admin panel were implemented afterwards. The commit history shows the dates.

Created by Ariyan Tausif.
