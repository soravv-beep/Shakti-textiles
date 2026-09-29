import { useState } from 'react';
import { useAdminProducts, useAdminProductMutations } from '../../lib/api.js';
import { useToast } from '../../components/ui/Toast.jsx';
import Spinner from '../../components/ui/Spinner.jsx';

const CATEGORIES = ['Bathmat', 'Pillow', 'Pouf', 'Rug And Carpets', 'Throw'];

const BLANK = {
  name: '', category: CATEGORIES[0], shortDescription: '', description: '',
  specs: [{ label: 'Sizes', value: '' }], benefits: '', industries: '', certifications: '',
  tags: '', minOrderQty: '', featured: false, active: true, sortOrder: 0,
};

function specsToText(specs) {
  return (specs ?? []).map((r) => `${r.label}: ${r.value}`).join('\n');
}
function textToSpecs(text) {
  return String(text).split('\n').map((line) => {
    const idx = line.indexOf(':');
    if (idx === -1) return null;
    const label = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    return label && value ? { label, value } : null;
  }).filter(Boolean);
}

export default function AdminProducts() {
  const { data, isLoading } = useAdminProducts();
  const { create, update, remove } = useAdminProductMutations();
  const toast = useToast();
  const [editing, setEditing] = useState(null); // null | 'new' | product
  const [form, setForm] = useState(BLANK);
  const [specsText, setSpecsText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [currentImage, setCurrentImage] = useState('');

  const products = data?.data ?? [];

  function startNew() {
    setEditing('new');
    setForm(BLANK);
    setSpecsText('Sizes: \nMaterial: ');
    setImageFile(null);
    setCurrentImage('');
  }
  function startEdit(p) {
    setEditing(p);
    setForm({
      name: p.name, category: p.category, shortDescription: p.shortDescription || '',
      description: p.description || '', benefits: (p.benefits ?? []).join('\n'),
      industries: (p.industries ?? []).join(', '), certifications: (p.certifications ?? []).join(', '),
      tags: (p.tags ?? []).join(', '), minOrderQty: p.minOrderQty || '',
      featured: !!p.featured, active: p.active !== false, sortOrder: p.sortOrder ?? 0,
    });
    setSpecsText(specsToText(p.specs));
    setImageFile(null);
    setCurrentImage(p.image || '');
  }

  async function onSave(e) {
    e.preventDefault();
    const body = { ...form, specs: specsText };
    const files = imageFile ? { image: imageFile } : null;
    const mutation = editing === 'new' ? create : update;
    const id = editing === 'new' ? null : editing._id;

    // Image upload uses multipart; build FormData when a file is chosen.
    if (files) {
      const fd = new FormData();
      Object.entries(body).forEach(([k, v]) => {
        if (k === 'specs') fd.append('specs', JSON.stringify(textToSpecs(specsText)));
        else fd.append(k, v);
      });
      fd.append('image', imageFile);
      mutation.mutate(
        editing === 'new' ? { body: fd } : { id, body: fd },
        {
          onSuccess: () => { toast.success('Product saved.'); setEditing(null); },
          onError: (err) => toast.error(err.message || 'Save failed.'),
        },
      );
      return;
    }

    mutation.mutate(
      editing === 'new' ? { body } : { id, body },
      {
        onSuccess: () => { toast.success('Product saved.'); setEditing(null); },
        onError: (err) => toast.error(err.message || 'Save failed.'),
      },
    );
  }

  if (editing) {
    const isNew = editing === 'new';
    return (
      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold text-ruby">{isNew ? 'New product' : `Edit — ${editing.name}`}</h1>
        <form className="card mt-6 grid gap-4 p-6" onSubmit={onSave}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="pr-name">Name *</label>
              <input id="pr-name" className="field-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
            </div>
            <div>
              <label className="field-label" htmlFor="pr-category">Category *</label>
              <select id="pr-category" className="field-input" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="field-label" htmlFor="pr-short">Short description</label>
            <input id="pr-short" className="field-input" value={form.shortDescription} onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))} />
          </div>
          <div>
            <label className="field-label" htmlFor="pr-desc">Full description</label>
            <textarea id="pr-desc" rows={3} className="field-input" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <div>
            <label className="field-label" htmlFor="pr-specs">Spec table (one per line — “Label: Value”)</label>
            <textarea id="pr-specs" rows={5} className="field-input font-mono text-xs" value={specsText} onChange={(e) => setSpecsText(e.target.value)} />
          </div>
          <div>
            <label className="field-label" htmlFor="pr-benefits">Benefits (one per line)</label>
            <textarea id="pr-benefits" rows={3} className="field-input" value={form.benefits} onChange={(e) => setForm((f) => ({ ...f, benefits: e.target.value }))} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="pr-industries">Industries (comma separated)</label>
              <input id="pr-industries" className="field-input" value={form.industries} onChange={(e) => setForm((f) => ({ ...f, industries: e.target.value }))} />
            </div>
            <div>
              <label className="field-label" htmlFor="pr-certs">Certifications (comma separated)</label>
              <input id="pr-certs" className="field-input" value={form.certifications} onChange={(e) => setForm((f) => ({ ...f, certifications: e.target.value }))} />
            </div>
            <div>
              <label className="field-label" htmlFor="pr-tags">Tags (comma separated)</label>
              <input id="pr-tags" className="field-input" value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} />
            </div>
            <div>
              <label className="field-label" htmlFor="pr-moq">Minimum order quantity</label>
              <input id="pr-moq" className="field-input" value={form.minOrderQty} onChange={(e) => setForm((f) => ({ ...f, minOrderQty: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="field-label" htmlFor="pr-image">Product image (PNG/JPG/WebP/SVG ≤ 5 MB)</label>
            <input id="pr-image" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="field-input"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
            {currentImage && !imageFile && (
              <div className="mt-3 flex items-center gap-3">
                <img src={currentImage} alt="Current product" className="h-14 w-20 rounded-lg border border-bordeaux/15 object-cover" />
                <span className="text-xs text-bordeaux/60">Current image — upload a new file to replace</span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm text-bordeaux">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} />
              Featured on homepage
            </label>
            <label className="flex items-center gap-2 text-sm text-bordeaux">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />
              Active
            </label>
            <label className="flex items-center gap-2 text-sm text-bordeaux">
              Sort order
              <input type="number" className="field-input !w-24 !py-1.5" value={form.sortOrder}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))} />
            </label>
          </div>
          <div className="mt-2 flex gap-3">
            <button type="submit" disabled={create.isPending || update.isPending} className="btn-primary">
              {(create.isPending || update.isPending) && <Spinner light />}
              {isNew ? 'Create product' : 'Save changes'}
            </button>
            <button type="button" onClick={() => setEditing(null)} className="btn-ghost">Cancel</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ruby">Products</h1>
          <p className="mt-1 text-sm text-bordeaux/70">{products.length} in catalogue</p>
        </div>
        <button onClick={startNew} className="btn-primary">+ New product</button>
      </div>

      {isLoading && <div className="mt-8 h-40 animate-pulse rounded-xl bg-white/70" />}

      <div className="mt-6 overflow-x-auto rounded-xl border border-bordeaux/10 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-bordeaux/10 text-xs uppercase tracking-wider text-bordeaux/50">
              <th className="px-5 py-3">Product</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Certs</th>
              <th className="px-5 py-3">Flags</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id} className="border-b border-bordeaux/5 last:border-0">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    {p.image
                      ? <img src={p.image} alt="" className="h-10 w-14 shrink-0 rounded-md border border-bordeaux/10 object-cover" />
                      : <div className="h-10 w-14 shrink-0 rounded-md bg-gradient-to-br from-ruby to-bordeaux" />}
                    <span className="font-semibold text-bordeaux">{p.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-bordeaux/75">{p.category}</td>
                <td className="px-5 py-3 text-bordeaux/75">{(p.certifications ?? []).join(', ') || '—'}</td>
                <td className="px-5 py-3">
                  <span className="mr-1.5 inline-flex rounded-full bg-blush px-2 py-0.5 text-[10px] font-bold">{p.featured ? 'FEATURED' : ''}{p.active === false ? 'HIDDEN' : ''}</span>
                </td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => startEdit(p)} className="font-semibold text-ruby hover:underline">Edit</button>
                  <button
                    onClick={() => { if (window.confirm(`Delete “${p.name}”? This cannot be undone.`)) remove.mutate(p._id, { onError: (e) => toast.error(e.message) }); }}
                    className="ml-4 font-semibold text-crimson hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && !products.length && <p className="px-5 py-8 text-center text-sm text-bordeaux/60">No products yet.</p>}
      </div>
    </div>
  );
}
