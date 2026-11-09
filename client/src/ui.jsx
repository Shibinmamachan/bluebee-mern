import { useEffect, useRef, useState } from "react";

const I = ({ d, size = 20, fill, children, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill ? "currentColor" : "none"} stroke={fill ? "none" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>{d ? <path d={d} /> : children}</svg>
);
export const IconPlay = (p) => <I fill d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" {...p} />;
export const IconClose = (p) => <I d="M6 6l12 12M18 6L6 18" {...p} />;
export const IconPrev = (p) => <I d="M15 5l-7 7 7 7" {...p} />;
export const IconNext = (p) => <I d="M9 5l7 7-7 7" {...p} />;
export const IconArrow = (p) => <I d="M5 12h14M13 6l6 6-6 6" {...p} />;
export const IconWA = (p) => <I fill {...p}><path d="M12.04 2a9.9 9.9 0 0 0-8.5 15L2 22l5.15-1.5A9.9 9.9 0 1 0 12.04 2Zm5.8 14.1c-.25.7-1.45 1.33-2 1.4-.52.07-1.17.1-1.9-.12a17 17 0 0 1-1.72-.64c-3-1.3-4.95-4.33-5.1-4.53-.15-.2-1.22-1.62-1.22-3.1s.77-2.2 1.05-2.5c.27-.3.6-.37.8-.37h.58c.18 0 .43-.07.67.52.25.6.85 2.07.92 2.22.07.15.12.32.02.52-.1.2-.15.32-.3.5l-.45.52c-.15.15-.3.3-.13.6.17.3.77 1.27 1.65 2.05 1.13 1 2.1 1.32 2.4 1.47.3.15.47.12.65-.07.17-.2.75-.87.95-1.17.2-.3.4-.25.67-.15.27.1 1.72.82 2.02.97.3.15.5.22.57.35.07.12.07.72-.18 1.4Z" /></I>;
export const IconMenu = ({ open, ...p }) => <I {...p}>{open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}</I>;

export const HexMark = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true"><polygon points="25,6 75,6 100,50 75,94 25,94 0,50" fill="#ffbe0b" /><path d="M30 38h40M26 52h48M32 66h36" stroke="#0a1e4a" strokeWidth="9" strokeLinecap="round" /></svg>
);

/* Full-screen modal shell: Esc closes, scroll locked, focus moved inside. */
export function Modal({ onClose, children, className = "", label }) {
  const box = useRef(null);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    box.current?.focus();
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [onClose]);
  return (
    <div className={`modal ${className}`} role="dialog" aria-modal="true" aria-label={label} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" ref={box} tabIndex={-1}>{children}</div>
    </div>
  );
}

export function Lightbox({ items, index, setIndex, onClose }) {
  const it = items[index];
  const go = (d) => setIndex((index + d + items.length) % items.length);
  const touch = useRef(0);
  useEffect(() => {
    const onKey = (e) => { if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
  if (!it) return null;
  return (
    <Modal onClose={onClose} className="lb" label={it.title}>
      <figure onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
        onTouchEnd={(e) => { const dx = e.changedTouches[0].clientX - touch.current; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); }}>
        <img key={it.url} src={it.url} alt={it.title} />
        <figcaption><b>{it.title}</b><span>{it.category} · {index + 1} / {items.length}</span></figcaption>
      </figure>
      <button className="lb-x" onClick={onClose} aria-label="Close"><IconClose /></button>
      {items.length > 1 && <>
        <button className="lb-n prev" onClick={() => go(-1)} aria-label="Previous photo"><IconPrev /></button>
        <button className="lb-n next" onClick={() => go(1)} aria-label="Next photo"><IconNext /></button>
      </>}
    </Modal>
  );
}

export function VideoModal({ video, onClose }) {
  const [bad, setBad] = useState(false);
  return (
    <Modal onClose={onClose} className="vm" label={video.title}>
      {bad ? <div className="vm-bad">This video could not be played.</div>
        : <video src={video.url} poster={video.poster} controls autoPlay playsInline onError={() => setBad(true)} />}
      <div className="vm-cap"><b>{video.title}</b><span>{video.category}</span></div>
      <button className="lb-x" onClick={onClose} aria-label="Close video"><IconClose /></button>
    </Modal>
  );
}
