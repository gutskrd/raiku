# raiku.win: upcoming page

A static pre-launch page for raiku.win. No server code, no database.

- WebGL violet backdrop with the logo's sweeping arcs (static under reduced motion)
- Animated crown emblem and a rolling countdown that flips to "The doors are open" at launch
- Vault spotlight of CS2 skins (Steam images, vector fallbacks if one fails to load)
- Discord call to action
- Easter egg: type ↑ ↑ ↓ ↓ ← → ← → B A

## Change

`public/assets/js/config.js`: launch date (`launchAt`, UTC) and Discord invite.
Skins in the vault live in `public/assets/js/items.js`.

## Deploy

```bash
npm install
npx wrangler deploy
```

The token needs *Workers Scripts: Edit* on the account and *Workers Routes: Edit*,
*DNS: Edit* and *Zone: Read* on raiku.win. Since everything is in `public/`, the
folder can also be uploaded to any static host as is.
