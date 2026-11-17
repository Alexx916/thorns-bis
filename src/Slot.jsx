import { iconUrl } from './wowhead.js';

const ABBR = {
  Head: 'HD', Neck: 'NK', Shoulders: 'SH', Back: 'BK', Chest: 'CH', Wrist: 'WR',
  Hands: 'HA', Waist: 'WA', Legs: 'LG', Feet: 'FT', 'Finger 1': 'R1', 'Finger 2': 'R2',
  'Trinket 1': 'T1', 'Trinket 2': 'T2', 'Main hand': 'MH', 'Off hand': 'OH', Relic: 'RL',
};

export default function Slot({ slot, view, changed, selected, onSelect, onToggleAlt, onToggleGot, align = 'left' }) {
  const { name, wh, useAlt, hasAlt, got, row, generic } = view;
  const empty = !name;
  const conf = useAlt ? '' : (row?.confidence || '').toLowerCase();
  const cls = ['slot', `align-${align}`, empty && 'empty', changed && 'changed', selected && 'selected',
    got && 'got', useAlt && 'is-alt', conf && `conf-${conf}`].filter(Boolean).join(' ');

  return (
    <div className={cls}>
      <button type="button" className="slot-main" onClick={() => onSelect(slot)} aria-pressed={selected}>
        <span className={`icon${wh ? ` q${wh.quality}` : ''}`} aria-hidden="true">
          {wh ? <img src={iconUrl(wh.icon)} alt="" loading="lazy" /> : (ABBR[slot] ?? slot.slice(0, 2))}
          {got && <span className="tick">✓</span>}
        </span>
        <span className="text">
          <span className="slot-name">{slot}{useAlt && ' · Alt'}</span>
          <span className={`item-name${wh ? ` q${wh.quality}` : ''}`}>{empty ? 'Empty' : name}</span>
          {!empty && !useAlt && row.stats && <span className="stats">{row.stats}</span>}
          {!empty && useAlt && row.altSource && <span className="stats">{row.altSource}</span>}
          {!empty && !useAlt && row.thorns && <span className="badge">Thorns: {row.thorns}</span>}
        </span>
        {changed && <span className="new" title="Changed from previous level">NEW</span>}
      </button>
      {(hasAlt || (!empty && !generic)) && (
        <div className="controls">
          {hasAlt && (
            <span className="seg" role="group" aria-label={`${slot}: BiS or alternative`}>
              <button type="button" className={!useAlt ? 'on' : ''} onClick={() => onToggleAlt(slot, false)}>BiS</button>
              <button type="button" className={useAlt ? 'on' : ''} onClick={() => onToggleAlt(slot, true)}>Alt</button>
            </span>
          )}
          {!empty && !generic && (
            <label className="got-toggle">
              <input type="checkbox" checked={got} onChange={() => onToggleGot(name)} /> Got
            </label>
          )}
        </div>
      )}
    </div>
  );
}
