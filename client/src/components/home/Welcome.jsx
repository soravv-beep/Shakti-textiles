import { Link } from 'react-router-dom';
import SectionHeading from '../ui/SectionHeading.jsx';
import { useSiteContent } from '../../lib/api.js';

/* Fallback = current copy; admin can override via Admin → Content. */
const FALLBACK = {
  eyebrow: 'Welcome to Shakti Textile',
  title: 'We Weave What You Imagine',
  paragraphs: [
    'At Shakti Textile, we bring craftsmanship, creativity, and comfort together to create high-quality home furnishing products. As a trusted manufacturer of rugs, carpets, cushions, throws, and bathmats, we combine traditional techniques with modern designs to enhance every living space.',
    'With a strong focus on quality, sustainability, and innovation, our collections are designed to meet the diverse needs of global markets. Every product is crafted with care, using premium materials and attention to detail to ensure lasting beauty and durability.',
    'Whether you are looking to elevate a cozy corner or transform an entire room, Shakti Textile is your reliable partner for stylish and functional home decor solutions.',
  ],
  ctaLabel: 'More About Us',
  ctaTo: '/about',
  active: true,
};

export default function Welcome() {
  const { data } = useSiteContent('welcome');
  const c = { ...FALLBACK, ...(data?.data || {}) };
  if (c.active === false) return null;

  return (
    <section className="bg-blush py-16 sm:py-20">
      <div className="container-x max-w-3xl">
        <SectionHeading center eyebrow={c.eyebrow} title={c.title} />
        <div className="mt-8 space-y-4 text-center text-base leading-relaxed text-bordeaux/85">
          {(c.paragraphs ?? []).filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
        </div>
        {c.ctaLabel && (
          <p className="mt-9 text-center">
            <Link to={c.ctaTo || '/about'} className="btn-primary">{c.ctaLabel}</Link>
          </p>
        )}
      </div>
    </section>
  );
}
