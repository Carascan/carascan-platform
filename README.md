# Carascan Platform (MVP)

Deployable Next.js (App Router) MVP for **Carascan**:
- Stripe Checkout → provisions a plate + slug + QR and emails a setup link
- Owner Setup page (token-based) to set caravan name, optional bio, emergency contacts, and engraving text
- Public plate page (`/p/{slug}`) with Contact + Emergency actions (masked relay)
- Admin Orders list (`/admin/orders`) protected by Basic Auth
- Laser Pack generator endpoint (SVG layout sized **60×90mm**, R3 corners, Ø4.2 hole marks, 40×40 QR in bottom half)

## 1) Supabase setup
1. Create a Supabase project.
2. In **SQL Editor**, run:
   - `supabase/schema.sql`
   - then `supabase/patch.sql`
3. In **Storage**, create buckets:
   - `qr`
   - `photos`
   - `logos`
   - `laser-packs` (optional)

## 2) Stripe setup
1. Create a product + price in Stripe (AUD).
2. Copy the **Price ID** to `STRIPE_PRICE_ID`.
3. Create a webhook endpoint in Stripe:
   - `https://YOURDOMAIN/api/stripe/webhook`
   - Events: `checkout.session.completed`
4. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`.

## 3) Email + SMS setup
- Email uses Resend.
- SMS uses Twilio (default).

## 4) Deploy on Vercel
1. Push this repo to GitHub.
2. In Vercel: **New Project → Import**
3. Add environment variables (see `.env.example`)
4. Deploy.
5. Connect your GoDaddy domain to Vercel and set `APP_BASE_URL` accordingly.

## 5) Local dev
```bash
npm install
cp .env.example .env.local
npm run dev
```

## Routes
- `/` Landing
- `/buy` Stripe Checkout
- `/order/success`
- `/setup/{token}`
- `/p/{slug}`
- `/p/{slug}/contact`
- `/p/{slug}/emergency`
- `/admin/orders`

## Plate geometry (engraving)
- Plate: **60mm W x 90mm H**, R3 corners
- Hole marks: Ø4.2 at (5,5), (55,5), (5,85), (55,85)
- QR: **40×40** at X=10..50, Y=45..85
