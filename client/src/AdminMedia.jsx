import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { asset, upload } from "./api";
import { SERVICES, WHY } from "./data";
import { useSite } from "./site";
import { Modal } from "./ui";

/* ---------- Gallery photos & event videos ---------- */
export function MediaManager({ kind, call, token, say, fail, refresh }) {
  const video = kind === "video";
  const site = useSite();
  const [items, setItems] = useState(null);
  const [files, setFiles] = useState([]);
  const [poster, setPoster] = useState(null);
  const [meta, setMeta] = useState({ title: "", category: "", featured: false });
  const [pct, setPct] = useState(null);
  const [editing, setEditing] = useState(null);
  const [drag, setDrag] = useState(false);
  const input = useRef(null);

  const load = useCallback(() => call(`/api/admin/media?kind=${kind}`).then(setItems).catch(fail), [call, kind, fail]);
  useEffect(() => { load(); }, [load]);
  const changed = () => Promise.all([load(), refresh(), site.reload()]);

  const previews = useMemo(() => files.map((f) => (f.type.startsWith("image/") ? URL.createObjectURL(f) : "")), [files]);
  useEffect(() => () => previews.forEach((u) => u && URL.revokeObjectURL(u)), [previews]);
  const cats = useMemo(() => [...new Set((items || []).map((i) => i.category))], [items]);

  const pick = (list) => {
    const arr = [...list].filter((f) => f.type.startsWith(video ? "video/" : "image/"));
    if (!arr.length) return say(video ? "Please choose an MP4 or WebM video." : "Please choose photos (JPG, PNG, WebP).", "bad");
    setFiles(video ? arr.slice(0, 1) : arr.slice(0, 20));
  };
  const reset = () => { setFiles([]); setPoster(null); setMeta({ title: "", category: meta.category, featured: false }); if (input.current) input.current.value = ""; };

  const add = async () => {
    const fd = new FormData();
    fd.append("kind", kind);
    files.forEach((f) => fd.append("file", f));
    if (poster) fd.append("poster", poster);
    Object.entries(meta).forEach(([k, v]) => fd.append(k, v));
    setPct(0);
    try {
      await upload("/api/admin/media", "POST", fd, token, setPct);
      say(video ? "Video added." : `${files.length} photo${files.length > 1 ? "s" : ""} added.`);
      reset(); await changed();
    } catch (e) { fail(e); }
    setPct(null);
  };

  const patch = async (it, body) => { try { await call(`/api/admin/media/${it._id}`, { method: "PATCH", body }); await changed(); } catch (e) { fail(e); } };
  const remove = async (it) => {
    if (!window.confirm(`Delete “${it.title}”? The file is removed from the website.`)) return;
    try { await call(`/api/admin/media/${it._id}`, { method: "DELETE" }); say("Deleted."); await changed(); } catch (e) { fail(e); }
  };
  const move = async (i, d) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = [...items]; [next[i], next[j]] = [next[j], next[i]];
    setItems(next);
    try { await call("/api/admin/media/reorder", { method: "POST", body: { ids: next.map((x) => x._id) } }); site.reload(); } catch (e) { fail(e); load(); }
  };

  return (
    <>
      <h1>{video ? "Event videos" : "Gallery photos"}</h1>
      <p className="muted lead-s">{video ? "Add event films. They appear on the home page and the Gallery page. MP4 (H.264) plays best on every phone." : "Add event photos. Mark your best ones as Featured and they appear on the home page first."}</p>

      <div className={`drop ${drag ? "over" : ""}`} onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files); }}>
        {files.length === 0 ? (
          <label className="drop-in">
            <input ref={input} type="file" hidden multiple={!video} accept={video ? "video/mp4,video/webm" : "image/jpeg,image/png,image/webp,image/gif,image/avif"} onChange={(e) => pick(e.target.files)} />
            <b>{video ? "Choose a video" : "Choose photos"}</b><span>or drag {video ? "it" : "them"} here{video ? " (MP4 or WebM)" : " (up to 20 at once, 15 MB each)"}</span>
          </label>
        ) : (
          <div className="stage">
            <div className="thumbs">{files.map((f, i) => <figure key={f.name + i}>{previews[i] ? <img src={previews[i]} alt="" /> : <div className="vfile">{f.name}<small>{(f.size / 1048576).toFixed(1)} MB</small></div>}</figure>)}</div>
            <div className="fields">
              <div><label htmlFor="m-t">Title {files.length > 1 && "(optional, numbered)"}</label><input id="m-t" value={meta.title} placeholder={video ? "e.g. Wedding highlights" : "Leave empty to use the file name"} onChange={(e) => setMeta({ ...meta, title: e.target.value })} /></div>
              <div><label htmlFor="m-c">Category</label><input id="m-c" list="cats" value={meta.category} placeholder="Weddings, Corporate, Stage…" onChange={(e) => setMeta({ ...meta, category: e.target.value })} /><datalist id="cats">{cats.map((c) => <option key={c} value={c} />)}</datalist></div>
              {video && <div><label htmlFor="m-p">Thumbnail (optional)</label><input id="m-p" type="file" accept="image/*" onChange={(e) => setPoster(e.target.files[0] || null)} /></div>}
              <label className="chk"><input type="checkbox" checked={meta.featured} onChange={(e) => setMeta({ ...meta, featured: e.target.checked })} /> Featured</label>
            </div>
            <div className="dlg-a">
              <button className="btn ghost-d" onClick={reset} disabled={pct !== null}>Cancel</button>
              <button className="btn" onClick={add} disabled={pct !== null}>{pct !== null ? `Uploading ${pct}%` : video ? "Upload video" : `Upload ${files.length} photo${files.length > 1 ? "s" : ""}`}</button>
            </div>
            {pct !== null && <div className="prog"><i style={{ width: `${pct}%` }} /></div>}
          </div>
        )}
      </div>

      {!items ? <p className="muted">Loading…</p> : items.length === 0 ? <p className="empty">Nothing here yet. Add your first {video ? "video" : "photo"} above.</p> : (
        <div className="mgrid">{items.map((it, i) => (
          <article className={`mi ${it.visible ? "" : "hid"}`} key={it._id}>
            <div className="mi-img">
              {video && !it.poster ? <video src={asset(it.url)} preload="metadata" muted /> : <img src={asset(video ? it.poster : it.url)} alt="" loading="lazy" />}
              <span className="mi-b">{it.featured && <em>Featured</em>}{!it.visible && <em className="h">Hidden</em>}</span>
            </div>
            <div className="mi-t"><b>{it.title}</b><small>{it.category}</small></div>
            <div className="mi-a">
              <button onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move earlier">←</button>
              <button onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Move later">→</button>
              <button onClick={() => setEditing(it)}>Edit</button>
              <button onClick={() => patch(it, { visible: !it.visible })}>{it.visible ? "Hide" : "Show"}</button>
              <button className="del" onClick={() => remove(it)}>Delete</button>
            </div>
          </article>
        ))}</div>
      )}
      {editing && <EditMedia item={editing} video={video} token={token} say={say} fail={fail} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); changed(); }} cats={cats} />}
    </>
  );
}

