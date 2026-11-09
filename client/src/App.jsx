import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, NavLink, Link, useLocation } from "react-router-dom";
import { COMPANY, SERVICES, WA_LINK } from "./data";
import { SiteProvider } from "./site";
import { Home, About, Services, ServiceDetail, Gallery, Contact } from "./Pages";
import Book from "./Book";
import Admin from "./Admin";
import Chat from "./Chat";
import { HexMark, IconMenu, IconWA } from "./ui";

function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const solid = scrolled || open || pathname !== "/";
  useEffect(() => { setOpen(false); window.scrollTo(0, 0); }, [pathname]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 30);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <nav className={solid ? "solid" : ""}>
      <Link to="/" className="logo"><HexMark /> Blue <b>Bee</b></Link>
      <button className="burger" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}><IconMenu open={open} size={26} /></button>
      <div className={`links ${open ? "open" : ""}`}>
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/about">About</NavLink>
        <div className="dd"><NavLink to="/services">Services</NavLink>
          <div className="dd-m">{SERVICES.map((s) => <Link key={s.slug} to={`/services/${s.slug}`}>{s.name}</Link>)}</div></div>
        <NavLink to="/gallery">Gallery</NavLink>
        <NavLink to="/book">Book</NavLink>
        <NavLink to="/contact">Contact</NavLink>
        <Link className="btn y sm" to="/contact">Request quote</Link>
      </div>
    </nav>
  );
}

function Layout() {
  const { pathname } = useLocation();
  const admin = pathname.startsWith("/admin");
  return (
    <>
      <Nav />
      <main key={pathname.split("/")[1]} className="page">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:slug" element={<ServiceDetail />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/book" element={<Book />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<section className="wrap"><h1 className="ph left">Page not found</h1><Link to="/">Back to home</Link></section>} />
        </Routes>
      </main>
      {!admin && (
        <footer>
          <div className="foot">
            <div><Link to="/" className="logo"><HexMark /> Blue <b>Bee</b></Link><p>{COMPANY.tagline}.</p><p>{COMPANY.address}</p></div>
            <div><b>Pages</b><Link to="/about">About</Link><Link to="/services">Services</Link><Link to="/gallery">Gallery</Link><Link to="/book">Book a date</Link></div>
            <div><b>Contact</b><a href={`tel:${COMPANY.phone}`}>{COMPANY.phone}</a><a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a><Link to="/admin">Admin login</Link></div>
          </div>
          <small>© {new Date().getFullYear()} Blue Bee Events. All rights reserved.</small>
        </footer>
      )}
      {!admin && <Chat />}
      {!admin && <a className="wa-float" href={WA_LINK} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp"><IconWA size={26} /></a>}
    </>
  );
}

export default function App() {
  return <BrowserRouter><SiteProvider><Layout /></SiteProvider></BrowserRouter>;
}
