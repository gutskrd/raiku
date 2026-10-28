# raiku.win: upcoming page

The pre-launch page for raiku.win: CS2 cases, case battles and upgrades.

- WebGL violet nebula backdrop with the logo's sweeping arcs (static under reduced motion)
- Animated crown emblem, rolling-digit countdown that flips to a "doors are open" state at launch
- Notify-me sign-up stored in Cloudflare D1, with a honeypot and per-network rate limit
- Vault spotlight of real CS2 skins (Steam images, vector fallbacks if one fails to load)
- Discord call to action with live member and online counts
- Easter egg: type ↑ ↑ ↓ ↓ ← → ← → B A

## Change before launch

All in `public/assets/js/config.js`: launch date (`launchAt`, UTC), Discord invite,
and when to start showing the sign-up count. Skins in the vault live in
`public/assets/js/items.js`.

## Run locally

```bash
npm install
npm run dev
```

Opens on http://localhost:8787 with a local database.

## Deploy to raiku.win

The site is one Cloudflare Worker (`wrangler.toml`) that serves `public/` and the
`/api/*` routes, on the custom domains raiku.win and www.raiku.win. The raiku.win
zone must be in the Cloudflare account you deploy to.

**With GitHub Actions** (`.github/workflows/deploy.yml`, runs on push to `main` or by hand):

1. Create a Cloudflare API token with *Workers Scripts: Edit*, *D1: Edit*,
   *Workers Routes: Edit* and *Zone: DNS: Edit* for raiku.win.
2. Add repository secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.
3. Run the *Deploy to raiku.win* workflow. It creates the `raiku-notify` database
   on the first run, applies migrations and deploys.

**From your machine:**

```bash
npx wrangler login
npx wrangler d1 create raiku-notify   # paste the id into wrangler.toml
npm run deploy
```

## Read the sign-ups

```bash
npm run subscribers
```
