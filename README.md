# Blue Bee – Event & Wedding Management (MERN)

Public site: Home · About · Services (+ detail pages) · Gallery · Book (live calendar) · Contact.
Admin panel at `/admin`: approve or reject bookings, manage enquiries, and edit every photo and video on the site.

## Run
```bash
cd server && cp .env.example .env      # then edit .env (see below)
npm install && npm run dev             # API  → http://localhost:5000
cd ../client && npm install && npm run dev   # Site → http://localhost:5173
```
Requires Node 18+ and MongoDB (local, or a free MongoDB Atlas URI in `MONGO_URI`).

## Admin login (do this before going live)
1. Run `npm run hash -- "your-strong-password"` inside `server/`.
2. Paste the printed `ADMIN_PASSWORD_HASH="..."` into `server/.env` and delete `ADMIN_PASSWORD`.
3. Set `JWT_SECRET` to a long random string.
Login is rate-limited (10 tries / 15 min).

## What the admin can do
| Tab | Actions |
|---|---|
| **Overview** | Pending / approved / rejected counts, unread enquiries, next approved events |
| **Bookings** | Approve · Reject (with an optional reason emailed to the client) · Back to pending · Delete · Filter + search |
| **Enquiries** | Read / unread · Reply by email · WhatsApp · Delete |
| **Gallery photos** | Upload up to 20 photos at once · edit title/category · replace the photo · Feature · Hide/Show · reorder · delete |
| **Event videos** | Upload MP4/WebM (with progress bar) · optional thumbnail · edit · replace · hide · reorder · delete |
| **Site images** | Replace the hero video/photo, banners, the "Why Blue Bee" cards, About photo and all 12 service photos. "Reset" restores the original. |

Changes are live on the website immediately; no code edits or redeploys.

## AI chat assistant ("Bee")
A chat bubble appears on every public page.
- **Time-aware:** greets with Good morning / afternoon / evening in `BUSINESS_TZ`, and says whether the team is online (`BUSINESS_HOURS`). Outside hours it promises a reply when the team reopens.
- **Checks live dates** against your booking calendar, and explains booked / pending / free.
- **Captures leads:** when a visitor wants a quote or a call, it collects name + phone/email + needs and saves an enquiry (tagged "via AI chat" in Admin → Enquiries) and emails you.
- Never quotes prices, never confirms bookings, answers in the visitor's language, stays on topic.
- **Setup:** add `ANTHROPIC_API_KEY` to `server/.env` (key from console.anthropic.com), and fill the `COMPANY_*` and `WHATSAPP_NUMBER` lines so it gives correct contact details. The key never reaches the browser. Without a key the chat shows a WhatsApp fallback.
- **Cost controls:** 25 messages per 10 minutes per visitor, 600 characters per message, `CHAT_DAILY_LIMIT` replies per day. `CHAT_MODEL` defaults to the fast, low-cost `claude-haiku-5-5`.

## How booking works
Client picks a green date → request is *pending* (date locks, shown yellow) → admin **Approves** (red / booked) or **Rejects** (date freed) → client is emailed automatically.
A unique database index prevents two bookings on one day, even if two people click at the same moment.

## Uploads & hosting
- Files are saved to `server/uploads/` and served at `/uploads/...`. Photos max 15 MB, videos max `MAX_UPLOAD_MB` (default 200).
- **Your host must keep this folder** (a VPS or a Render/Railway *persistent disk*). On hosts with a temporary disk (Heroku, free Render) uploads disappear on restart. In that case move uploads to Cloudinary or S3.
- If the website and API are on different domains, set `VITE_API_URL` in `client/.env` (e.g. `https://api.bluebee.in`) and put the website's URL in `CLIENT_URL` in `server/.env`.
- Behind Nginx / Render / Railway set `TRUST_PROXY=1` so rate limiting sees real visitor IPs.

## Customise
- `client/src/data.js`: phone, email, address, services text, testimonials, built-in default images.
- `client/.env`: `VITE_WA=918592019430` (country code + number, no "+").
- Testimonials still containing the "Replace this…" placeholder text are hidden automatically until you write real ones.
- Fonts: Young Serif + Figtree via Google Fonts (see `client/index.html`).


## Bee AI chatbot (Gemini)

The server-side chat assistant uses the Gemini Developer API. Create an API key at https://aistudio.google.com/apikey and add it to `server/.env`:

```env
GEMINI_API_KEY=your_real_key_here
GEMINI_MODEL=gemini-3.8-flash
CHAT_DAILY_LIMIT=1500
```

Keep the key only in the server environment; never add it to the React client or commit it to Git. Restart the server after changing `.env`. The Gemini free tier has model- and project-specific rate limits and can change; check https://ai.google.dev/gemini-api/docs/pricing before publishing the chatbot.
