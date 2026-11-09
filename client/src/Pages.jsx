import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "./api";
import { COMPANY, SERVICES, TESTIMONIALS, WA_LINK, WHY, STEPS } from "./data";
import { useSite, Reveal, Counter } from "./site";
import { Lightbox, VideoModal, IconPlay, IconArrow, IconWA } from "./ui";

const SPANS = [7, 5, 4, 4, 4, 5, 7, 4, 4, 4, 6, 6];

/* ---------- shared pieces ---------- */
function Head({ title, text, to, cta, light }) {
  return (
    <Reveal className={`head ${light ? "light" : ""}`}>
      <div><h2>{title}</h2>{text && <p>{text}</p>}</div>
      {to && <Link className={`btn sm ${light ? "ghost" : "ghost-d"}`} to={to}>{cta}</Link>}
    </Reveal>
  );
}

function ServiceCard({ s, span, slot }) {
  return (
    <Reveal as={Link} to={`/services/${s.slug}`} className="sv" style={{ "--span": span }}>
      <img src={slot(`service.${s.slug}`)} alt="" loading="lazy" decoding="async" />
      <div className="sv-t"><h3>{s.name}</h3><p>{s.short}</p></div>
      <span className="sv-go" aria-hidden="true"><IconArrow size={18} /></span>
    </Reveal>
  );
}

function EventVideo({ video, onPlay }) {
  return (
    <button className="vid" onClick={() => onPlay(video)} aria-label={`Play ${video.title}`}>
      {video.poster ? <img src={video.poster} alt="" loading="lazy" decoding="async" /> : <video src={video.url} preload="metadata" muted playsInline />}
      <span className="vid-play"><IconPlay size={26} /></span>
      <span className="vid-cap"><small>{video.category}</small><b>{video.title}</b></span>
    </button>
  );
}

function Films({ videos }) {
  const [playing, setPlaying] = useState(null);
  return (
    <>
      <div className="vids">{videos.map((v) => <EventVideo video={v} key={v.id} onPlay={setPlaying} />)}</div>
      {playing && <VideoModal video={playing} onClose={() => setPlaying(null)} />}
    </>
  );
}

