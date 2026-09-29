import { Link } from 'react-router-dom';
import SectionHeading from '../ui/SectionHeading.jsx';
import { useEnquiry } from '../../context/EnquiryContext.jsx';
import { useProducts } from '../../lib/api.js';

export default function ProductCarousel() {
  const { data, isLoading } = useProducts({ featured: true });
  const { openEnquiry } = useEnquiry();
  const products = data?.data ?? [];

  return (
    <section className="bg-bordeaux py-16 sm:py-20">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            dark
            eyebrow="Latest developments"
            title="Featured constructions from the loom floor"
          />
          <Link
            to="/products"
            className="text-sm font-semibold text-blush underline decoration-crimson decoration-2 underline-offset-8 transition-colors hover:text-white"
          >
            View full catalogue →
          </Link>
        </div>

        {isLoading && (
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => <div key={i} className="h-80 animate-pulse rounded-xl bg-white/10" />)}
          </div>
        )}

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {products.slice(0, 6).map((p) => (
            <article key={p.slug} className="flex flex-col overflow-hidden rounded-xl bg-blush">
              {/* Product visual: real product photo */}
              <Link to={`/products/${p.slug}`} className="group relative block h-48 overflow-hidden">
                {p.image ? (
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-ruby via-crimson to-bordeaux">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-blush/85">{p.category}</span>
                  </div>
                )}
                <p className="absolute bottom-3 left-4 rounded-full bg-bordeaux/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-blush backdrop-blur-sm">{p.category}</p>
              </Link>

              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-lg font-bold text-ruby">
                  <Link to={`/products/${p.slug}`} className="hover:underline">{p.name}</Link>
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-bordeaux/80">{p.shortDescription}</p>

                {/* Compact spec table */}
                <table className="mt-4 w-full text-left text-xs">
                  <tbody>
                    {(p.specs ?? []).slice(0, 3).map((row) => (
                      <tr key={row.label} className="border-b border-bordeaux/10 last:border-0">
                        <th className="py-1.5 pr-3 font-medium text-bordeaux/60">{row.label}</th>
                        <td className="py-1.5 text-bordeaux">{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(p.tags ?? []).map((t) => <span key={t} className="pill">{t}</span>)}
                  {(p.certifications ?? []).map((c) => (
                    <span key={c} className="inline-flex items-center rounded-full border border-ruby/30 px-2.5 py-1 text-[11px] font-medium text-ruby">{c}</span>
                  ))}
                </div>

                <div className="mt-4 flex items-center gap-3 pt-1">
                  <button onClick={() => openEnquiry(p.slug)} className="btn-primary flex-1 !py-2 text-sm">
                    Request a sample
                  </button>
                  <Link to={`/products/${p.slug}`} className="text-sm font-semibold text-ruby hover:underline">
                    Details →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
