import { lookupName } from './itemName.js';

const BASE = import.meta.env.BASE_URL;
let itemsPromise;
export const loadItems = () =>
  (itemsPromise ??= fetch(`${BASE}items.json`).then((r) => (r.ok ? r.json() : {})).catch(() => ({})));

export const findItem = (items, name) => items?.[lookupName(name)];
export const iconUrl = (icon, size = 'medium') => `https://wow.zamimg.com/images/wow/icons/${size}/${icon}.jpg`;
export const itemUrl = (item, name) =>
  item ? `https://www.wowhead.com/forever/item=${item.id}` : `https://www.wowhead.com/forever/search?q=${encodeURIComponent(lookupName(name))}`;

const tooltipCache = new Map();
export function loadTooltip(id) {
  if (!tooltipCache.has(id)) {
    tooltipCache.set(id, fetch(`https://nether.wowhead.com/forever/tooltip/item/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => (d?.tooltip ? sanitize(d.tooltip) : null))
      .catch(() => null));
  }
  return tooltipCache.get(id);
}

// Wowhead's tooltip is third-party HTML: keep only layout tags and class names.
const ALLOWED = new Set(['TABLE', 'TBODY', 'TR', 'TD', 'TH', 'B', 'BR', 'SPAN', 'DIV', 'SMALL', 'I']);
function sanitize(html) {
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
  const clean = (node) => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === Node.TEXT_NODE) continue;
      if (child.nodeType !== Node.ELEMENT_NODE) { child.remove(); continue; }
      clean(child);
      if (!ALLOWED.has(child.tagName)) {
        const span = doc.createElement('span');
        if (child.tagName === 'A' && child.className) span.className = child.className;
        span.append(...child.childNodes);
        child.replaceWith(span);
        continue;
      }
      for (const attr of [...child.attributes]) if (attr.name !== 'class') child.removeAttribute(attr.name);
    }
  };
  const root = doc.body.firstChild;
  clean(root);
  return root.innerHTML;
}
