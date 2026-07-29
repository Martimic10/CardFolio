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
| `User`       | Clerk-linked account, plan, Stripe ids       |
| `Card`       | Catalog entries                              |
| `CardImage`  | Uploaded photo paths under `/public/uploads` |
| `Condition`  | Grade estimate history                         |
| `PriceEntry` | Price history                                |

## Auth (Clerk)

1. Create an app at [dashboard.clerk.com](https://dashboard.clerk.com)
2. Add to `.env` / Vercel:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

`/app` and card APIs require a signed-in user. First sign-in upserts a `User` row by `clerkUserId`.

## Billing (Stripe test mode)

1. Add keys to `.env` from [Stripe test API keys](https://dashboard.stripe.com/test/apikeys):

```env
BILLING_MOCK="false"
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

2. Create Pro price IDs (or run with your secret key loaded):

```bash
npm run stripe:setup
```

Paste the printed `STRIPE_PRICE_PRO_MONTHLY` and `STRIPE_PRICE_PRO_LIFETIME` into `.env`.

3. Forward webhooks locally:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the `whsec_…` signing secret into `STRIPE_WEBHOOK_SECRET`.

4. Restart `npm run dev`, open Settings → Upgrade, and pay with test card `4242 4242 4242 4242`.

Webhook endpoint (production): `/api/webhooks/stripe`

With `BILLING_MOCK=true` (or no secret key), upgrades still apply instantly without Stripe.

```bash
npm run db:seed       # ensure user + empty catalog
npx prisma studio     # browse the DB
npx prisma migrate dev
```

On Vercel, set the same `DATABASE_URL` and `DIRECT_URL` env vars.

## Photo uploads

Uses [Cloudinary](https://cloudinary.com) (free tier). Without credentials, uploads fall back to `public/uploads/` locally.

1. Create a free account at [cloudinary.com](https://cloudinary.com)
2. From the dashboard, copy **Cloud name**, **API Key**, and **API Secret**
3. Add to `.env` and Vercel:

```env
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

4. Restart `npm run dev` / redeploy

Uploaded image URLs are stored on each `CardImage` row.

## Card auto-scan (OpenAI Vision)

Bulk import and “Scan first photo” read name, category, year, set/brand, and card number from each image.

1. Create a key at [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Add to `.env` and Vercel:

```env
OPENAI_API_KEY=sk-...
```

Uses `gpt-4o-mini` vision. Without the key, bulk still works with filename/defaults.


## Scripts

| Command           | What it does                |
|-------------------|-----------------------------|
| `npm run dev`     | Start Next.js               |
| `npm run db:seed` | Ensure user + empty catalog |
| `npm run build`   | Production build            |
