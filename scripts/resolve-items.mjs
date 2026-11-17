// Resolves every item name in the sheet to a Wowhead (Forever) item id + icon.
// Writes public/items.json. Run: npm run items
// Never fails the build: if Wowhead or the sheet can't be reached, the existing file is kept.
import { readFile, writeFile } from 'node:fs/promises';
import { parseCsv } from '../src/data.js';
import { SHEET_URLS } from '../src/config.js';
import { lookupName, isGeneric } from '../src/itemName.js';

const OUT = new URL('../public/items.json', import.meta.url);
const SEARCH = 'https://www.wowhead.com/forever/search/suggestions-template?q=';

async function search(q) {
  const res = await fetch(SEARCH + encodeURIComponent(q), { headers: { 'User-Agent': 'Mozilla/5.0 thorns-bis' } });
  if (!res.ok) throw new Error(`Wowhead ${res.status}`);
  const { results = [] } = await res.json();
  return results.find((r) => r.type === 3 && r.name.toLowerCase() === q.toLowerCase());
}

async function main() {
  let existing = {};
  try { existing = JSON.parse(await readFile(OUT, 'utf8')); } catch {}

  const res = await fetch(SHEET_URLS[0]);
  const { byLevel } = parseCsv(await res.text());
  const names = new Set();
  for (const slots of Object.values(byLevel))
    for (const row of Object.values(slots))
      for (const n of [row.bis, row.alt]) if (lookupName(n) && !isGeneric(n)) names.add(lookupName(n));

  const out = {};
  const missing = [];
  for (const name of [...names].sort()) {
    try {
      // Random-suffix items ("Defender Leggings of Magic") are listed under the base name.
      const hit = (await search(name)) ?? (/ of \w+$/.test(name) ? await search(name.replace(/ of \w+$/, '')) : null);
      if (hit) out[name] = { id: hit.id, icon: hit.icon, quality: hit.quality };
      else missing.push(name);
    } catch (e) {
      if (existing[name]) out[name] = existing[name];
      else missing.push(name);
    }
  }
  await writeFile(OUT, JSON.stringify(out, null, 1) + '\n');
  console.log(`items.json: ${Object.keys(out).length}/${names.size} resolved`);
  if (missing.length) console.log('Not on Wowhead:', missing.join(', '));
}

main().catch((e) => console.warn('resolve-items skipped:', e.message));
