// Hand-drawn weapon silhouettes and skin paints. Everything is vector, so the
// page ships no Valve artwork and every item recolours from one gradient.

export const SHAPES = {
  ak: {
    vb: '0 0 240 84',
    body: `<path fill-rule="evenodd" d="M4 33 L62 29 L128 29 L131 25 L146 25 L150 29 L196 29 L204 31 L206 22 L209 22 L211 31 L228 32 L228 30 L238 30 L238 37 L228 37 L228 36 L206 36 L196 37 L190 38 L186 44 L140 44 L136 40 L124 40 Q126 62 140 77 L124 82 Q111 62 108 40 L98 40 L97 48 L84 48 L82 41 L80 41 L72 66 L61 64 L67 41 L62 42 L6 58 L2 56 L2 36 Z M95 41.5 L94.5 46 L86 46 L85 41.5 Z"/>`,
  },
  m4: {
    vb: '0 0 240 84',
    body: `<path fill-rule="evenodd" d="M6 28 L14 28 L18 31 L48 31 L54 29 L56 26 L128 26 L130 30 L180 30 L184 16 L188 16 L192 33 L226 34 L226 32 L238 32 L238 40 L226 40 L226 38 L192 38 L187 43 L130 43 L124 42 Q124 60 129 74 L114 77 Q110 58 108 42 L100 42 L99 50 L86 50 L84 43 L84 43 L76 66 L65 64 L72 42 L56 42 L51 40 L40 44 L9 58 L5 57 L5 30 Z M97 43.5 L96.5 48 L88 48 L87 43.5 Z"/>`,
  },
  awp: {
    vb: '0 0 240 84',
    body: `<path fill-rule="evenodd" d="M4 30 L60 32 L132 32 L134 33 L226 34 L226 32 L238 32 L238 42 L226 42 L226 40 L162 41 L158 47 L113 48 L112 60 L100 60 L100 48 L92 48 L91 55 L78 55 L76 47 L70 47 L66 66 L52 66 L50 58 L8 64 L3 63 Z M14 40 L52 41 L55 46 L49 54 L14 57 Z M89 49 L88.5 53 L80 53 L79.5 49 Z"/>
      <path d="M78 16 L92 18 L92 20 L124 20 L124 18 L140 15 L140 27 L124 25 L124 25 L92 25 L92 25 L78 27 Z M104 14 L113 14 L113 20 L104 20 Z M96 25 L101 25 L101 32 L96 32 Z M116 25 L121 25 L121 32 L116 32 Z"/>`,
  },
  deagle: {
    vb: '14 12 134 82',
    body: `<path fill-rule="evenodd" d="M20 22 L26 22 L27 18 L33 18 L34 22 L129 22 L130 18 L134 18 L135 22 L141 22 L143 26 L143 40 L118 40 L118 47 L99 48 Q98 61 89 63 L72 63 L70 50 L68 50 L57 89 L28 89 L38 47 L23 43 L20 39 Z M94 50 Q93 58 87 59 L75 59 L74 50 Z"/>`,
  },
  usp: {
    vb: '10 20 194 68',
    body: `<path fill-rule="evenodd" d="M14 26 L94 26 L94 28 L194 28 Q200 28 200 34 Q200 40 194 40 L94 40 L92 40 L86 40 L86 46 L72 47 Q71 57 64 58 L52 58 L50 48 L48 48 L40 84 L18 84 L27 46 L16 42 L14 38 Z M68 49 Q67 54 63 55 L55 55 L54 49 Z"/>`,
  },
  karambit: {
    vb: '20 4 180 88',
    body: `<path d="M45 61 Q78 46 106 44 L113 46 L116 56 L110 60 Q80 64 54 80 Z"/>
      <path d="M106 44 C 126 18, 168 8, 190 30 C 196 37, 196 47, 191 55 C 186 42, 170 32, 150 33 C 136 34, 124 44, 116 56 L 113 46 Z"/>
      <circle cx="38" cy="71" r="12" fill="none" stroke-width="7"/>`,
  },
  bayonet: {
    vb: '0 0 230 80',
    body: `<path fill-rule="evenodd" d="M8 42 Q8 36 14 35 L84 35 L88 26 L95 26 L95 35 L170 35 L205 30 L224 37 L212 42 Q190 53 150 54 L95 54 L95 62 L88 62 L84 54 L14 54 Q8 53 8 47 Z M22 41 L34 41 L34 48 L22 48 Z"/>`,
  },
  butterfly: {
    vb: '0 0 230 80',
    body: `<path fill-rule="evenodd" d="M6 33 L96 33 L100 30 L104 30 L104 49 L100 49 L96 46 L6 46 Q2 46 2 42 L2 37 Q2 33 6 33 Z M14 37 L80 37 L80 42 L14 42 Z M104 34 L178 34 L222 38 L178 46 L104 46 Z"/>
      <path d="M6 48 L94 48 L94 52 L6 52 Z"/>`,
  },
  gloves: {
    vb: '0 0 170 120',
    body: `<path d="M48 112 L50 94 L44 88 L40 60 Q38 50 44 46 L44 18 Q44 11 51 11 Q57 11 58 18 L59 40 L61 40 L62 9 Q62 2 69 2 Q76 2 76 9 L76 40 L78 40 L80 12 Q80 5 87 5 Q94 5 94 12 L93 42 L95 43 L98 22 Q99 15 105 15 Q112 16 111 23 L106 62 L120 46 Q126 40 132 44 Q137 49 132 55 L112 84 L108 94 L110 112 Z"/>
      <path d="M50 96 L108 96 L108 100 L50 100 Z" fill-opacity=".35"/>`,
  },
};

