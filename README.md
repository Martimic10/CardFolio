# Cardfolio

Personal trading card catalog — marketing site + collection app backed by **Neon Postgres** via Prisma.

## Getting started

1. Create a free project at [console.neon.tech](https://console.neon.tech)
2. Copy connection strings into `.env` (see `.env.example`):
   - **Pooled** → `DATABASE_URL` (hostname contains `-pooler`)
   - **Direct** → `DIRECT_URL` (no `-pooler`, used for migrations)
3. Then:

```bash
cp .env.example .env
# paste your Neon URLs into .env

npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

- Landing: [http://localhost:3000](http://localhost:3000)
- App: [http://localhost:3000/app](http://localhost:3000/app)

## Database

| Table        | Purpose                                      |
|--------------|----------------------------------------------|
| `User`       | App owner (single-user until auth)           |
| `Card`       | Catalog entries                              |
| `CardImage`  | Uploaded photo paths under `/public/uploads` |
| `Condition`  | Grade estimate history                         |
| `PriceEntry` | Price history                                |

```bash
npm run db:seed       # ensure user + empty catalog
npx prisma studio     # browse the DB
npx prisma migrate dev
```

On Vercel, set the same `DATABASE_URL` and `DIRECT_URL` env vars.

## Photo uploads

- **Local (no token):** files save to `public/uploads/`
- **Production:** uses [Vercel Blob](https://vercel.com/docs/storage/vercel-blob)

1. In Vercel → **Storage** → create a **Blob** store
2. Copy `BLOB_READ_WRITE_TOKEN` into Vercel env vars **and** local `.env`
3. Redeploy / restart `npm run dev`

Uploaded image URLs are stored on each `CardImage` row, so they keep working after deploy.


## Scripts

| Command           | What it does                |
|-------------------|-----------------------------|
| `npm run dev`     | Start Next.js               |
| `npm run db:seed` | Ensure user + empty catalog |
| `npm run build`   | Production build            |
