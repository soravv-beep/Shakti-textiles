import SectionHeading from '../ui/SectionHeading.jsx';
import { useSiteContent } from '../../lib/api.js';

const STEPS = [
  { label: 'Consultation', desc: 'Get expert consultation to bring your ideas for rugs, carpets and throw pillows to life.', tag: 'Step 1' },
  { label: 'Choose Your Material', desc: 'Select from a wide range of high-quality materials to perfectly suit your product vision and comfort needs.', tag: 'Step 2' },
  { label: 'Production', desc: 'Experience precision manufacturing and expert craftsmanship for premium rugs, cushions and throws.', tag: 'Step 3' },
  { label: 'The Final Result', desc: 'Our final products reflect a perfect blend of durability, design, and innovation — crafted to elevate any space.', tag: 'Step 4' },
];

export default function ProcessTimeline() {
  const { data } = useSiteContent('process');
  const c = data?.data;
  const heading = {
    eyebrow: c?.eyebrow || 'How we work',
    title: c?.title || 'Find the fabric, enjoy the process and the results',
    description: c?.description || 'A customer-centric approach to ensure the highest quality and satisfaction at every stage — from initial consultation to the final product.',
  };
  const steps = (c?.steps?.length ? c.steps : STEPS).filter((s) => s.label || s.desc);
  if (c?.active === false) return null;

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="container-x">
        <SectionHeading
          eyebrow={heading.eyebrow}
          title={heading.title}
          description={heading.description}
        />
        <ol className="mt-12 space-y-0">
          {steps.map((s, i) => (
            <li key={s.label} className="relative flex gap-5 pb-10 last:pb-0">
              {/* connector */}
              {i < steps.length - 1 && (
                <span className="absolute left-[19px] top-10 h-[calc(100%-2.5rem)] w-[2px] bg-bordeaux/15" aria-hidden="true" />
              )}
              <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ruby font-bold text-white tabular">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="pt-1">
                <h3 className="font-bold text-bordeaux">{s.label}</h3>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-bordeaux/75">{s.desc}</p>
                <span className="mt-2.5 inline-flex items-center rounded-full bg-crimson/10 px-3 py-1 text-xs font-semibold text-ruby">
                  {s.tag}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
