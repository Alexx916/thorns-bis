import { useCallback, useEffect, useMemo, useState } from 'react';
import Paperdoll from './Paperdoll.jsx';
import { loadSheet } from './data.js';
import { LEVELS, SHEET_VIEW_URL } from './config.js';
import { loadItems, findItem, iconUrl, itemUrl, loadTooltip } from './wowhead.js';
import { isGeneric, genericListUrl } from './itemName.js';
import { useStored } from './storage.js';
import RoutePlan from './RoutePlan.jsx';

// What a slot currently shows, after applying the BiS/Alt toggle and Got state.
function buildViews(rows, level, items, altChoice, isGot) {
  const views = {};
  for (const [slot, row] of Object.entries(rows || {})) {
    const hasAlt = Boolean(row.bis && row.alt);
    const useAlt = hasAlt && Boolean(altChoice[`${level}|${slot}`]);
    const name = useAlt ? row.alt : row.bis;
    const generic = isGeneric(name);
    const got = !generic && name ? isGot(name) : false;
    views[slot] = { row, name, useAlt, hasAlt, generic, got, wh: generic ? null : findItem(items, name) };
  }
  return views;
}

function Tooltip({ id }) {
  const [html, setHtml] = useState(undefined);
  useEffect(() => {
    let live = true;
    setHtml(undefined);
    loadTooltip(id).then((h) => live && setHtml(h));
    return () => { live = false; };
  }, [id]);
  if (html === undefined) return <p className="muted">Loading Wowhead tooltip…</p>;
  if (!html) return <p className="muted">Couldn't load the Wowhead tooltip.</p>;
  return <div className="wh-tooltip" dangerouslySetInnerHTML={{ __html: html }} />;
}

function Details({ view, slot, level }) {
  if (!view || !view.name) {
    return <aside className="details"><div className="slot-name">{slot}</div><h2>Empty</h2><p className="muted">No item listed for this level.</p></aside>;
  }
  const { row, name, useAlt, wh, got, generic } = view;
  const link = generic ? genericListUrl(name) : itemUrl(wh, name);
  const rows = useAlt
    ? [['Source', row.altSource], ['Instead of', row.bis]]
    : [['Stats (sheet)', row.stats], ['Source', row.source], ['Binding / BS', row.binding], ['Thorns', row.thorns], ['Confidence', row.confidence]];

  return (
    <aside className="details">
      <div className="slot-name">{slot} · Level {level}{useAlt ? ' · Alternative' : ' · BiS'}{got ? ' · Got ✓' : ''}</div>
      <div className="details-head">
        {wh && <img className={`big-icon q${wh.quality}`} src={iconUrl(wh.icon, 'large')} alt="" />}
        <h2 className={wh ? `q${wh.quality}` : ''}>{name}</h2>
      </div>
      {wh && <Tooltip id={wh.id} />}
      {!wh && !generic && <p className="muted">Not found on Wowhead.</p>}
      {generic && <p className="muted">Any item that fits this description.</p>}
      <dl>{rows.filter(([, v]) => v).map(([k, v]) => (<div key={k}><dt>{k}</dt><dd>{v}</dd></div>))}</dl>
      {!useAlt && row.alt && (
        <div className="alt">
          <div className="slot-name">Best alternative</div>
          <div>{row.alt}</div>
          {row.altSource && <div className="muted">{row.altSource}</div>}
        </div>
      )}
      {link && (
        <a className="wh-link" href={link} target="_blank" rel="noreferrer">
          {wh ? 'Open on Wowhead ↗' : generic ? 'Browse on Wowhead ↗' : 'Search Wowhead ↗'}
        </a>
      )}
    </aside>
  );
}

