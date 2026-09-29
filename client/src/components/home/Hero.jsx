import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { PARTNERS } from './TrustedBy.jsx';
import { useHeroSlides } from '../../lib/api.js';

/**
 * Hero — Papermark-style: full-bleed image, left-aligned white text,
 * white CTA, and a trusted-by logo marquee along the bottom edge.
 * Same 5-slide content + autoplay/crossfade/swipe as before.
 */

const SLIDES = [
  {
    img: '/hero/hero-1.jpg',
    alt: 'Artisan weaving a vibrant rug on a traditional handloom',
    eyebrow: 'Crafted by Hand',
    line1: 'Woven by Artisans.',
    line2: 'Made to Last.',
    desc: 'Rooted in traditional weaving techniques, every textile carries the skill, patience, and story of the hands that created it.',
    cta: { label: 'Meet Our Artisans', to: '/about' },
    secondary: { label: 'Explore Collection', to: '/products' },
  },
  {
    img: '/hero/hero-2.jpg',
    alt: 'Colourful handcrafted cushions arranged on a sofa',
    eyebrow: 'Texture • Colour • Comfort',
    line1: 'Add Character',
    line2: 'to Every Corner.',
    desc: 'Thoughtfully designed cushions and textiles that bring colour, texture, and personality into your everyday spaces.',
    cta: { label: 'Shop Cushions', to: '/products' },
  },
  {
    img: '/hero/hero-3.jpg',
    alt: 'Rolls of handcrafted rugs in rich traditional patterns',
    eyebrow: 'The Art of Textiles',
    line1: 'Timeless Patterns.',
    line2: 'Richer Spaces.',
    desc: 'Explore a curated collection of handcrafted rugs and textiles, where traditional artistry meets contemporary interiors.',
    cta: { label: 'View Collection', to: '/products' },
    secondary: { label: 'Our Story', to: '/about' },
  },
  {
    img: '/hero/hero-4.jpg',
    alt: 'Corner of a living space styled with handwoven cushions and rugs',
    eyebrow: 'Crafted with Character',
    line1: 'Every Thread',
    line2: 'Tells a Story.',
    desc: 'From intricate geometric patterns to rich earthy tones, our textiles are designed with a deep appreciation for traditional craftsmanship.',
    cta: { label: 'Explore Textiles', to: '/products' },
  },
  {
    img: '/hero/hero-5.jpg',
    alt: 'Close-up of a handwoven rug with tassels and geometric weave',
    eyebrow: 'Handcrafted for Your Space',
    line1: 'Bring Home the Beauty',
    line2: 'of Handmade Textiles.',
    desc: 'Discover richly woven rugs, cushions, and textiles crafted to bring warmth, character, and timeless style to every corner.',
    cta: { label: 'Explore Collection', to: '/products' },
    secondary: { label: 'Discover Our Craft', to: '/about' },
  },
];

const AUTOPLAY_MS = 6000;

