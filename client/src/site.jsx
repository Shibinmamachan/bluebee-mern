import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { api, asset } from "./api";
import { GALLERY, VIDEOS, DEFAULT_IMAGES } from "./data";

const Ctx = createContext(null);
export const useSite = () => useContext(Ctx);

/* Loads admin-managed photos/videos. Falls back to the built-in content so the site is never empty. */
export function SiteProvider({ children }) {
  const [site, setSite] = useState({ slots: {}, gallery: [], videos: [] });
  const [ready, setReady] = useState(false);
  const [localVideos, setLocalVideos] = useState([]);
  const load = useCallback(() => api("/api/site").then(setSite).catch(() => {}).finally(() => setReady(true)), []);
  useEffect(() => { load(); }, [load]);

  // Before any video is added in the admin panel, show only the /public/videos files that really exist.
  useEffect(() => {
    Promise.all(VIDEOS.map((v) => fetch(v.src, { method: "HEAD" }).then((r) => (r.ok && (r.headers.get("content-type") || "").startsWith("video") ? v : null)).catch(() => null)))
      .then((list) => setLocalVideos(list.filter(Boolean).map((v) => ({ id: v.title, title: v.title, category: v.category, url: v.src, poster: v.poster }))));
  }, []);

  const value = useMemo(() => {
    const fix = (m) => ({ ...m, url: asset(m.url), poster: asset(m.poster) });
    return {
      ready, reload: load,
      slot: (key) => asset(site.slots[key]) || DEFAULT_IMAGES[key],
      custom: (key) => Boolean(site.slots[key]),
      gallery: site.gallery.length ? site.gallery.map(fix) : GALLERY.map((g) => ({ id: g.t, title: g.t, category: g.c, url: g.img })),
      videos: site.videos.length ? site.videos.map(fix) : localVideos,
    };
  }, [site, ready, load, localVideos]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/* ---------- small motion helpers ---------- */
const reduced = () => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    if (!("IntersectionObserver" in window) || reduced()) return setSeen(true);
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold, rootMargin: "0px 0px -40px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [seen, threshold]);
  return [ref, seen];
}

export function Reveal({ as: Tag = "div", delay = 0, className = "", style, children, ...rest }) {
  const [ref, seen] = useInView();
  return <Tag ref={ref} className={`rv ${seen ? "in" : ""} ${className}`} style={{ "--d": `${delay}ms`, ...style }} {...rest}>{children}</Tag>;
}

export function Counter({ to, suffix = "" }) {
  const [ref, seen] = useInView(0.5);
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!seen) return;
    if (reduced()) return setN(to);
    let raf, t0;
    const tick = (t) => {
      t0 ??= t;
      const p = Math.min((t - t0) / 1400, 1);
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, to]);
  return <span ref={ref}>{n}{suffix}</span>;
}
