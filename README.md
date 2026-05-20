# SmallHome · 小家装修指南

> Bilingual (zh/en) small home renovation guide — design inspiration, budget tools, and curated articles for compact living spaces.

Built with **Astro 5**, deployed on **Cloudflare Workers**, backed by **D1 + Drizzle ORM**.

---

## Features

- **Content hub** — 60+ articles on small-home renovation (filterable by area, room, style, budget)
- **Interactive tools** — budget calculator, material estimator
- **Gallery** — before/after comparisons with floor plans
- **User system** — register, login, favorites, article submission pipeline (draft → review → publish)
- **Full-text search** — across articles and metadata
- **i18n** — Chinese (zh) and English (en), locale-detected with proper hreflang links

## Tech Stack

| Layer | Stack |
|-------|-------|
| Framework | [Astro 5](https://astro.build) (SSR, `server` mode) |
| Adapter | `@astrojs/cloudflare` |
| Database | Cloudflare D1 + [Drizzle ORM](https://orm.drizzle.team) |
| Auth | Custom (email + verification code via Resend) |
| Domain | [smallhome.xyz](https://smallhome.xyz) |

## Getting Started

```bash
# install
npm install

# dev server (http://localhost:4321)
npm run dev

# build for production
npm run build

# preview production build
npm run preview
```

### Database

```bash
# generate schema
npm run db:generate

# apply migration to D1
npm run db:migrate

# open Drizzle Studio
npm run db:studio
```

## Project Structure

```
src/
├── components/       # Shared UI components
├── content/          # Markdown articles (zh/en)
├── i18n/             # Translation keys & utilities
│   ├── locales/      # zh.ts, en.ts
│   └── ...
├── layouts/          # Page layouts
├── lib/              # Utilities (db, auth, search, helpers)
├── pages/            # Routes (Astro pages)
│   ├── [locale]/     # Locale-prefixed pages
│   └── 404.astro     # Custom 404
└── styles/           # Global CSS
```

## Deployment

The project is deployed to Cloudflare Workers via `@astrojs/cloudflare`. The build output includes a `_worker.js` for the Workers runtime.

```bash
npm run build
npx wrangler deploy
```

## License

MIT
