import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "./api";
import { WA_LINK } from "./data";
import { HexMark, IconClose, IconArrow } from "./ui";

const KEY = "bb-chat";
const CHIPS = ["Check a date", "What services do you offer?", "I need a quote", "Talk to a person"];
const LINKS = /(https?:\/\/[^\s)]*[^\s).,!?]|\/(?:book|contact|gallery|about|services(?:\/[a-z-]+)?)(?![\w/-]))/g;

/* Plain-text reply with clickable links and page paths. */
function Rich({ text }) {
  return text.split("\n").filter(Boolean).map((line, i) => (
    <p key={i}>{line.split(LINKS).map((part, j) => {
      if (j % 2 === 0) return part;
      return part.startsWith("/") ? <Link key={j} to={part}>{part}</Link> : <a key={j} href={part} target="_blank" rel="noreferrer">{part.replace(/^https?:\/\//, "")}</a>;
    })}</p>
  ));
}

const localWelcome = () => {
  const h = new Date().getHours();
  return `${h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : h < 21 ? "Good evening" : "Hello"}! I'm Bee, the Blue Bee assistant. How can I help with your event?`;
};

export default function Chat() {
  const saved = (() => { try { return JSON.parse(sessionStorage.getItem(KEY)) || {}; } catch { return {}; } })();
  const [open, setOpen] = useState(Boolean(saved.open));
  const [msgs, setMsgs] = useState(saved.msgs || []);
  const [cfg, setCfg] = useState({ enabled: true, open: true });
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [teaser, setTeaser] = useState(false);
  const end = useRef(null), field = useRef(null);

  useEffect(() => { try { sessionStorage.setItem(KEY, JSON.stringify({ open, msgs: msgs.slice(-40) })); } catch { /* private mode */ } }, [open, msgs]);

  // Time-aware welcome comes from the server (business time zone).
  useEffect(() => {
    api("/api/chat/config").then((c) => {
      setCfg(c);
      setMsgs((m) => (m.length ? m : [{ role: "assistant", local: true, text: c.welcome }]));
    }).catch(() => setMsgs((m) => (m.length ? m : [{ role: "assistant", local: true, text: localWelcome() }])));
  }, []);

  // One gentle nudge per visit.
  useEffect(() => {
    if (open || sessionStorage.getItem(KEY + "-t")) return;
    const id = setTimeout(() => { setTeaser(true); sessionStorage.setItem(KEY + "-t", "1"); }, 8000);
    return () => clearTimeout(id);
  }, [open]);
  useEffect(() => { if (open) { setTeaser(false); setTimeout(() => field.current?.focus(), 250); } }, [open]);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [msgs, busy, open]);
  useEffect(() => {
    if (!open) return;
    const k = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open]);

  const send = async (raw) => {
    const text = raw.trim();
    if (!text || busy) return;
    const next = [...msgs, { role: "user", text }];
    setMsgs(next); setInput(""); setBusy(true);
    try {
      const history = next.filter((m) => (m.role === "user" || m.role === "assistant") && !m.local).map((m) => ({ role: m.role, content: m.text }));
      const r = await api("/api/chat", { method: "POST", body: { messages: history } });
      setMsgs((m) => [...m, { role: "assistant", text: r.reply }, ...(r.leadSaved ? [{ role: "note", text: "Your details were sent to our team." }] : [])]);
    } catch (e) {
      setMsgs((m) => [...m, { role: "assistant", local: true, text: e.status === 429 ? "You're sending messages quite fast. Please wait a moment and try again." : `I can't reply right now. You can reach our team on WhatsApp: ${WA_LINK}` }]);
    }
    setBusy(false);
  };

  return (
    <>
      {!open && teaser && (
        <button className="chat-teaser" onClick={() => setOpen(true)}>Hi! Need help picking a date or a service?</button>
      )}
      <button className={`chat-fab ${open ? "gone" : ""}`} onClick={() => setOpen(true)} aria-label="Chat with Bee, our assistant" aria-expanded={open}>
        <HexMark size={34} /><span className="chat-pulse" />
      </button>

      <section className={`chat ${open ? "open" : ""}`} role="dialog" aria-label="Chat with Bee" aria-hidden={!open}>
        <header>
          <span className="chat-av"><HexMark size={26} /></span>
          <div><b>Bee</b><small><i className={cfg.open ? "on" : ""} />{cfg.open ? "Team online · replies instantly" : "Team offline · I'm still here"}</small></div>
          <button onClick={() => setOpen(false)} aria-label="Close chat"><IconClose size={20} /></button>
        </header>

        <div className="chat-log" aria-live="polite">
          {msgs.map((m, i) => m.role === "note"
            ? <div className="chat-note" key={i}>✓ {m.text}</div>
            : <div className={`chat-m ${m.role}`} key={i}><Rich text={m.text} /></div>)}
          {msgs.length <= 1 && !busy && <div className="chat-chips">{CHIPS.map((c) => <button key={c} onClick={() => send(c)}>{c}</button>)}</div>}
          {busy && <div className="chat-m assistant typing" aria-label="Bee is typing"><i /><i /><i /></div>}
          <div ref={end} />
        </div>

        <form onSubmit={(e) => { e.preventDefault(); send(input); }}>
          <input ref={field} value={input} onChange={(e) => setInput(e.target.value)} maxLength={600} placeholder="Type your message…" aria-label="Your message" disabled={!cfg.enabled} />
          <button disabled={busy || !input.trim()} aria-label="Send"><IconArrow size={20} /></button>
        </form>
        <small className="chat-foot">{cfg.enabled ? "AI assistant. For bookings, our team confirms by email." : "Chat is off. Please use WhatsApp or the contact form."}</small>
      </section>
    </>
  );
}