/* ---------- Home ---------- */
export function Home() {
  const { slot, gallery, videos } = useSite();
  const [lb, setLb] = useState(-1);
  const heroVideo = slot("hero.video");
  const cells = useMemo(() => {
    const feat = gallery.filter((g) => g.featured), rest = gallery.filter((g) => !g.featured);
    return [...feat, ...rest].slice(0, 3);
  }, [gallery]);
  const work = useMemo(() => [...gallery.filter((g) => g.featured), ...gallery.filter((g) => !g.featured)].slice(0, 5), [gallery]);
  const lines = COMPANY.tagline.split(" ").reduce((a, w, i) => { i % 2 ? (a[a.length - 1] += " " + w) : a.push(w); return a; }, []);
  const reviews = TESTIMONIALS.filter((t) => !/^replace/i.test(t.q)); // hide untouched placeholders

  return (
    <>
      <header className="hero">
        <div className="hero-bg">
          {heroVideo
            ? <video src={heroVideo} poster={slot("hero.image")} autoPlay muted loop playsInline preload="metadata" />
            : <img src={slot("hero.image")} alt="" fetchpriority="high" />}
        </div>
        <div className="hero-in">
          <div className="hero-copy">
            <p className="hero-kicker">Event &amp; wedding management · Kerala</p>
            <h1 aria-label={COMPANY.tagline}>{lines.map((l, i) => <span className="ln" key={l} aria-hidden="true"><span style={{ "--i": i }}>{l}{i === lines.length - 1 ? "." : ""}</span></span>)}</h1>
            <p className="hero-p">From intimate farm parties to grand weddings and corporate summits, Blue Bee plans, designs and delivers every detail so you can enjoy the moment.</p>
            <div className="hero-cta">
              <Link className="btn y" to="/book">Check dates &amp; book</Link>
              <Link className="btn ghost" to="/contact">Request a quote</Link>
            </div>
          </div>
          <div className="cells" aria-hidden="true">
            {cells.map((g, i) => <div className={`cell c${i + 1}`} key={g.id} style={{ "--i": i }}><img src={g.url} alt="" /></div>)}
          </div>
        </div>
      </header>

      <section className="stats" aria-label="Blue Bee in numbers">
        <div><b><Counter to={500} suffix="+" /></b><span>Events delivered</span></div>
        <div><b><Counter to={12} /></b><span>Services under one roof</span></div>
        <div><b><Counter to={100} suffix="%" /></b><span>Client focus</span></div>
      </section>

      <div className="marquee" aria-hidden="true">
        <div className="mq">{[0, 1].map((k) => <div key={k}>{SERVICES.map((s) => <span key={s.slug + k}>{s.name}</span>)}</div>)}</div>
      </div>

      <section className="wrap">
        <Head title="What we do" text="One team for every kind of celebration and corporate occasion." to="/services" cta="All services" />
        <div className="svgrid">{SERVICES.map((s, i) => <ServiceCard key={s.slug} s={s} span={SPANS[i]} slot={slot} />)}</div>
      </section>

      <section className="band" style={{ "--bg": `url(${slot("band.image")})` }}>
        <div className="wrap">
          <Head light title="Why Blue Bee" />
          <div className="why-grid">
            {WHY.map((w, i) => (
              <Reveal className="why" delay={i * 90} key={w.title}>
                <img src={slot(`why.${i}`)} alt="" loading="lazy" decoding="async" />
                <h3>{w.title}</h3><p>{w.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="wrap">
        <Head title="From first date to final bow" text="Booking an event with us takes four steps." to="/book" cta="Pick a date" />
        <ol className="steps">
          {STEPS.map((s, i) => <Reveal as="li" delay={i * 80} key={s.t}><span className="n">{i + 1}</span><h3>{s.t}</h3><p>{s.p}</p></Reveal>)}
        </ol>
      </section>

      <section className="wrap tight">
        <Head title="Featured work" to="/gallery" cta="Full gallery" />
        <div className="mosaic">
          {work.map((g, i) => (
            <Reveal as="button" delay={i * 70} className={`mz m${i}`} key={g.id} onClick={() => setLb(i)} aria-label={`Open ${g.title}`}>
              <img src={g.url} alt={g.title} loading="lazy" decoding="async" />
              <span className="mz-c"><b>{g.title}</b><small>{g.category}</small></span>
            </Reveal>
          ))}
        </div>
      </section>
      {lb > -1 && <Lightbox items={work} index={lb} setIndex={setLb} onClose={() => setLb(-1)} />}

      {videos.length > 0 && (
        <section className="wrap tight">
          <Head title="Event films" text="The atmosphere, details and moments that make every event memorable." />
          <Films videos={videos.slice(0, 3)} />
        </section>
      )}

      {reviews.length > 0 && (
        <section className="wrap tight">
          <Head title="Kind words" />
          <div className="quotes">{reviews.map((t, i) => (
            <Reveal as="figure" delay={i * 90} key={i}><blockquote>“{t.q}”</blockquote><figcaption><b>{t.n}</b> {t.r}</figcaption></Reveal>
          ))}</div>
        </section>
      )}

      <section className="cta" style={{ "--bg": `url(${slot("cta.image")})` }}>
        <h2>Planning something special?</h2>
        <p>Tell us your date and idea. We'll take it from there.</p>
        <div className="hero-cta"><Link className="btn y" to="/contact">Let's talk</Link><Link className="btn ghost" to="/book">Check dates</Link></div>
      </section>
    </>
  );
}

/* ---------- About ---------- */
export function About() {
  const { slot } = useSite();
  return (
    <section className="wrap">
      <h1 className="ph left">About Blue Bee</h1>
      <div className="about">
        <div>
          <p className="lead">Like a hive working in harmony, Blue Bee brings together designers, planners, chefs and technicians to create events that feel effortless for you.</p>
          <div className="pillars">
            {[["Our mission", "Turn every occasion into a memory worth keeping."], ["Our promise", "Honest budgets, on-time delivery, zero stress."], ["Our team", "Planners, decorators, caterers and AV experts under one roof."]].map(([t, p], i) => (
              <Reveal delay={i * 80} key={t}><h3>{t}</h3><p>{p}</p></Reveal>
            ))}
          </div>
        </div>
        <Reveal className="about-img"><img src={slot("about.image")} alt="Blue Bee team at work on an event" loading="lazy" /></Reveal>
      </div>
    </section>
  );
}

/* ---------- Services ---------- */
export function Services() {
  const { slot } = useSite();
  return (
    <section className="wrap">
      <h1 className="ph left">Our services</h1>
      <div className="svgrid">{SERVICES.map((s, i) => <ServiceCard key={s.slug} s={s} span={SPANS[i]} slot={slot} />)}</div>
    </section>
  );
}

export function ServiceDetail() {
  const { slug } = useParams();
  const { slot, gallery } = useSite();
  const s = SERVICES.find((x) => x.slug === slug);
  if (!s) return <section className="wrap"><h1 className="ph left">Service not found</h1><Link to="/services">Back to services</Link></section>;
  const more = SERVICES.filter((x) => x.slug !== s.slug).slice(0, 3);
  return (
    <>
      <div className="detail-hero"><img src={slot(`service.${s.slug}`)} alt={s.name} /><div><h1>{s.name}</h1></div></div>
      <section className="wrap narrow">
        <p className="lead">{s.long}</p>
        <h3>What's included</h3>
        <ul className="tick">{s.points.map((p) => <li key={p}>{p}</li>)}</ul>
        <div className="hero-cta left">
          <Link className="btn" to={`/book?service=${encodeURIComponent(s.name)}`}>Check dates</Link>
          <Link className="btn ghost-d" to="/contact">Request a quote</Link>
        </div>
        <h3 className="more-h">Also from Blue Bee</h3>
        <div className="svgrid small">{more.map((m) => <ServiceCard key={m.slug} s={m} span={4} slot={slot} />)}</div>
      </section>
    </>
  );
}

/* ---------- Gallery ---------- */
export function Gallery() {
  const { gallery, videos } = useSite();
  const [c, setC] = useState("All");
  const [lb, setLb] = useState(-1);
  const cats = useMemo(() => ["All", ...new Set(gallery.map((g) => g.category))], [gallery]);
  const shown = useMemo(() => gallery.filter((g) => c === "All" || g.category === c), [gallery, c]);
  return (
    <section className="wrap">
      <h1 className="ph left">Work gallery</h1>
      <div className="pills" role="tablist">{cats.map((x) => <button key={x} role="tab" aria-selected={c === x} className={c === x ? "on" : ""} onClick={() => setC(x)}>{x}</button>)}</div>
      <div className="masonry">
        {shown.map((g, i) => (
          <button className="mas" key={g.id} onClick={() => setLb(i)} aria-label={`Open ${g.title}`}>
            <img src={g.url} alt={g.title} loading="lazy" decoding="async" />
            <span className="mz-c"><b>{g.title}</b><small>{g.category}</small></span>
          </button>
        ))}
      </div>
      {lb > -1 && <Lightbox items={shown} index={lb} setIndex={setLb} onClose={() => setLb(-1)} />}
      {videos.length > 0 && (
        <div className="gallery-videos">
          <Head title="Event films" text="Short films from weddings, corporate events and live shows." />
          <Films videos={videos} />
        </div>
      )}
    </section>
  );
}

/* ---------- Contact ---------- */
export function Contact() {
  const [f, setF] = useState({ name: "", phone: "", email: "", service: SERVICES[0].name, message: "" });
  const [msg, setMsg] = useState({ t: "", ok: false });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const send = async (e) => {
    e.preventDefault();
    setBusy(true);
    try { await api("/api/enquiries", { method: "POST", body: f }); setMsg({ t: "Thank you! We'll get back to you shortly.", ok: true }); setF({ ...f, name: "", phone: "", email: "", message: "" }); }
    catch (err) { setMsg({ t: err.message, ok: false }); }
    setBusy(false);
  };
  return (
    <section className="wrap">
      <h1 className="ph left">Request a quote</h1>
      <div className="bk">
        <div className="card">
          <h3>Get in touch</h3>
          <p>{COMPANY.address}</p>
          <p><a href={`tel:${COMPANY.phone}`}>{COMPANY.phone}</a></p>
          <p><a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a></p>
          <a className="btn wa-btn" href={WA_LINK} target="_blank" rel="noreferrer"><IconWA size={18} /> Chat on WhatsApp</a>
        </div>
        <form className="card" onSubmit={send}>
          <label htmlFor="q-name">Name</label><input id="q-name" required value={f.name} onChange={set("name")} autoComplete="name" />
          <label htmlFor="q-phone">Phone</label><input id="q-phone" required type="tel" value={f.phone} onChange={set("phone")} autoComplete="tel" />
          <label htmlFor="q-email">Email</label><input id="q-email" required type="email" value={f.email} onChange={set("email")} autoComplete="email" />
          <label htmlFor="q-svc">Service</label><select id="q-svc" value={f.service} onChange={set("service")}>{SERVICES.map((s) => <option key={s.slug}>{s.name}</option>)}</select>
          <label htmlFor="q-msg">Message</label><textarea id="q-msg" required rows="4" value={f.message} onChange={set("message")} />
          <button className="btn full" disabled={busy}>{busy ? "Sending…" : "Send enquiry"}</button>
          <div className={`msg ${msg.ok ? "good" : "bad"}`} role="status">{msg.t}</div>
        </form>
      </div>
    </section>
  );
}
