import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "./api";
import { Modal, HexMark } from "./ui";
import { MediaManager, SiteImages } from "./AdminMedia";

const fmt = (d) => new Date(d + "T00:00").toDateString();
const today = () => new Date().toISOString().slice(0, 10);
const wa = (p) => { const n = p.replace(/\D/g, ""); return `https://wa.me/${n.length === 10 ? "91" + n : n}`; };

export default function Admin() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [cred, setCred] = useState({ email: "", password: "" });
  const [loginMsg, setLoginMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [toast, setToast] = useState(null);

  const say = useCallback((t, kind = "good") => { setToast({ t, kind, k: Date.now() }); }, []);
  useEffect(() => { if (!toast) return; const id = setTimeout(() => setToast(null), 5500); return () => clearTimeout(id); }, [toast]);

  const out = useCallback(() => { localStorage.removeItem("token"); setToken(""); }, []);
  const call = useCallback((url, opts) => api(url, opts, token), [token]);
  const fail = useCallback((e) => (e.status === 401 ? (say("Your session ended. Please log in again.", "bad"), out()) : say(e.message, "bad")), [out, say]);
  const refresh = useCallback(() => call("/api/admin/stats").then(setStats).catch(fail), [call, fail]);
  useEffect(() => { if (token) refresh(); }, [token, refresh]);

  const login = async (e) => {
    e.preventDefault(); setBusy(true);
    try { const r = await api("/api/admin/login", { method: "POST", body: cred }); localStorage.setItem("token", r.token); setToken(r.token); setLoginMsg(""); }
    catch (err) { setLoginMsg(err.message); }
    setBusy(false);
  };

  if (!token) return (
    <section className="login">
      <form className="login-card" onSubmit={login}>
        <HexMark size={44} /><h1>Admin login</h1>
        <label htmlFor="a-mail">Email</label><input id="a-mail" type="email" required autoComplete="username" value={cred.email} onChange={(e) => setCred({ ...cred, email: e.target.value })} />
        <label htmlFor="a-pass">Password</label><input id="a-pass" type="password" required autoComplete="current-password" value={cred.password} onChange={(e) => setCred({ ...cred, password: e.target.value })} />
        <button className="btn full" disabled={busy}>{busy ? "Checking…" : "Log in"}</button>
        <div className="msg bad" role="alert">{loginMsg}</div>
      </form>
    </section>
  );

  const tabs = [["overview", "Overview"], ["bookings", "Bookings", stats?.pending], ["enquiries", "Enquiries", stats?.unread], ["gallery", "Gallery photos"], ["videos", "Event videos"], ["site", "Site images"]];
  const props = { call, token, say, fail, refresh };
  return (
    <section className="adm">
      <aside>
        <div className="adm-brand"><HexMark size={22} /> Blue Bee admin</div>
        <div className="adm-tabs" role="tablist">
          {tabs.map(([k, label, n]) => (
            <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{label}{n > 0 && <span className="dot">{n}</span>}</button>
          ))}
        </div>
        <button className="adm-out" onClick={out}>Log out</button>
      </aside>
      <div className="adm-main">
        {tab === "overview" && <Overview stats={stats} go={setTab} />}
        {tab === "bookings" && <Bookings {...props} />}
        {tab === "enquiries" && <Enquiries {...props} />}
        {tab === "gallery" && <MediaManager key="g" kind="gallery" {...props} />}
        {tab === "videos" && <MediaManager key="v" kind="video" {...props} />}
        {tab === "site" && <SiteImages {...props} />}
      </div>
      {toast && <div className={`toast ${toast.kind}`} key={toast.k} role="status">{toast.t}<button onClick={() => setToast(null)} aria-label="Dismiss">×</button></div>}
    </section>
  );
}

