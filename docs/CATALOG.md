# Product catalog & images

## Where the shop gets products

1. **Supabase** `products` table (primary when `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` are set in `.env.local`)
2. **Fallback** — `data/store.json` + `lib/seed-data.ts` for any slug missing in Supabase

Rows with `hidden: true` do not appear on `/shop`.

## Image sources (in order)

1. `image_url` on the product row (usually Supabase Storage: `product-images` bucket)
2. Slug fallback map in `lib/product-image.ts`
3. `/images/vial-placeholder.svg` (generic vial)

## Why an image might not work

| Cause | What you see | Fix |
|--------|----------------|-----|
| **Broken `image_url`** — file removed or wrong filename in DB | Broken image or placeholder | Re-upload in **Admin → Products**, or run `npm run catalog:sync` |
| **No upload yet** — `image_url` empty | Placeholder vial | Upload product image in admin |
| **Supabase env not saved** — `.env.local` empty on disk | Old 9-product local list, wrong data | Save `.env.local` and restart `npm run dev` |
| **Product hidden** | Missing from shop | Admin → uncheck **Hidden**, or `npm run catalog:sync` |
| **Wrong photo** — URL works but file is incorrect | Wrong vial on card | Upload the correct image in admin (replaces storage path) |

## Commands

```bash
# Preview category/image/hidden fixes
npm run catalog:audit

# Apply repairs (categories, unhide, image_url from storage)
npm run catalog:sync
```

After changing products in Supabase or admin, restart the dev server if the shop looks stale.

## Vercel / production

Copy the same Supabase variables to **Vercel → Project → Environment Variables**. Ensure the `product-images` bucket is **public** in Supabase Storage.
