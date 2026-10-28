// Everything you are likely to change before launch lives here.
export const CONFIG = {
  // Launch moment, in UTC. The countdown and the "we're live" state read this.
  launchAt: '2026-12-12T18:00:00Z',
  // Where the "Enter raiku.win" button points once the countdown hits zero.
  liveUrl: 'https://raiku.win',
  // Notify-me endpoint (served by worker/index.js). Set to '' to hide the form.
  notifyEndpoint: '/api/notify',
  // Only show "N players in line" once the list is at least this long.
  showCountFrom: 100,
  // Discord invite used by every Discord button.
  discordUrl: 'https://discord.gg/U9ms8sXgRf',
  // Live member counts (served by worker/index.js). Set to '' to hide them.
  discordStatsEndpoint: '/api/discord',
  // Seconds each skin stays in the vault spotlight.
  spotlightSeconds: 5,
};