export default function Hero() {
  const { data: slidesResp } = useHeroSlides();
  const apiSlides = Array.isArray(slidesResp?.data) ? slidesResp.data : [];
  const slides = apiSlides.length
    ? apiSlides.map((s) => ({
        img: s.img,
        alt: s.alt || '',
        eyebrow: s.eyebrow || '',
        line1: s.line1 || '',
        line2: s.line2 || '',
        desc: s.desc || '',
        cta: { label: s.ctaLabel || 'Explore', to: s.ctaTo || '/products' },
        secondary: s.secondaryLabel ? { label: s.secondaryLabel, to: s.secondaryTo || '/products' } : null,
      }))
    : SLIDES; // fallback to the built-in set if API is empty/unreachable
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedRef = useRef(false);
  const touchX = useRef(null);

  useEffect(() => {
    reducedRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    setIndex((i) => (slides.length ? i % slides.length : 0));
  }, [slides.length]);

  useEffect(() => {
    if (paused || reducedRef.current || slides.length <= 1) return undefined;
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [paused, slides.length]);

  const go = (i) => setIndex((i + slides.length) % slides.length);
  const slide = slides[index] || slides[0];

  const onTouchStart = (e) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 48) go(index + (dx < 0 ? 1 : -1));
    touchX.current = null;
  };

  return (
    <section
      className="relative isolate overflow-hidden bg-bordeaux"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-roledescription="carousel"
      aria-label="Featured collections"
    >
      {/* Full-bleed background slides — crossfade */}
      {slides.map((s, i) => (
        <img
          key={s.img}
          src={s.img}
          alt={i === index ? s.alt : ''}
          loading={i === 0 ? 'eager' : 'lazy'}
          fetchpriority={i === 0 ? 'high' : undefined}
          aria-hidden={i !== index}
          className={`absolute inset-0 -z-10 h-full w-full object-cover transition-opacity duration-1000 ease-out ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}

      {/* Left-weighted bordeaux overlay for text legibility */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(100deg, rgba(63,13,18,0.92) 0%, rgba(63,13,18,0.78) 34%, rgba(63,13,18,0.38) 64%, rgba(63,13,18,0.10) 100%)',
        }}
        aria-hidden="true"
      />

      <div className="container-x flex min-h-screen flex-col justify-between pb-0 pt-24 sm:pt-28 lg:pt-32">
        {/* ── Left-aligned slide content (Papermark-style) ── */}
        <div key={index} className="max-w-2xl">
          <p className="hero-rise hero-rise-1 text-xs font-medium uppercase tracking-[0.2em] text-blush/80">
            {slide.eyebrow}
          </p>

          <h1 className="hero-rise hero-rise-2 mt-4 text-5xl font-bold leading-[1.04] tracking-tight text-white sm:text-6xl lg:text-7xl">
            {slide.line1}
            <br />
            {slide.line2}
          </h1>

          <p className="hero-rise hero-rise-3 mt-6 max-w-lg text-base leading-relaxed text-blush/90 sm:text-lg">
            {slide.desc}
          </p>

          <div className="hero-rise hero-rise-4 mt-9 flex flex-wrap items-center gap-5">
            <Link
              to={slide.cta.to}
              className="inline-flex items-center gap-2.5 rounded-lg bg-white px-6 py-3.5 font-semibold text-bordeaux shadow-lg transition-colors duration-200 hover:bg-blush focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-bordeaux"
            >
              {slide.cta.label}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            {slide.secondary && (
              <Link
                to={slide.secondary.to}
                className="text-sm font-semibold text-blush/90 underline decoration-blush/40 decoration-2 underline-offset-8 transition-colors hover:text-white hover:decoration-crimson"
              >
                {slide.secondary.label}
              </Link>
            )}
          </div>
        </div>

        {/* ── Bottom: trusted-by line + logo marquee ── */}
        <div className="mt-16 border-t border-blush/15 py-6 lg:mt-20">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-10">
            <p className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-blush/70">
              Trusted by buyers across 18+ countries
            </p>

            {/* Automatic logo slider (seamless loop) */}
            <div
              className="relative min-w-0 flex-1 overflow-hidden"
              style={{
                maskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)',
                WebkitMaskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)',
              }}
              aria-label="Our buyers"
            >
              <div className="logo-marquee flex w-max items-center gap-14 pr-14">
                {[...PARTNERS, ...PARTNERS].map((name, i) => (
                  <span
                    key={`${name}-${i}`}
                    aria-hidden={i >= PARTNERS.length}
                    className="select-none whitespace-nowrap text-sm font-bold uppercase tracking-[0.16em] text-blush/60 transition-colors hover:text-white"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>

            {/* slide dots (compact, right) */}
            <div className="flex shrink-0 items-center gap-2" role="tablist" aria-label="Choose slide">
              {slides.map((s, i) => (
                <button
                  key={s.img}
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Slide ${i + 1}: ${s.eyebrow}`}
                  onClick={() => go(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === index ? 'w-7 bg-crimson' : 'w-2 bg-blush/35 hover:bg-blush/60'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