/* ---------- Overview ---------- */
function Overview({ stats, go }) {
  if (!stats) return <p className="muted">Loading…</p>;
  const tiles = [["Awaiting your decision", stats.pending, "bookings", "pe"], ["Approved events", stats.approved, "bookings", "ok"], ["Rejected", stats.rejected, "bookings", "no"],
    ["Unread enquiries", stats.unread, "enquiries"], ["Gallery photos", stats.gallery, "gallery"], ["Event videos", stats.videos, "videos"]];
  return (
    <>
      <h1>Overview</h1>
      <div className="stat-grid">{tiles.map(([l, n, to, c]) => <button key={l} className={`stat ${c || ""}`} onClick={() => go(to)}><b>{n}</b><span>{l}</span></button>)}</div>
      <h2 className="sec">Coming up</h2>
      {stats.upcoming.length === 0 ? <p className="muted">No approved events yet.</p> : (
        <ul className="upc">{stats.upcoming.map((b) => <li key={b._id}><b>{fmt(b.date)}</b><span>{b.eventType} · {b.name}</span></li>)}</ul>
      )}
    </>
  );
}

/* ---------- Bookings: accept / reject ---------- */
function Bookings({ call, say, fail, refresh }) {
  const [list, setList] = useState(null);
  const [filter, setFilter] = useState("pending");
  const [q, setQ] = useState("");
  const [rejecting, setRejecting] = useState(null);
  const [note, setNote] = useState("");
  const [working, setWorking] = useState("");

  const load = useCallback(() => call("/api/admin/bookings").then(setList).catch(fail), [call, fail]);
  useEffect(() => { load(); }, [load]);

  const count = (s) => (list || []).filter((b) => b.status === s).length;
  const shown = useMemo(() => (list || []).filter((b) => (filter === "all" || b.status === filter) && (!q || `${b.name} ${b.email} ${b.phone} ${b.eventType}`.toLowerCase().includes(q.toLowerCase()))), [list, filter, q]);

  const decide = async (b, status, adminNote = "") => {
    setWorking(b._id);
    try {
      const r = await call(`/api/admin/bookings/${b._id}`, { method: "PATCH", body: { status, adminNote } });
      const word = status === "approved" ? "Approved" : status === "rejected" ? "Rejected" : "Moved back to pending";
      if (r.emailed === true) say(`${word}. Email sent to ${b.email}.`);
      else if (r.emailed === false) say(`${word}, but the email could not be sent. Check the SMTP settings in server/.env.`, "warn");
      else say(`${word}.`);
      setRejecting(null); setNote("");
      await Promise.all([load(), refresh()]);
    } catch (e) { fail(e); }
    setWorking("");
  };
  const remove = async (b) => {
    if (!window.confirm(`Delete the booking from ${b.name} for ${fmt(b.date)}? This frees the date and cannot be undone.`)) return;
    try { await call(`/api/admin/bookings/${b._id}`, { method: "DELETE" }); say("Booking deleted."); await Promise.all([load(), refresh()]); } catch (e) { fail(e); }
  };

  return (
    <>
      <h1>Bookings</h1>
      <div className="bar">
        <div className="pills">{[["pending", "Pending"], ["approved", "Approved"], ["rejected", "Rejected"], ["all", "All"]].map(([k, l]) => (
          <button key={k} className={filter === k ? "on" : ""} onClick={() => setFilter(k)}>{l}{k !== "all" && list ? <span className="ct">{count(k)}</span> : null}</button>))}</div>
        <input className="search" type="search" placeholder="Search name, email, phone…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search bookings" />
      </div>
      {!list ? <p className="muted">Loading…</p> : shown.length === 0 ? <p className="empty">{filter === "pending" ? "Nothing waiting for a decision." : "No bookings here."}</p> : (
        <div className="bks">{shown.map((b) => {
          const d = new Date(b.date + "T00:00"), past = b.date < today();
          return (
            <article className={`bkc ${b.status}`} key={b._id}>
              <div className="dt"><b>{d.getDate()}</b><span>{d.toLocaleString("en", { month: "short" })} {d.getFullYear()}</span><small>{d.toLocaleString("en", { weekday: "short" })}</small></div>
              <div className="bi">
                <h3>{b.name} <span className={`tag ${b.status}`}>{b.status}</span>{past && <span className="tag past">past date</span>}</h3>
                <p className="ev">{b.eventType}</p>
                <p className="ct-l"><a href={`tel:${b.phone}`}>{b.phone}</a><a href={wa(b.phone)} target="_blank" rel="noreferrer">WhatsApp</a><a href={`mailto:${b.email}`}>{b.email}</a></p>
                {b.notes && <p className="nt">“{b.notes}”</p>}
                {b.adminNote && <p className="nt">Reason given: {b.adminNote}</p>}
                <small className="muted">Requested {new Date(b.createdAt).toLocaleDateString()}</small>
              </div>
              <div className="ba">
                {b.status !== "approved" && <button className="btn sm ok" disabled={working === b._id} onClick={() => decide(b, "approved")}>Approve</button>}
                {b.status !== "rejected" && <button className="btn sm no" disabled={working === b._id} onClick={() => { setRejecting(b); setNote(""); }}>Reject</button>}
                {b.status !== "pending" && <button className="btn sm ghost-d" disabled={working === b._id} onClick={() => decide(b, "pending")}>Back to pending</button>}
                <button className="lnk" onClick={() => remove(b)}>Delete</button>
              </div>
            </article>
          );
        })}</div>
      )}
      {rejecting && (
        <Modal onClose={() => setRejecting(null)} label="Reject booking">
          <div className="dlg">
            <h2>Reject this booking?</h2>
            <p>{rejecting.name} · {rejecting.eventType} · {fmt(rejecting.date)}. The date becomes available again and the client is emailed.</p>
            <label htmlFor="rj">Reason for the client (optional)</label>
            <textarea id="rj" rows="3" maxLength="500" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. We are fully booked that weekend. Could you do the following Saturday?" />
            <div className="dlg-a"><button className="btn ghost-d" onClick={() => setRejecting(null)}>Cancel</button>
              <button className="btn no" disabled={working === rejecting._id} onClick={() => decide(rejecting, "rejected", note)}>{working === rejecting._id ? "Rejecting…" : "Reject booking"}</button></div>
          </div>
        </Modal>
      )}
    </>
  );
}

