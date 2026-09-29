import { Link } from 'react-router-dom';
import SectionHeading from '../components/ui/SectionHeading.jsx';
import Founders from '../components/home/Founders.jsx';
import StatStrip from '../components/home/StatStrip.jsx';
import ClosingCta from '../components/home/ClosingCta.jsx';
import { useSiteContent } from '../lib/api.js';

/* Fallback = current copy; admin can override via Admin → Content → About page. */
const FALLBACK = {
  eyebrow: 'Welcome to Shakti Textile',
  title: 'We Weave What You Imagine',
  intro: 'At Shakti Textile, we bring craftsmanship, creativity, and comfort together to create high-quality home furnishing products. As a trusted manufacturer of rugs, carpets, cushions, throws, and bathmats, we combine traditional techniques with modern designs to enhance every living space.',
  craftedTitle: 'Crafted with care',
  craftedText: 'With a strong focus on quality, sustainability, and innovation, our collections are designed to meet the diverse needs of global markets. Every product is crafted with care, using premium materials and attention to detail to ensure lasting beauty and durability. Whether you are looking to elevate a cozy corner or transform an entire room, Shakti Textile is your reliable partner for stylish and functional home decor solutions.',
  milestones: [
    { year: '1994', text: 'Founded as a family weaving workshop serving local traders in Panipat.' },
    { year: '2001', text: 'First export order — handloom dhurries to a UK home retailer.' },
    { year: '2009', text: 'In-house dyeing and finishing; ISO 9001 certification.' },
    { year: '2015', text: 'Hand-tufting and stitching units commissioned; OEKO-TEX Standard 100.' },
    { year: '2020', text: 'GRS-certified recycled cotton and polyester programmes; solar 40% of load.' },
    { year: '2024', text: '120+ artisan & loom stations, buyers in 18+ countries.' },
  ],
  values: [
    { title: 'Unmatched Quality', text: 'Every product is crafted with premium materials and attention to detail, ensuring durability and a refined finish.' },
    { title: 'Diverse Product Range', text: 'From rugs and carpets to cushions, throws and bathmats — a complete range of textile solutions to elevate any space.' },
    { title: 'Custom Designs', text: 'Every market is different. That is why we offer flexible, customizable designs to suit your unique needs and tastes.' },
    { title: 'Skilled Craftsmanship', text: 'Our experienced artisans bring traditional techniques and modern innovation together to create standout pieces.' },
    { title: 'Timely Delivery', text: 'We value your time. A streamlined production process and efficient logistics ensure timely delivery without compromising quality.' },
    { title: 'Sustainable Practices', text: 'We are committed to environmentally responsible manufacturing, using sustainable processes and ethical sourcing wherever possible.' },
  ],
};

export default function About() {
  const { data } = useSiteContent('about');
  const c = { ...FALLBACK, ...(data?.data || {}) };

  return (
    <div className="bg-blush">
      <div className="container-x py-14 sm:py-18">
        <SectionHeading
          eyebrow={c.eyebrow}
          title={c.title}
          description={c.intro}
        />

        <div id="facility" className="card mt-10 grid gap-6 p-8 md:grid-cols-2">
          <div>
            <h2 className="text-xl font-bold text-ruby">{c.craftedTitle}</h2>
            <p className="mt-3 text-sm leading-relaxed text-bordeaux/80">{c.craftedText}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-blush p-4">
              <p className="tabular text-2xl font-bold text-ruby">42,000</p>
              <p className="text-xs text-bordeaux/70">sq ft built-up area</p>
            </div>
            <div className="rounded-lg bg-blush p-4">
              <p className="tabular text-2xl font-bold text-ruby">120+</p>
              <p className="text-xs text-bordeaux/70">artisan & loom stations</p>
            </div>
            <div className="rounded-lg bg-blush p-4">
              <p className="tabular text-2xl font-bold text-ruby">6</p>
              <p className="text-xs text-bordeaux/70">days a week</p>
            </div>
            <div className="rounded-lg bg-blush p-4">
              <p className="tabular text-2xl font-bold text-ruby">40%</p>
              <p className="text-xs text-bordeaux/70">solar-powered load</p>
            </div>
          </div>
        </div>

        <h2 className="mt-16 text-2xl font-bold text-ruby">Milestones</h2>
        <ol className="mt-8 space-y-6">
          {(c.milestones ?? []).map((m) => (
            <li key={m.year} className="flex items-start gap-5">
              <span className="tabular flex h-12 w-16 shrink-0 items-center justify-center rounded-lg bg-ruby font-bold text-white">{m.year}</span>
              <p className="pt-2.5 text-sm leading-relaxed text-bordeaux">{m.text}</p>
            </li>
          ))}
        </ol>

        <div id="clients" className="mt-16">
          <h2 className="text-2xl font-bold text-ruby">What buyers say</h2>
          <p className="mt-3 text-sm text-bordeaux/70">
            Selected testimonials appear on the <Link to="/" className="font-semibold text-ruby underline decoration-crimson/50 decoration-2 underline-offset-4">homepage</Link>;
            full references and contactable buyers are shared during RFQ stage.
          </p>
        </div>
      </div>

      <div className="bg-white py-16">
        <div className="container-x">
          <SectionHeading eyebrow="Why choose Shakti Textile" title="Comfort, style and value that lasts" />
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {(c.values ?? []).map((v) => (
              <div key={v.title} className="rounded-xl border border-bordeaux/10 bg-blush p-6">
                <h3 className="font-bold text-bordeaux">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-bordeaux/75">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Founders people={c.founders} />
      <StatStrip />
      <ClosingCta />
    </div>
  );
}
