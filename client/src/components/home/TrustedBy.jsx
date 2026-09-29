import { Link } from 'react-router-dom';
import SectionHeading from '../ui/SectionHeading.jsx';
import { useSiteContent } from '../../lib/api.js';

export const PARTNERS = [
  'Aurelia Intimatewear',
  'Weber Outdoor GmbH',
  'Pacific Activewear',
  'Mumbai Bag Co.',
  'Helsa Medical',
  'TexStyle London',
  'Nova Luggage',
  'Kaya Babywear',
];

export default function TrustedBy() {
  const { data } = useSiteContent('trustedBy');
  const c = data?.data;
  if (c?.active === false) return null;
  const partners = (c?.partners?.length ? c.partners : PARTNERS).filter(Boolean);

  return (
    <section className="bg-white py-14">
      <div className="container-x">
        <SectionHeading
          center
          eyebrow={c?.eyebrow || 'Trusted by'}
          title={c?.title || 'Buyers who audit before they order'}
        />
        <div className="mt-9 grid grid-cols-2 items-center gap-x-6 gap-y-7 sm:grid-cols-4">
          {partners.map((name) => (
            <div key={name} className="flex items-center justify-center">
              <span className="select-none text-center text-sm font-bold uppercase tracking-[0.14em] text-bordeaux/45 transition-colors hover:text-bordeaux">
                {name}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center">
          <Link to="/about#clients" className="text-sm font-semibold text-ruby underline decoration-crimson/50 decoration-2 underline-offset-4 hover:decoration-crimson">
            Read full customer testimonials →
          </Link>
        </p>
      </div>
    </section>
  );
}
