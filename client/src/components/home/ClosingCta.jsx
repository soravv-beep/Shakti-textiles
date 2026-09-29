import { useEnquiry } from '../../context/EnquiryContext.jsx';
import { useSiteContent } from '../../lib/api.js';

/* Fallback = current copy; admin can override via Admin → Content. */
const FALLBACK = {
  title: 'Send us your specification.',
  highlight: 'Hold a sample in 7 days.',
  description: 'Tell us what you are imagining — our team will guide you from design to delivery, with a reply within 24 hours.',
  primaryLabel: 'Request a Sample',
  whatsappLabel: 'Get a Quote on WhatsApp',
  image: '/hero/carpet-showroom.jpg',
  active: true,
};

export default function ClosingCta() {
  const { openEnquiry } = useEnquiry();
  const { data } = useSiteContent('closingCta');
  const c = { ...FALLBACK, ...(data?.data || {}) };
  const img = c.image || FALLBACK.image; // empty = default showroom photo
  if (c.active === false) return null;

  return (
    <section className="relative isolate overflow-hidden bg-bordeaux">
      {/* Showroom photo backdrop — falls back to the gradient weave if the
          image is missing or fails to load. */}
      {img ? (
        <>
          <img
            src={img}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 -z-20 h-full w-full object-cover"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <div
            className="absolute inset-0 -z-10"
            style={{ background: 'linear-gradient(115deg, rgba(63,13,18,0.94) 0%, rgba(63,13,18,0.88) 45%, rgba(110,14,23,0.82) 70%, rgba(155,17,30,0.78) 100%)' }}
          />
        </>
      ) : (
        <>
          <div
            className="absolute inset-0 -z-20"
            style={{ background: 'linear-gradient(115deg, #3F0D12 0%, #3F0D12 45%, #6E0E17 70%, #9B111E 100%)' }}
          />
          <svg className="absolute inset-0 -z-10 h-full w-full opacity-[0.07]" aria-hidden="true">
            <defs>
              <pattern id="weave-cta" width="28" height="28" patternUnits="userSpaceOnUse">
                <path d="M0 14h28M14 0v28" stroke="#FBE4E3" strokeWidth="1" fill="none" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#weave-cta)" />
          </svg>
        </>
      )}

      <div className="container-x py-20 text-center sm:py-24">
        <h2 className="mx-auto max-w-2xl text-3xl font-bold text-blush sm:text-4xl">
          {c.title}
          {c.highlight && (
            <>
              <br />
              <span className="text-crimson">{c.highlight}</span>
            </>
          )}
        </h2>
        {c.description && (
          <p className="mx-auto mt-4 max-w-xl text-base text-blush/85">{c.description}</p>
        )}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {c.primaryLabel && (
            <button onClick={() => openEnquiry()} className="btn-primary">
              {c.primaryLabel}
            </button>
          )}
          {c.whatsappLabel && (
            <a
              href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || '917015483332'}`}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost-light"
            >
              {c.whatsappLabel}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
