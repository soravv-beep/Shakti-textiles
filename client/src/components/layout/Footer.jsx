import { Link } from 'react-router-dom';
import { useEnquiry } from '../../context/EnquiryContext.jsx';
import { useSiteContent } from '../../lib/api.js';

const FALLBACK = {
  blurb: 'Manufacturer and exporter of handcrafted home textiles — rugs, carpets, cushions, poufs, bathmats and throws. Serving hospitality, retail and interior buyers across 18+ countries from India.',
  address: 'Panipat, Haryana, India',
  phone: '+91 70154 83332',
  phoneHref: '+917015483332',
  email: 'merchant@shaktitextile.com',
  tagline: 'We Weave What You Imagine — from the heart of Panipat',
};

export default function Footer() {
  const { openEnquiry } = useEnquiry();
  const { data } = useSiteContent('footer');
  const c = { ...FALLBACK, ...(data?.data || {}) };
  return (
    <footer className="bg-bordeaux text-blush">
      <div className="container-x grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <img src="/logo.png" alt="Shakti Global Tex" className="h-10 w-auto rounded-md" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-blush/80">{c.blurb}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full border border-blush/25 px-3 py-1 text-xs text-blush/90">OEKO-TEX</span>
            <span className="rounded-full border border-blush/25 px-3 py-1 text-xs text-blush/90">GRS</span>
            <span className="rounded-full border border-blush/25 px-3 py-1 text-xs text-blush/90">ISO 9001</span>
            <span className="rounded-full border border-blush/25 px-3 py-1 text-xs text-blush/90">SEDEX</span>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-blush/60">Explore</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link className="text-blush/85 transition-colors hover:text-white hover:underline" to="/products">Products</Link></li>
            <li><Link className="text-blush/85 transition-colors hover:text-white hover:underline" to="/industries">Industries</Link></li>
            <li><Link className="text-blush/85 transition-colors hover:text-white hover:underline" to="/about">About</Link></li>
            <li><Link className="text-blush/85 transition-colors hover:text-white hover:underline" to="/contact">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-blush/60">Contact</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-blush/85">
            <li>{c.address}</li>
            <li><a className="transition-colors hover:text-white hover:underline" href={`tel:${c.phoneHref}`}>{c.phone}</a></li>
            <li><a className="transition-colors hover:text-white hover:underline" href={`mailto:${c.email}`}>{c.email}</a></li>
            <li>
              <button onClick={() => openEnquiry()} className="text-blush/85 underline decoration-crimson decoration-2 underline-offset-4 transition-colors hover:text-white">
                Request a sample →
              </button>
            </li>
            <li><span className="text-blush/60">Mon–Sat · 9:00–19:00 IST</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-blush/15">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-5 text-xs text-blush/60 sm:flex-row">            <span>© {new Date().getFullYear()} Shakti Textile. All rights reserved.</span>
            <span>{c.tagline}</span>
        </div>
      </div>
    </footer>
  );
}
