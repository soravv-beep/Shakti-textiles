import SectionHeading from '../ui/SectionHeading.jsx';
import { useTestimonials } from '../../lib/api.js';

export default function Testimonials() {
  const { data, isLoading } = useTestimonials();
  const quotes = data?.data ?? [];

  return (
    <section className="bg-blush py-16 sm:py-20">
      <div className="container-x">
        <SectionHeading
          eyebrow="Customer proof"
          title="Problems we were hired to solve"
          description="Real engagements with measured outcomes — references available on request."
        />
        {isLoading && (
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[0, 1, 2].map((i) => <div key={i} className="h-64 animate-pulse rounded-xl bg-white/70" />)}
          </div>
        )}
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {quotes.slice(0, 3).map((t) => (
            <figure key={t._id} className="card flex flex-col p-7">
              <span className="text-6xl font-bold leading-none text-crimson" aria-hidden="true">“</span>
              <blockquote className="mt-2 flex-1 text-sm leading-relaxed text-bordeaux/90">
                {t.quote}
              </blockquote>
              <figcaption className="mt-5 border-t border-bordeaux/10 pt-4">
                <p className="font-bold text-bordeaux">{t.name}</p>
                <p className="text-sm text-ruby">{t.role} · {t.company}</p>
                {t.city && <p className="text-xs text-bordeaux/55">{t.city}</p>}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
