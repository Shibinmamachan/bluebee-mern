import { useState } from "react";
import { iso } from "./api";

export default function Calendar({ taken, selected, onSelect }) {
  const [m, setM] = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const y = m.getFullYear(), mo = m.getMonth(), today = iso(new Date());
  const cells = [];
  for (let i = 0; i < new Date(y, mo, 1).getDay(); i++) cells.push(<span key={"e" + i} className="d em" />);
  for (let d = 1; d <= new Date(y, mo + 1, 0).getDate(); d++) {
    const k = iso(new Date(y, mo, d)), st = taken[k];
    const cls = k < today ? "past" : st === "approved" ? "bo" : st === "pending" ? "pe" : "av";
    cells.push(<button key={k} className={`d ${cls} ${k === selected ? "sel" : ""}`} disabled={cls !== "av"} onClick={() => onSelect(k)}>{d}</button>);
  }
  return (
    <div className="card">
      <div className="cal-h">
        <button onClick={() => setM(new Date(y, mo - 1, 1))}>‹</button>
        <b>{m.toLocaleString("en", { month: "long", year: "numeric" })}</b>
        <button onClick={() => setM(new Date(y, mo + 1, 1))}>›</button>
      </div>
      <div className="cal">{[..."SMTWTFS"].map((c, i) => <b key={i}>{c}</b>)}{cells}</div>
      <div className="lg">
        <span><i style={{ background: "#86efac" }} />Available</span>
        <span><i style={{ background: "#fde68a" }} />Awaiting approval</span>
        <span><i style={{ background: "#fca5a5" }} />Booked</span>
      </div>
    </div>
  );
}