function EditMedia({ item, video, token, say, fail, onClose, onSaved, cats }) {
  const [f, setF] = useState({ title: item.title, category: item.category, featured: item.featured, visible: item.visible });
  const [file, setFile] = useState(null);
  const [poster, setPoster] = useState(null);
  const [pct, setPct] = useState(null);
  const save = async () => {
    const fd = new FormData();
    Object.entries(f).forEach(([k, v]) => fd.append(k, v));
    if (file) fd.append("file", file);
    if (poster) fd.append("poster", poster);
    setPct(0);
    try { await upload(`/api/admin/media/${item._id}`, "PATCH", fd, token, setPct); say("Saved."); onSaved(); }
    catch (e) { fail(e); setPct(null); }
  };
  return (
    <Modal onClose={onClose} label="Edit">
      <div className="dlg">
        <h2>Edit {video ? "video" : "photo"}</h2>
        <div className="edit-prev">{video ? <video src={asset(item.url)} poster={asset(item.poster)} controls preload="metadata" /> : <img src={file ? URL.createObjectURL(file) : asset(item.url)} alt="" />}</div>
        <label htmlFor="e-t">Title</label><input id="e-t" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
        <label htmlFor="e-c">Category</label><input id="e-c" list="cats2" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} /><datalist id="cats2">{cats.map((c) => <option key={c} value={c} />)}</datalist>
        <label htmlFor="e-f">Replace {video ? "video" : "photo"}</label>
        <input id="e-f" type="file" accept={video ? "video/mp4,video/webm" : "image/*"} onChange={(e) => setFile(e.target.files[0] || null)} />
        {video && <><label htmlFor="e-p">Replace thumbnail</label><input id="e-p" type="file" accept="image/*" onChange={(e) => setPoster(e.target.files[0] || null)} /></>}
        <div className="checks">
          <label className="chk"><input type="checkbox" checked={f.featured} onChange={(e) => setF({ ...f, featured: e.target.checked })} /> Featured</label>
          <label className="chk"><input type="checkbox" checked={f.visible} onChange={(e) => setF({ ...f, visible: e.target.checked })} /> Visible on website</label>
        </div>
        <div className="dlg-a"><button className="btn ghost-d" onClick={onClose} disabled={pct !== null}>Cancel</button><button className="btn" onClick={save} disabled={pct !== null}>{pct !== null ? `Saving ${pct}%` : "Save changes"}</button></div>
        {pct !== null && <div className="prog"><i style={{ width: `${pct}%` }} /></div>}
      </div>
    </Modal>
  );
}

