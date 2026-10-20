# Al-Ihkam website

The website for Al-Ihkam (الاحکام), a Shariah advisory firm and Islamic finance academy. Built with Next.js 16 in English and Urdu, with right-to-left Urdu set in Nastaliq.

## Run it

**On Windows, the easy way:** double-click `START-WINDOWS.bat`. The first run installs packages, which takes a minute or two. The site then opens at http://localhost:3000. The admin panel also needs PostgreSQL (see below).

**From a terminal:**

```bash
npm install
npm run dev        # development, http://localhost:3000
npm run build      # production build
npm start          # serve the production build
```

You need Node.js 20.9 or newer (https://nodejs.org, LTS version).

## What is in it

| Page | English | Urdu |
|---|---|---|
| Home | `/en` | `/ur` |
| Shariah advisory | `/en/advisory` | `/ur/advisory` |
| Academy catalogue | `/en/academy` | `/ur/academy` |
| Programme detail pages | `/en/academy/[slug]` | `/ur/academy/[slug]` |
| Faculty | `/en/faculty` | `/ur/faculty` |
| Zakat calculator | `/en/zakat` | `/ur/zakat` |
| Insights | `/en/insights` | `/ur/insights` |
| Contact, with FAQ | `/en/contact` | `/ur/contact` |

The site also includes a sitemap, robots.txt, hreflang links between the two languages, Open Graph images, and structured data for the organisation, each course and each article. There is a floating WhatsApp button and a branded 404 page.

## Admin panel

Sign in at `/admin` (for example http://192.168.90.152:3005/admin). The first administrator is `admin` with the password `admin123`: change it under **My account** straight after the first sign-in.

| Section | What it does |
|---|---|
| Dashboard | New enquiries, recent articles, recent page edits and team activity at a glance |
| Enquiries | Every consultation request, with where the visitor came from (UTM, referrer). Set a status, assign it to a colleague, add private notes, filter, export to CSV |
| Pages | Edit every heading, paragraph, list and image on the site in English and Urdu side by side. Save a draft, preview it on the real page, then publish. Each field keeps a history and can be reset to the original |
| Insights | Write articles in a rich text editor with headings, lists, quotes, Arabic text, links and images. Autosave, preview, send for review, schedule or publish. Per article search title, description and share image |
| Programmes | Add, edit, hide, reorder and delete Academy courses and corporate workshops |
| Faculty | Profiles with photo, role, biography, education, areas of work and profile links |
| Media library | Upload images and PDFs. Images are resized and compressed automatically. A file in use on the site cannot be deleted |
| SEO | Search title, description, share image and "hide from Google" for each page and programme, with a Google preview |
| Settings | Email, phone, WhatsApp, location, office hours, social links, who receives consultation emails, Zakat calculator rates, Google Analytics and Tag Manager |
| Users | Add staff and set their role, reset passwords, disable accounts |
| Activity | A log of who changed what and when |

**Roles.** Administrators can do everything. Editors manage all content and enquiries but not users or settings. Authors write their own articles and send them for review; an editor publishes them.

**How changes go live.** Public pages are prerendered static HTML, so the site stays fast. Saving in the admin rebuilds only the pages that changed, within a second or two. Drafts are only visible through Preview, to signed-in staff.

**Security.** Passwords are hashed with scrypt. Sessions use an httpOnly cookie. Sign-in is limited to 5 attempts per user and 20 per network address every 15 minutes. Every admin action checks the session, the role and a per-session CSRF token. All SQL is parameterised. Article HTML is sanitised on save. Admin pages are marked noindex and are never in the sitemap.

## Setting up the database

```bash
cp .env.example .env.local     # then fill in DATABASE_URL and the rest
npm install
npm run setup                  # creates the tables, the first admin, and imports the built-in content
npm run build
npm start
```

`npm run setup` is safe to run again after an update: it applies new files in `db/` (numbered SQL migrations) and never overwrites content you have edited. Without `DATABASE_URL` the public site still runs from the built-in content in `lib/`, but the admin panel is unavailable.

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Public address of the site |
| `DATABASE_URL` | PostgreSQL connection |
| `MEDIA_DIR` | Folder for uploads, outside the code folder. Defaults to `../al-ihkam-media` |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_EMAIL` | First administrator, used only by `npm run setup` when none exists |
| `COOKIE_SECURE` | Force the Secure cookie flag. Automatic on https |
| `ADMIN_ALLOWED_ORIGINS` | Extra host names allowed to submit admin forms, when behind a proxy |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Optional email delivery. Without it, requests are still saved under Enquiries |

## Where the default content lives

The admin panel edits a copy in the database. The originals stay in code and are what **Reset to default** returns to:

| What | File |
|---|---|
| Interface text, English and Urdu | `lib/dict/en.ts`, `lib/dict/ur.ts` |
| Default contact details and Zakat rates | `lib/site.ts` |
| Starting programmes, faculty, advisory services, articles | `lib/content/` |
| Colours, fonts and layout | `app/globals.css` (tokens at the top) |
| Site photographs | `public/images/` |

## Before going live

1. **Change the admin password**, and give each colleague their own account under Users.
2. **Faculty photos and profile links.** Add them under Admin › Faculty. Until a photo is added, a geometric monogram is shown.
3. **Email.** Ask the server admin to add the `SMTP_*` values to `.env.local`, then use **Send a test email** in Settings.
4. **Domain and HTTPS.** Set `NEXT_PUBLIC_SITE_URL` to the real domain once the proxy is in place.
5. **Zakat rates.** Update them in Admin › Settings regularly, and the official bank deduction Nisab each February.
6. **Scholarly review.** The articles, the Zakat calculator wording and the Quranic reference (Hud 11:1) should be approved by Dr. Khattak.
7. **Regulatory wording.** The site says reviews *reference* AAOIFI, SBP and SECP frameworks. It does not claim a licence. Only add a registration claim once it is actually held.

## Deploy

Any Node.js 20.9+ host with PostgreSQL: `npm ci && npm run setup && npm run build && npm start`. Keep `.env.local` and the `MEDIA_DIR` folder outside of what a redeploy replaces.

## Images

All photographs were generated with ElevenLabs (Seedream 5 Pro) for this project. The prompts are in `docs/IMAGE-PROMPTS.md`. They contain no people, no text and no real buildings.
