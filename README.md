# Shakti Textiles — Full-Stack B2B Website

Proof-led, export-grade website for a narrow-woven elastics & technical webbing
manufacturer (Surat, India). React + Vite + Tailwind frontend, Express + MongoDB
backend, with an admin dashboard for enquiries, catalogue and content.

> All numbers, people and certifications in the seed data are **placeholders**
> for the client to verify — every figure is editable via `/admin` (no deploys
> needed for content changes).

---

## Quick start (zero config)

```bash
# 1. Backend — http://localhost:5000
cd server && npm install && npm run dev

# 2. Frontend — http://localhost:5173 (proxies /api and /uploads to :5000)
cd client && npm install && npm run dev
```

Without `MONGODB_URI` the API runs on a built-in **in-memory store** pre-seeded
with the full catalogue — perfect for demos; data resets on restart.

## Production mode (MongoDB Atlas)

```bash
cd server
cp .env.example .env        # set MONGODB_URI, JWT_SECRET, SMTP*, CLIENT_ORIGIN
npm run seed                # upserts admin + all site content into Mongo
npm start
```

Dev admin credentials (change in production): `admin@shaktitextiles.com` / `ChangeMe!2026`
The admin UI lives at `/admin` and is intentionally **not linked** from public navigation.

---

## Architecture

```
├── client/                    React 18 + Vite + Tailwind (strict 4-color tokens)
│   ├── src/components/        hero, stat-strip, cert-grid, product cards,
│   │                          industry explorer, timeline, testimonials,
│   │                          enquiry modal, chat widget (all reusable)
│   ├── src/pages/             Home, Products, ProductDetail, Industries,
│   │                          About, Contact, 404 + admin/*
│   ├── src/lib/api.js         TanStack Query hooks for every endpoint
│   └── tailwind.config.js     ruby / blush / crimson / bordeaux tokens
└── server/                    Node + Express REST API
    ├── src/models/            Mongoose schemas (7 collections)
    ├── src/controllers/       public / enquiry / auth / admin
    ├── src/routes/            endpoint wiring + validation + rate limits
    ├── src/middleware/        JWT auth, express-validator, multer, errors
    ├── src/services/          uniform data layer (Mongo ⇄ memory), mailer
    ├── src/store/             zero-config in-memory store
    ├── src/seed/              seed script + editable seed data
    └── uploads/               product images + certificate PDFs (multer)
```

### Design system (enforced in `tailwind.config.js` + `index.css`)

| Token | Hex | Use |
|---|---|---|
| `ruby` | `#9B111E` | eyebrows, stat numbers, links, active states, timeline circles |
| `blush` | `#FBE4E3` | light section background, dark-section text |
| `crimson` | `#D72638` | CTAs, chat bubble, badges — never large fills, never small text |
| `bordeaux` | `#3F0D12` | dark bands, footer, body text on light, hero base |

All stat numbers render with `font-variant-numeric: tabular-nums`.
Hover states darken (crimson→ruby→bordeaux); gradients appear only in hero +
closing banner.

---

## API

**Public**

| Method | Endpoint | Notes |
|---|---|---|
| GET | `/api/health` | uptime probe |
| GET | `/api/products` | `?industry=&category=&featured=&certification=&search=` |
| GET | `/api/products/:slug` | 404 handled in UI |
| GET | `/api/industries` | 3-level nested data |
| GET | `/api/stats` | homepage stat strip |
| GET | `/api/testimonials` | `?all=true` includes unfeatured |
| GET | `/api/certificates` | includes PDF URLs when uploaded |
| POST | `/api/enquiry` | rate-limited, validated, emails via Nodemailer |
| POST | `/api/contact` | rate-limited, validated |

**Admin (JWT httpOnly cookie)**

```
POST   /api/auth/login            POST /api/auth/logout     GET /api/auth/me
GET    /api/admin/enquiries       PATCH /api/admin/enquiries/:id   (status pipeline)
GET    /api/admin/products        POST /api/admin/products   (multipart image)
PATCH  /api/admin/products/:id    DELETE /api/admin/products/:id
GET    /api/admin/testimonials    POST /api/admin/testimonials
DELETE /api/admin/testimonials/:id
GET    /api/admin/stats           PATCH /api/admin/stats/:key
GET    /api/admin/certificates    PUT /api/admin/certificates/:key
POST   /api/admin/uploads/certificate   (PDF upload → returns URL)
```

All POST submissions return human-readable success/error messages; validation
errors arrive as `{ errors: [{ field, message }] }` for inline form display.

## Form UX contract

Inline validation on blur → submit disabled while POST is in flight (spinner) →
success toast + reset on 200 → friendly retry state on failure. No silent failures.

## Deployment

- **Frontend** → Vercel/Netlify (`VITE_API_URL=https://api.example.com`,
  `VITE_WHATSAPP_NUMBER=91XXXXXXXXXX`)
- **Backend** → Render/Railway (`PORT` auto-detected; set all vars from `.env.example`)
- **DB** → MongoDB Atlas (free tier suffices); run `npm run seed` once
- CORS is locked to `CLIENT_ORIGIN`; JWTs are httpOnly cookies (`sameSite=strict`,
  `secure` in production)

## Verified end-to-end

- All public endpoints + admin CRUD smoke-tested with curl (auth, validation, filters)
- Browser-tested: hero → sections, enquiry modal (blur validation, spinner,
  success toast, DB write), pre-filled product field, 3-level industry explorer,
  contact form, admin login → inbox → status change, client production build
