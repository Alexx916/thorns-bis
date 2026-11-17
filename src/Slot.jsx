const ABBR = {
  Head: 'HD', Neck: 'NK', Shoulders: 'SH', Back: 'BK', Chest: 'CH', Wrist: 'WR',
  Hands: 'HA', Waist: 'WA', Legs: 'LG', Feet: 'FT', 'Finger 1': 'R1', 'Finger 2': 'R2',
  'Trinket 1': 'T1', 'Trinket 2': 'T2', 'Main hand': 'MH', 'Off hand': 'OH', Relic: 'RL',
};

export default function Slot({ slot, item, changed, selected, onSelect, align = 'left' }) {
  const empty = !item || !item.bis;
  const conf = (item?.confidence || '').toLowerCase();
  const cls = [
    'slot',
    `align-${align}`,
    empty ? 'empty' : '',
    changed ? 'changed' : '',
    selected ? 'selected' : '',
    item?.got ? 'got' : '',
    conf ? `conf-${conf}` : '',
  ].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      className={cls}
      onClick={() => onSelect(slot)}
      onMouseEnter={() => onSelect(slot)}
      onFocus={() => onSelect(slot)}
    >
      <span className="icon" aria-hidden="true">
        {ABBR[slot] ?? slot.slice(0, 2)}
        {item?.got && <span className="tick">✓</span>}
      </span>
      <span className="text">
        <span className="slot-name">{slot}</span>
        <span className="item-name">{empty ? 'Empty' : item.bis}</span>
        {!empty && item.stats && <span className="stats">{item.stats}</span>}
        {!empty && item.thorns && <span className="badge">Thorns: {item.thorns}</span>}
      </span>
      {changed && <span className="new" title="Changed from previous level">NEW</span>}
    </button>
  );
}