export default function App() {
  const [data, setData] = useState(null);
  const [items, setItems] = useState({});
  const [error, setError] = useState('');
  const [idx, setIdx] = useStored('thorns-bis:level', 0);
  const [selected, setSelected] = useState('Head');
  const [altChoice, setAltChoice] = useStored('thorns-bis:alt', {});
  const [gotMap, setGotMap] = useStored('thorns-bis:got', {});

  useEffect(() => {
    loadSheet().then(setData).catch((e) => setError(e.message));
    loadItems().then(setItems);
  }, []);

  const [routes, setRoutes] = useState(null);
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}routes.json`).then((r) => (r.ok ? r.json() : null)).then(setRoutes).catch(() => setRoutes(null));
  }, []);

  // Got = your browser's choice if you've clicked it, otherwise the sheet's Got column.
  const sheetGot = useMemo(() => {
    const set = new Set();
    for (const slots of Object.values(data?.byLevel || {}))
      for (const row of Object.values(slots)) if (row.got && row.bis) set.add(row.bis);
    return set;
  }, [data]);
  const isGot = useCallback((name) => gotMap[name] ?? sheetGot.has(name), [gotMap, sheetGot]);

  const level = LEVELS[idx] ?? LEVELS[0];
  const views = useMemo(() => buildViews(data?.byLevel[level], level, items, altChoice, isGot), [data, level, items, altChoice, isGot]);
  const prevViews = useMemo(
    () => (idx > 0 ? buildViews(data?.byLevel[LEVELS[idx - 1]], LEVELS[idx - 1], items, altChoice, isGot) : null),
    [data, idx, items, altChoice, isGot],
  );

  const toggleAlt = (slot, on) => setAltChoice((m) => {
    const next = { ...m };
    if (on) next[`${level}|${slot}`] = true; else delete next[`${level}|${slot}`];
    return next;
  });
  const toggleGot = (name) => setGotMap((m) => ({ ...m, [name]: !isGot(name) }));

  return (
    <div className="app">
      <header>
        <h1>Thorns Paladin · Levelling BiS</h1>
        <p className="muted">Live from the <a href={SHEET_VIEW_URL} target="_blank" rel="noreferrer">Thorns Gear</a> sheet · item data from Wowhead (Forever)</p>
      </header>

      <section className="slider">
        <input
          type="range" min={0} max={LEVELS.length - 1} step={1} value={idx}
          onChange={(e) => setIdx(Number(e.target.value))}
          aria-label="Character level" aria-valuetext={`Level ${level}`}
        />
        <div className="ticks">
          {LEVELS.map((l, i) => (
            <button key={l} type="button" className={i === idx ? 'active' : ''} onClick={() => setIdx(i)}>{l}</button>
          ))}
        </div>
      </section>

      {error && <div className="error">{error}</div>}
      {!data && !error && <div className="muted loading">Loading sheet…</div>}

      {data && (
        <main className="layout">
          <Paperdoll level={level} views={views} prevViews={prevViews} selected={selected}
            onSelect={setSelected} onToggleAlt={toggleAlt} onToggleGot={toggleGot} />
          <Details view={views[selected]} slot={selected} level={level} />
        </main>
      )}

      {data && (
        <RoutePlan level={level} route={routes?.[level]} routesLoaded={routes !== null}
          byLevel={data.byLevel} items={items} isGot={isGot} onToggleGot={toggleGot}
          onSelectSlot={setSelected} onJumpLevel={(l) => setIdx(LEVELS.indexOf(l))} />
      )}

      {data?.notes?.length > 0 && (
        <footer className="notes">
          <h3>Notes</h3>
          <ul>{data.notes.map((n, i) => <li key={i}>{n}</li>)}</ul>
        </footer>
      )}

      <div className="legend muted">
        <span><i className="sw conf-high" /> High confidence</span>
        <span><i className="sw conf-med" /> Med</span>
        <span><i className="sw conf-low" /> Low</span>
        <span><i className="sw changed" /> Changed since last level</span>
        <span>BiS/Alt and Got choices are saved in this browser.</span>
      </div>
    </div>
  );
}