/* ---------- Enquiries ---------- */
function Enquiries({ call, say, fail, refresh }) {
  const [list, setList] = useState(null);
  const load = useCallback(() => call("/api/admin/enquiries").then(setList).catch(fail), [call, fail]);
  useEffect(() => { load(); }, [load]);
  const mark = async (q, read) => { try { await call(`/api/admin/enquiries/${q._id}`, { method: "PATCH", body: { read } }); await Promise.all([load(), refresh()]); } catch (e) { fail(e); } };
  const remove = async (q) => {
    if (!window.confirm(`Delete the enquiry from ${q.name}?`)) return;
    try { await call(`/api/admin/enquiries/${q._id}`, { method: "DELETE" }); say("Enquiry deleted."); await Promise.all([load(), refresh()]); } catch (e) { fail(e); }
  };
  return (
    <>
      <h1>Enquiries</h1>
      {!list ? <p className="muted">Loading…</p> : list.length === 0 ? <p className="empty">No enquiries yet.</p> : (
        <div className="bks">{list.map((q) => (
          <article className={`enq ${q.read ? "" : "unread"}`} key={q._id}>
            <div className="bi">
              <h3>{!q.read && <i className="udot" title="Unread" />}{q.name} <span className="tag past">{q.service}</span>{q.source === "chat" && <span className="tag chat">via AI chat</span>}</h3>
              <p className="ct-l">{q.phone && <><a href={`tel:${q.phone}`}>{q.phone}</a><a href={wa(q.phone)} target="_blank" rel="noreferrer">WhatsApp</a></>}{q.email && <a href={`mailto:${q.email}`}>{q.email}</a>}</p>
              <p className="msgtx">{q.message}</p>
              <small className="muted">{new Date(q.createdAt).toLocaleString()}</small>
            </div>
            <div className="ba">
              {q.email && <a className="btn sm" href={`mailto:${q.email}?subject=${encodeURIComponent("Re: your enquiry to Blue Bee")}`} onClick={() => !q.read && mark(q, true)}>Reply</a>}
              <button className="btn sm ghost-d" onClick={() => mark(q, !q.read)}>{q.read ? "Mark unread" : "Mark read"}</button>
              <button className="lnk" onClick={() => remove(q)}>Delete</button>
            </div>
          </article>
        ))}</div>
      )}
    </>
  );
}