/* ---------- Site images (hero, services, banners) ---------- */
const GROUPS = [
  { title: "Home page", items: [["hero.video", "Hero video", "Loops silently behind the main headline. Optional."], ["hero.image", "Hero photo", "Shown while the video loads, or when there is no video."], ["band.image", "“Why Blue Bee” background"], ["cta.image", "Bottom banner background"]] },
  { title: "“Why Blue Bee” cards", items: WHY.map((w, i) => [`why.${i}`, w.title]) },
  { title: "About page", items: [["about.image", "About page photo"]] },
  { title: "Service photos", items: SERVICES.map((s) => [`service.${s.slug}`, s.name]) },
];

export function SiteImages({ token, call, say, fail }) {
  const site = useSite();
  const [busy, setBusy] = useState({});
  const set = async (key, file) => {
    const fd = new FormData(); fd.append("file", file);
    setBusy((b) => ({ ...b, [key]: 0 }));
    try { await upload(`/api/admin/slots/${key}`, "PUT", fd, token, (p) => setBusy((b) => ({ ...b, [key]: p }))); say("Image updated. It is live on the website."); await site.reload(); }
    catch (e) { fail(e); }
    setBusy((b) => { const { [key]: _, ...rest } = b; return rest; });
  };
  const reset = async (key) => {
    try { await call(`/api/admin/slots/${key}`, { method: "DELETE" }); say("Back to the default image."); await site.reload(); } catch (e) { fail(e); }
  };
  return (
    <>
      <h1>Site images</h1>
      <p className="muted lead-s">Replace any picture on the website. Changes go live immediately. “Reset” brings back the original.</p>
      {GROUPS.map((g) => (
        <div key={g.title}>
          <h2 className="sec">{g.title}</h2>
          <div className="mgrid">{g.items.map(([key, label, hint]) => {
            const url = site.slot(key), isVid = key === "hero.video", on = site.custom(key);
            return (
              <article className="mi" key={key}>
                <div className="mi-img">
                  {!url ? <div className="none">No video yet</div> : isVid ? <video src={url} muted loop autoPlay playsInline /> : <img src={url} alt="" loading="lazy" />}
                  <span className="mi-b"><em className={on ? "" : "h"}>{on ? "Custom" : "Default"}</em></span>
                </div>
                <div className="mi-t"><b>{label}</b>{hint && <small>{hint}</small>}</div>
                <div className="mi-a">
                  <label className="filebtn">{busy[key] !== undefined ? `Uploading ${busy[key]}%` : isVid ? "Upload video" : "Replace photo"}
                    <input type="file" hidden disabled={busy[key] !== undefined} accept={isVid ? "video/mp4,video/webm" : "image/jpeg,image/png,image/webp,image/avif"}
                      onChange={(e) => { const f = e.target.files[0]; e.target.value = ""; if (f) set(key, f); }} /></label>
                  {on && <button onClick={() => reset(key)}>Reset</button>}
                </div>
              </article>
            );
          })}</div>
        </div>
      ))}
    </>
  );
}
