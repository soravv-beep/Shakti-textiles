import { Link, useParams } from 'react-router-dom';
import { useEnquiry } from '../context/EnquiryContext.jsx';
import { useProduct, useProducts } from '../lib/api.js';
import ProductCard from '../components/products/ProductCard.jsx';

export default function ProductDetail() {
  const { slug } = useParams();
  const { data, isLoading, isError } = useProduct(slug);
  const { openEnquiry } = useEnquiry();
  const { data: relatedResp } = useProducts();
  const product = data?.data;
  const related = (relatedResp?.data ?? []).filter((p) => p.slug !== slug && p.category === product?.category).slice(0, 3);

  if (isLoading) {
    return <div className="container-x py-20"><div className="h-96 animate-pulse rounded-xl bg-white/70" /></div>;
  }

  if (isError || !product) {
    return (
      <div className="container-x py-24 text-center">
        <h1 className="text-2xl font-bold text-ruby">Product not found</h1>
        <p className="mt-3 text-bordeaux/70">It may have been renamed or retired from the catalogue.</p>
        <Link to="/products" className="btn-primary mt-6">Back to all products</Link>
      </div>
    );
  }

  return (
    <div className="bg-blush py-12 sm:py-16">
      <div className="container-x">
        <nav className="text-sm text-bordeaux/60" aria-label="Breadcrumb">
          <Link to="/products" className="hover:text-ruby hover:underline">Products</Link>
          <span className="mx-2">/</span>
          <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-ruby hover:underline">{product.category}</Link>
          <span className="mx-2">/</span>
          <span className="text-bordeaux">{product.name}</span>
        </nav>

        <div className="mt-6 grid gap-10 lg:grid-cols-12">
          {/* Visual */}
          <div className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-2xl bg-blush">
              {product.image ? (
                <img src={product.image} alt={product.name} className="h-72 w-full object-cover sm:h-96" />
              ) : (
                <div className="flex h-72 items-center justify-center bg-gradient-to-br from-ruby via-crimson to-bordeaux sm:h-96">
                  <span className="text-sm font-semibold uppercase tracking-[0.18em] text-blush/90">{product.category}</span>
                </div>
              )}
            </div>
            <div className="card mt-4 p-5">
              <p className="text-sm font-semibold text-bordeaux">Minimum order quantity</p>
              <p className="tabular mt-1 text-lg font-bold text-ruby">{product.minOrderQty || 'On request'}</p>
              <p className="mt-3 text-xs leading-relaxed text-bordeaux/60">
                Trial quantities available for first-time buyers. MOQs are per design / shade.
              </p>
            </div>
          </div>

          {/* Info */}
          <div className="lg:col-span-7">
            <p className="eyebrow">{product.category}</p>
            <h1 className="mt-2 text-3xl font-bold text-ruby sm:text-4xl">{product.name}</h1>
            <p className="mt-4 text-base leading-relaxed text-bordeaux">{product.description || product.shortDescription}</p>

            {product.benefits?.length > 0 && (
              <ul className="mt-6 space-y-2.5">
                {product.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm text-bordeaux">
                    <svg className="mt-0.5 shrink-0 text-ruby" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M5 13l4 4L19 7" /></svg>
                    {b}
                  </li>
                ))}
              </ul>
            )}

            {/* Full spec table */}
            <div className="card mt-8 overflow-hidden">
              <div className="border-b border-bordeaux/10 bg-white px-5 py-3.5">
                <h2 className="text-sm font-bold uppercase tracking-wider text-ruby">Technical specification</h2>
              </div>
              <table className="w-full text-left text-sm">
                <tbody>
                  {(product.specs ?? []).map((row) => (
                    <tr key={row.label} className="border-b border-bordeaux/10 last:border-0">
                      <th className="w-40 py-3 pl-5 pr-3 align-top font-medium text-bordeaux/60">{row.label}</th>
                      <td className="py-3 pr-5 text-bordeaux">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex flex-wrap gap-1.5">
              {(product.certifications ?? []).map((c) => (
                <span key={c} className="inline-flex items-center rounded-full border border-ruby/30 px-3 py-1 text-xs font-medium text-ruby">{c}</span>
              ))}
              {(product.industries ?? []).map((i) => <span key={i} className="pill">{i}</span>)}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={() => openEnquiry(product.slug)} className="btn-primary">Request a sample of {product.name}</button>
              <Link to="/contact" className="btn-ghost">Ask an engineer</Link>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-bold text-ruby">More in {product.category}</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {related.map((p) => <ProductCard key={p.slug} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
