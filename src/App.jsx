import { useEffect, useState } from 'react';
import Paperdoll from './Paperdoll.jsx';
import { loadSheet } from './data.js';
import { LEVELS, SHEET_VIEW_URL } from './config.js';

const wowhead = (name) => `https://www.wowhead.com/classic/search?q=${encodeURIComponent(name.split(' + ')[0])}`;

function Details({ item, slot }) {
  if (!item || !item.bis) {
    return <aside className="details"><h2>{slot || 'Select a slot'}</h2><p className="muted">No BiS item listed.</p></aside>;
  }
  const rows = [
    ['Stats', item.stats],
    ['Source', item.source],
    ['Binding / BS', item.binding],
    ['Thorns', item.thorns],
    ['Confidence', item.confidence],
    ['Got it', item.got ? 'Yes' : 'No'],
  ].filter(([, v]) => v);
  return (
    <aside className="details">
      <div className="slot-name">{item.slot} · Level {item.level}</div>
      <h2><a href={wowhead(item.bis)} target="_blank" rel="noreferrer">{item.bis}</a></h2>
      <dl>{rows.map(([k, v]) => (<div key={k}><dt>{k}</dt><dd>{v}</dd></div>))}</dl>
      {item.alt && (
        <div className="alt">
          <div className="slot-name">Best alternative</div>
          <a href={wowhead(item.alt)} target="_blank" rel="noreferrer">{item.alt}</a>
          {item.altSource && <div className="muted">{item.altSource}</div>}
        </div>
      )}
    </aside>
  );
}

export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState('Head');

  useEffect(() => {
    loadSheet().then(setData).catch((e) => setError(e.message));
  }, []);

  const level = LEVELS[idx];
  const items = data?.byLevel[level];
  const prevItems = idx > 0 ? data?.byLevel[LEVELS[idx - 1]] : null;

  return (
    <div className="app">
      <header>
        <h1>Thorns Paladin · Levelling BiS</h1>
        <p className="muted">Live from the <a href={SHEET_VIEW_URL} target="_blank" rel="noreferrer">Thorns Gear</a> sheet</p>
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
          <Paperdoll level={level} items={items} prevItems={prevItems} selected={selected} onSelect={setSelected} />
          <Details item={items?.[selected]} slot={selected} />
        </main>
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
      </div>
    </div>
  );
}
