import Papa from 'papaparse';
import { SHEET_URLS } from './config.js';

const EMPTY = new Set(['', '-', 'none', 'none found']);
export const isEmpty = (v) => EMPTY.has(String(v ?? '').trim().toLowerCase());

const clean = (v) => (isEmpty(v) ? '' : String(v).trim());

export async function loadSheet() {
  for (const url of SHEET_URLS) {
    try {
      const res = await fetch(url);
      const text = await res.text();
      if (res.ok && !text.trimStart().startsWith('<')) {
        const parsed = parseCsv(text);
        if (Object.keys(parsed.byLevel).length) return parsed;
      }
    } catch {
      // try the next URL
    }
  }
  throw new Error("Couldn't load the sheet. In Google Sheets, set link sharing to 'Anyone with the link: Viewer'.");
}

export function parseCsv(text) {
  const { data } = Papa.parse(text, { skipEmptyLines: false });
  const byLevel = {};
  const notes = [];
  let inNotes = false;

  for (const row of data.slice(1)) {
    const first = String(row[0] ?? '').trim();
    if (!inNotes && /^\d+$/.test(first)) {
      const [level, slot, bis, stats, source, binding, thorns, alt, altSource, confidence, got] = row.map((c) => String(c ?? '').trim());
      (byLevel[level] ??= {})[slot] = {
        level: Number(level),
        slot,
        bis: clean(bis),
        stats: clean(stats),
        source: clean(source),
        binding: clean(binding),
        thorns: clean(thorns),
        alt: clean(alt),
        altSource: clean(altSource),
        confidence: clean(confidence),
        got: String(got).toUpperCase() === 'TRUE',
      };
    } else if (first) {
      inNotes = true;
      if (first.toUpperCase() !== 'NOTES') notes.push(first);
    }
  }
  return { byLevel, notes };
}
