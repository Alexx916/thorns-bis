// Turns a sheet cell like "Seedcloud Buckler + Iron Shield Spike" or
// "Vile Protector (best pure AoE)" into the name to look up on Wowhead.
export function lookupName(name) {
  return String(name || '')
    .split(' + ')[0]
    .split(' / ')[0]
    .replace(/\s*\([^)]*\)/g, '')
    .trim();
}

// Sheet entries like "Any +Sta cloak" describe a kind of item, not a real one.
export const isGeneric = (name) => /^any\b/i.test(String(name || '').trim());

const GENERIC_LISTS = { cloak: 'armor/cloaks', ring: 'armor/rings', trinket: 'armor/trinkets', neck: 'armor/amulets' };
export function genericListUrl(name) {
  const key = Object.keys(GENERIC_LISTS).find((k) => new RegExp(`\\b${k}`, 'i').test(name));
  return key ? `https://www.wowhead.com/forever/items/${GENERIC_LISTS[key]}` : null;
}
