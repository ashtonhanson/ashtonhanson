# Ashton Hanson Design

Portfolio site for branding, logos, and advertising: [ashtonhanson.com](https://www.ashtonhanson.com).

## Local

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Preview in this repo is often run on port 3040.

## Stack

Next.js App Router, React, Tailwind CSS. Page copy and case studies live in `src/lib/content.ts`. The work galleries are the `ah-media-gallery-v32` custom element in `src/components/ah-media-carousel.ts`.

## Contact form

Set `CONTACT_TO_EMAIL` and, for production delivery, `RESEND_API_KEY` plus `CONTACT_FROM_EMAIL`. Without Resend, the action falls back to Formsubmit.

## Rollback

Before the 2026-09-01 hygiene pass, main was tagged `pre-maintenance-2026-09-01`.
