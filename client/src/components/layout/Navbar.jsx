import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useEnquiry } from '../../context/EnquiryContext.jsx';

const LINKS = [
  { to: '/products', label: 'Products' },
  { to: '/industries', label: 'Industries' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { openEnquiry } = useEnquiry();
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Transparent over the home hero; solid everywhere else / once scrolled.
  const transparent = pathname === '/' && !scrolled;

  return (
    <>
      {/* Home: navbar floats over the full-bleed hero. Other pages: reserve its height. */}
      {pathname !== '/' && <div aria-hidden="true" className="h-16" />}
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b text-blush transition-all duration-300 ${
          transparent
            ? 'border-transparent bg-transparent'
            : 'border-blush/15 bg-bordeaux shadow-lg shadow-bordeaux/30'
        }`}
      >
      <nav className="container-x flex h-16 items-center justify-between" aria-label="Main">
        <Link to="/" className="flex items-center" aria-label="Shakti Global Tex — home">
          <img src="/logo.png" alt="Shakti Global Tex" className="h-10 w-auto rounded-md" />
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-white underline decoration-crimson decoration-2 underline-offset-8'
                    : 'text-blush/85 hover:text-white'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <button onClick={() => openEnquiry()} className="btn-primary !px-5 !py-2.5 text-sm">
            Get a Quote
          </button>
        </div>

        <button
          className="rounded-lg p-2 text-blush hover:bg-blush/10 md:hidden"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label="Toggle navigation menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </nav>

      {open && (
        <div className="border-t border-blush/15 bg-bordeaux px-4 pb-4 pt-2 md:hidden">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2.5 text-sm font-medium ${
                  isActive ? 'bg-ruby text-white' : 'text-blush/85 hover:bg-blush/10 hover:text-white'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <button
            onClick={() => { setOpen(false); openEnquiry(); }}
            className="btn-primary mt-2 w-full text-sm"
          >
            Get a Quote
          </button>
        </div>
      )}
    </header>
    </>
  );
}
