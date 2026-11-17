import { LEVELS } from './config.js';
import { findItem, iconUrl } from './wowhead.js';

const TYPE_LABEL = { dungeon: 'Dungeon', quest: 'Quest', craft: 'Craft', vendor: 'Vendor', world: 'World', auction: 'Auction House' };

// Items that appear in this level's list but were first listed at an earlier level.
function carryOver(level, byLevel, isGot) {
  const out = [];
  const earlier = LEVELS.filter((l) => l < level);
  for (const row of Object.values(byLevel[level] || {})) {
    if (!row.bis || isGot(row.bis) || /^any\b/i.test(row.bis)) continue;
    const first = earlier.find((l) => Object.values(byLevel[l] || {}).some((r) => r.bis === row.bis || r.alt === row.bis));
    if (first) out.push({ ...row, firstLevel: first });
  }
  return out;
}

function ItemChip({ it, items, isGot, onToggleGot, onSelectSlot }) {
  const wh = findItem(items, it.name);
  const got = isGot(it.name);
  const optional = it.kind === 'alt';
  return (
    <li className={`chip${got ? ' got' : ''}${optional ? ' optional' : ''}`}>
      <label className="chip-check" title={got ? 'Mark as not got' : 'Mark as got'}>
        <input type="checkbox" checked={got} onChange={() => onToggleGot(it.name)} />
      </label>
      {wh && <img src={iconUrl(wh.icon, 'small')} alt="" />}
      <button type="button" className={`chip-name${wh ? ` q${wh.quality}` : ''}`} onClick={() => onSelectSlot(it.slot)}>
        {it.name}
      </button>
      <span className="chip-slot">{it.slot}{optional ? ' · optional alt' : ''}</span>
    </li>
  );
}

export default function RoutePlan({ level, route, routesLoaded, byLevel, items, isGot, onToggleGot, onSelectSlot, onJumpLevel }) {
  const carried = carryOver(level, byLevel, isGot);

  if (!route) {
    return (
      <section className="route">
        <h2>Route to level {level} gear</h2>
        <p className="muted">{routesLoaded ? 'No route written for this level yet.' : 'Loading route…'}</p>
      </section>
    );
  }

  // Only BiS items count toward progress; alternatives are always optional.
  const steps = route.steps.map((step) => {
    const required = step.items.filter((i) => i.kind !== 'alt');
    const optional = required.length === 0 && step.items.length > 0;
    const done = required.length > 0 ? required.every((i) => isGot(i.name)) : step.items.length > 0 && step.items.every((i) => isGot(i.name));
    return { ...step, required, optional, done };
  });
  const allRequired = steps.flatMap((s) => s.required);
  const gotCount = allRequired.filter((i) => isGot(i.name)).length;
  const nextIdx = steps.findIndex((s) => !s.done && !s.optional && s.required.length > 0);

  return (
    <section className="route">
      <div className="route-head">
        <h2>Route to level {level} gear</h2>
        <span className="progress">{gotCount}/{allRequired.length} BiS collected</span>
      </div>
      <div className="bar"><span style={{ width: `${allRequired.length ? (gotCount / allRequired.length) * 100 : 0}%` }} /></div>
      {route.summary && <p className="route-summary">{route.summary}</p>}

      {carried.length > 0 && (
        <div className="carry">
          <h3>Still missing from earlier levels</h3>
          <ul>
            {carried.map((r) => (
              <li key={r.slot}>
                <button type="button" className="linkish" onClick={() => onSelectSlot(r.slot)}>{r.bis}</button>
                <span className="muted"> ({r.slot})</span> · see{' '}
                <button type="button" className="linkish" onClick={() => onJumpLevel(r.firstLevel)}>level {r.firstLevel} route</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ol className="steps">
        {steps.map((step, i) => (
          <li key={i} className={`step${step.done ? ' done' : ''}${i === nextIdx ? ' next' : ''}${step.optional ? ' opt' : ''}`}>
            <div className="step-head">
              <span className="step-num">{step.done ? '✓' : i + 1}</span>
              <div className="step-title">
                <strong>{step.title}</strong>
                <span className="muted">
                  {[TYPE_LABEL[step.type] || step.type, step.zone].filter(Boolean).join(' · ')}
                  {step.optional && ' · optional'}
                </span>
              </div>
              {i === nextIdx && <span className="next-tag">Next</span>}
            </div>
            {!step.done && <p className="step-do">{step.do}</p>}
            {step.items.length > 0 && (
              <ul className="chips">
                {step.items.map((it) => (
                  <ItemChip key={it.name + it.slot} it={it} items={items} isGot={isGot}
                    onToggleGot={onToggleGot} onSelectSlot={onSelectSlot} />
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>

      {route.notes?.length > 0 && (
        <details className="route-notes">
          <summary>Caveats ({route.notes.length})</summary>
          <ul>{route.notes.map((n, i) => <li key={i}>{n}</li>)}</ul>
        </details>
      )}
    </section>
  );
}