// Skin paints: [angle, [stop%, colour], ...]. Hard stops (two colours on the
// same percentage) give the graphic, band-painted look most skins have.
export const PAINTS = {
  dlore:     [20, [0,'#efd99a'],[38,'#cfa257'],[52,'#5b8a46'],[64,'#2d4a2a'],[78,'#c99a4b'],[100,'#f2deaa']],
  howl:      [25, [0,'#ffb347'],[30,'#ff5a1f'],[62,'#c3161c'],[100,'#5a0b0b']],
  fade:      [0,  [0,'#ffd84a'],[35,'#ff8bb8'],[65,'#c063ff'],[100,'#6d3df5']],
  sapphire:  [15, [0,'#0b1fb8'],[40,'#1f5dff'],[75,'#4fb2ff'],[100,'#b8e8ff']],
  marble:    [10, [0,'#ffe066'],[28,'#ff7a2f'],[50,'#e11d48'],[72,'#7c3aed'],[100,'#2f6bff']],
  pandora:   [30, [0,'#1b0638'],[35,'#5b17c9'],[60,'#9b5cff'],[80,'#e5c7ff'],[100,'#2a0a55']],
  serpent:   [15, [0,'#2f4a20'],[35,'#7e9e3c'],[55,'#e0853a'],[75,'#a3301c'],[100,'#2f4a20']],
  asiimov:   [35, [0,'#ffffff'],[54,'#e8e8e8'],[54,'#141414'],[62,'#141414'],[62,'#ff7a1a'],[100,'#ff9a3c']],
  printstream:[25,[0,'#ffffff'],[46,'#d8d8de'],[46,'#0c0c10'],[100,'#2b2b33']],
  vulcan:    [30, [0,'#eef4ff'],[34,'#c9dcff'],[34,'#1d5ad6'],[60,'#1d5ad6'],[60,'#0b1022'],[100,'#141b33']],
  killconf:  [30, [0,'#f3e9da'],[40,'#d6c4aa'],[40,'#8b1a1a'],[68,'#5e0f0f'],[68,'#151515'],[100,'#262626']],
  redline:   [90, [0,'#141414'],[44,'#1c1c1c'],[44,'#d21f2b'],[54,'#d21f2b'],[54,'#141414'],[100,'#0d0d0d']],
  blaze:     [0,  [0,'#121212'],[38,'#1a1a1a'],[55,'#ff4d00'],[80,'#ff9500'],[100,'#ffd400']],
  hyper:     [20, [0,'#10b981'],[30,'#f43f5e'],[60,'#6366f1'],[85,'#facc15'],[100,'#10b981']],
};

export function spriteMarkup() {
  const symbols = Object.entries(SHAPES).map(([id, s]) =>
    `<symbol id="w-${id}" viewBox="${s.vb}">${s.body}</symbol>`).join('');
  const paints = Object.entries(PAINTS).map(([id, [angle, ...stops]]) => {
    const rad = (angle * Math.PI) / 180;
    const x = Math.cos(rad) / 2, y = Math.sin(rad) / 2;
    const st = stops.map(([o, c]) => `<stop offset="${o}%" stop-color="${c}"/>`).join('');
    return `<linearGradient id="p-${id}" x1="${0.5 - x}" y1="${0.5 - y}" x2="${0.5 + x}" y2="${0.5 + y}">${st}</linearGradient>`;
  }).join('');
  const gloss = `<linearGradient id="gloss" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".45" stop-color="#fff" stop-opacity=".06"/><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></linearGradient>`;
  return `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>${paints}${gloss}${symbols}</defs></svg>`;
}

export function weaponSvg(shape, paint, cls = 'weapon') {
  const vb = SHAPES[shape].vb;
  return `<svg class="${cls}" viewBox="${vb}" aria-hidden="true" focusable="false">` +
    `<use href="#w-${shape}" fill="url(#p-${paint})" stroke="url(#p-${paint})"/>` +
    `<use href="#w-${shape}" fill="url(#gloss)" stroke="url(#gloss)"/></svg>`;
}
