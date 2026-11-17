import Slot from './Slot.jsx';
import { LEFT_SLOTS, RIGHT_SLOTS, BOTTOM_SLOTS } from './config.js';

export default function Paperdoll({ level, items, prevItems, selected, onSelect }) {
  const render = (slot, align) => {
    const item = items?.[slot];
    if (slot === 'Relic' && !item) return null;
    const prev = prevItems?.[slot];
    const changed = Boolean(prevItems && item?.bis && item.bis !== prev?.bis);
    return (
      <Slot key={slot} slot={slot} item={item} changed={changed}
        selected={selected === slot} onSelect={onSelect} align={align} />
    );
  };

  return (
    <div className="paperdoll">
      <div className="col left">{LEFT_SLOTS.map((s) => render(s, 'left'))}</div>
      <div className="figure" aria-hidden="true">
        <svg viewBox="0 0 120 260" className="silhouette">
          <circle cx="60" cy="30" r="20" />
          <path d="M28 62 Q60 50 92 62 L100 140 L86 142 L80 100 L80 170 L74 250 L62 250 L60 180 L58 250 L46 250 L40 170 L40 100 L34 142 L20 140 Z" />
        </svg>
        <div className="level-badge">Level {level}</div>
      </div>
      <div className="col right">{RIGHT_SLOTS.map((s) => render(s, 'right'))}</div>
      <div className="bottom">{BOTTOM_SLOTS.map((s) => render(s, 'bottom'))}</div>
    </div>
  );
}
