import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "./api";
import Calendar from "./Calendar";
import { SERVICES } from "./data";

export default function Book() {
  const [params] = useSearchParams();
  const [taken, setTaken] = useState({});
  const [date, setDate] = useState("");
  const [f, setF] = useState({ eventType: params.get("service") || SERVICES[0].name, name: "", phone: "", email: "", notes: "" });
  const [msg, setMsg] = useState({ t: "", ok: false });
  const [busy, setBusy] = useState(false);
  const load = () => api("/api/availability").then((rows) => setTaken(Object.fromEntries(rows.map((r) => [r.date, r.status])))).catch(() => {});
  useEffect(() => { load(); }, []);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    if (!date) return setMsg({ t: "Please pick an available date on the calendar.", ok: false });
    setBusy(true);
    try {
      await api("/api/bookings", { method: "POST", body: { ...f, date } });
      setMsg({ t: "Request sent! You'll get an email as soon as it's confirmed.", ok: true });
      setDate(""); setF({ ...f, name: "", phone: "", email: "", notes: "" });
    } catch (err) { setMsg({ t: err.message, ok: false }); }
    setBusy(false);
    load();
  };
  return (
    <section className="wrap">
      <h1 className="ph left">Check dates &amp; book</h1>
      <p className="sub left">Pick a green date. We confirm every request by email.</p>
      <div className="bk">
        <Calendar taken={taken} selected={date} onSelect={setDate} />
        <form className="card" onSubmit={submit}>
          <label htmlFor="b-date">Selected date</label>
          <input id="b-date" readOnly value={date ? new Date(date + "T00:00").toDateString() : ""} placeholder="Pick an available date" />
          <label htmlFor="b-type">Event type</label>
          <select id="b-type" value={f.eventType} onChange={set("eventType")}>{SERVICES.map((s) => <option key={s.slug}>{s.name}</option>)}</select>
          <label htmlFor="b-name">Your name</label><input id="b-name" required value={f.name} onChange={set("name")} autoComplete="name" />
          <label htmlFor="b-phone">Phone</label><input id="b-phone" required type="tel" value={f.phone} onChange={set("phone")} autoComplete="tel" />
          <label htmlFor="b-email">Email (for confirmation)</label><input id="b-email" required type="email" value={f.email} onChange={set("email")} autoComplete="email" />
          <label htmlFor="b-notes">Guests / notes</label><textarea id="b-notes" rows="3" value={f.notes} onChange={set("notes")} />
          <button className="btn full" disabled={busy}>{busy ? "Sending…" : "Request booking"}</button>
          <div className={`msg ${msg.ok ? "good" : "bad"}`} role="status">{msg.t}</div>
        </form>
      </div>
    </section>
  );
}
