import { useState } from 'react';
import { Link } from 'react-router-dom';
import SectionHeading from '../components/ui/SectionHeading.jsx';
import ProductCard from '../components/products/ProductCard.jsx';
import { useProducts } from '../lib/api.js';

const CATEGORIES = [
  'All categories',
  'Bathmat',
  'Pillow',
  'Pouf',
  'Rug And Carpets',
  'Throw',
];

const CERTS = ['', 'OEKO-TEX', 'GRS', 'GOTS', 'ISO 9001', 'SEDEX', 'REACH'];

export default function Products() {
  const [category, setCategory] = useState('');
  const [cert, setCert] = useState('');
  const [search, setSearch] = useState('');

  const { data, isLoading, isError } = useProducts({ category, certification: cert, search });
  const products = data?.data ?? [];

  return (
    <div className="bg-blush py-14 sm:py-18">
      <div className="container-x">
        <SectionHeading
          eyebrow="Product catalogue"
          title="Rugs, cushions, bathmats and throws — crafted for export"
          description="Every piece ships with technical specs and care guides. Filter by category or certification, or search by name."
        />

        {/* Filters */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            className="field-input sm:max-w-xs"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search products"
          />
          <select className="field-input sm:max-w-xs" value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category">
            {CATEGORIES.map((c) => <option key={c} value={c === 'All categories' ? '' : c}>{c}</option>)}
          </select>
          <select className="field-input sm:max-w-xs" value={cert} onChange={(e) => setCert(e.target.value)} aria-label="Filter by certification">
            <option value="">All certifications</option>
            {CERTS.filter(Boolean).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {isLoading && (
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="h-72 animate-pulse rounded-xl bg-white/70" />)}
          </div>
        )}
        {isError && (
          <p className="mt-10 rounded-xl border border-crimson/30 bg-white px-4 py-3 text-sm text-crimson">
            Could not load the catalogue — please refresh to retry.
          </p>
        )}

        {!isLoading && !isError && (
          <p className="mt-6 text-sm text-bordeaux/60">{products.length} product{products.length === 1 ? '' : 's'} found</p>
        )}

        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => <ProductCard key={p.slug} product={p} />)}
        </div>
      </div>
    </div>
  );
}
