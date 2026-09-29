import { useState } from 'react';
import { useAdminHeroSlides, useAdminHeroSlideMutations } from '../../lib/api.js';
import { useToast } from '../../components/ui/Toast.jsx';
import Spinner from '../../components/ui/Spinner.jsx';

const BLANK = {
  img: '', alt: '', eyebrow: '', line1: '', line2: '', desc: '',
  ctaLabel: 'Explore Collection', ctaTo: '/products',
  secondaryLabel: '', secondaryTo: '',
  sortOrder: 0, active: true,
};

export default function AdminHero() {
  const { data, isLoading } = useAdminHeroSlides();
  const { create, update, remove } = useAdminHeroSlideMutations();
  const toast = useToast();
  const [editing, setEditing] = useState(null); // null | 'new' | slide
  const [form, setForm] = useState(BLANK);
  const [imageFile, setImageFile] = useState(null);

  const slides = data?.data ?? [];
  const busy = create.isPending || update.isPending;

  function startNew() {
    setEditing('new');
    setForm({ ...BLANK, sortOrder: (slides.length ? Math.max(...slides.map((s) => s.sortOrder ?? 0)) : 0) + 1 });
    setImageFile(null);
  }
  function startEdit(s) {
    setEditing(s);
    setForm({
      img: s.img || '', alt: s.alt || '', eyebrow: s.eyebrow || '', line1: s.line1 || '',
      line2: s.line2 || '', desc: s.desc || '', ctaLabel: s.ctaLabel || 'Explore Collection',
      ctaTo: s.ctaTo || '/products', secondaryLabel: s.secondaryLabel || '',
      secondaryTo: s.secondaryTo || '', sortOrder: s.sortOrder ?? 0, active: s.active !== false,
    });
    setImageFile(null);
  }

  function buildBody() {
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, k === 'sortOrder' || k === 'active' ? String(v) : v));
    if (imageFile) fd.append('image', imageFile);
    return fd;
  }

  function onSave(e) {
    e.preventDefault();
    const body = buildBody();
    const opts = {
      onSuccess: () => { toast.success('Slide saved.'); setEditing(null); },
      onError: (err) => toast.error(err.message || 'Save failed.'),
    };
    if (editing === 'new') create.mutate({ body }, opts);
    else update.mutate({ id: editing._id, body }, opts);
  }

  if (editing) {
    const isNew = editing === 'new';
    return (
      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold text-ruby">{isNew ? 'New hero slide' : 'Edit hero slide'}</h1>
        <p className="mt-1 text-sm text-bordeaux/70">
          Homepage hero slider. Lines render big — keep line1/line2 short.
        </p>
        <form className="card mt-6 grid gap-4 p-6" onSubmit={onSave}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="hs-eyebrow">Eyebrow (small top line)</label>
              <input id="hs-eyebrow" className="field-input" value={form.eyebrow} onChange={(e) => setForm((f) => ({ ...f, eyebrow: e.target.value }))} />
            </div>
            <div>
              <label className="field-label" htmlFor="hs-sort">Sort order</label>
              <input id="hs-sort" type="number" className="field-input" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="hs-line1">Headline line 1</label>
              <input id="hs-line1" className="field-input" value={form.line1} onChange={(e) => setForm((f) => ({ ...f, line1: e.target.value }))} />
            </div>
            <div>
              <label className="field-label" htmlFor="hs-line2">Headline line 2</label>
              <input id="hs-line2" className="field-input" value={form.line2} onChange={(e) => setForm((f) => ({ ...f, line2: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="field-label" htmlFor="hs-desc">Description</label>
            <textarea id="hs-desc" rows={3} className="field-input" value={form.desc} onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="hs-cta">CTA button label</label>
              <input id="hs-cta" className="field-input" value={form.ctaLabel} onChange={(e) => setForm((f) => ({ ...f, ctaLabel: e.target.value }))} />
            </div>
            <div>
              <label className="field-label" htmlFor="hs-cta-to">CTA link (e.g. /products)</label>
              <input id="hs-cta-to" className="field-input" value={form.ctaTo} onChange={(e) => setForm((f) => ({ ...f, ctaTo: e.target.value }))} />
            </div>
            <div>
              <label className="field-label" htmlFor="hs-sec">Secondary link label (optional)</label>
              <input id="hs-sec" className="field-input" value={form.secondaryLabel} onChange={(e) => setForm((f) => ({ ...f, secondaryLabel: e.target.value }))} />
            </div>
            <div>
              <label className="field-label" htmlFor="hs-sec-to">Secondary link target</label>
              <input id="hs-sec-to" className="field-input" value={form.secondaryTo} onChange={(e) => setForm((f) => ({ ...f, secondaryTo: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="field-label" htmlFor="hs-alt">Image alt text (accessibility)</label>
            <input id="hs-alt" className="field-input" value={form.alt} onChange={(e) => setForm((f) => ({ ...f, alt: e.target.value }))} />
          </div>
          <div>
            <label className="field-label" htmlFor="hs-image">Background image (JPG/PNG/WebP ≤ 5 MB)</label>
            <input id="hs-image" type="file" accept="image/png,image/jpeg,image/webp" className="field-input"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
            {form.img && !imageFile && (
              <div className="mt-3 flex items-center gap-3">
                <img src={form.img} alt="Current slide" className="h-16 w-28 rounded-lg border border-bordeaux/15 object-cover" />
                <span className="text-xs text-bordeaux/60">Current image — upload a new file to replace</span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm text-bordeaux">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />
              Active (visible on homepage)
            </label>
          </div>
          <div className="mt-2 flex gap-3">
            <button type="submit" disabled={busy} className="btn-primary">
              {busy && <Spinner light />}
              {isNew ? 'Create slide' : 'Save changes'}
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
          <h1 className="text-2xl font-bold text-ruby">Hero slides</h1>
          <p className="mt-1 text-sm text-bordeaux/70">The big slider at the top of the homepage.</p>
        </div>
        <button onClick={startNew} className="btn-primary">+ New slide</button>
      </div>

      {isLoading && <div className="mt-8 h-40 animate-pulse rounded-xl bg-white/70" />}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {slides.map((s) => (
          <div key={s._id} className={`card overflow-hidden ${s.active === false ? 'opacity-60' : ''}`}>
            <img src={s.img} alt={s.alt || s.line1 || 'Slide'} className="h-36 w-full object-cover" />
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-ruby">{s.eyebrow}</p>
                  <p className="font-bold text-bordeaux">{s.line1} {s.line2}</p>
                </div>
                {s.active === false && <span className="rounded-full bg-blush px-2 py-0.5 text-[10px] font-bold text-bordeaux">HIDDEN</span>}
              </div>
              <p className="mt-1.5 line-clamp-2 text-xs text-bordeaux/70">{s.desc}</p>
              <div className="mt-3 flex items-center gap-3 text-sm">
                <span className="text-xs text-bordeaux/50">#{s.sortOrder}</span>
                <button onClick={() => startEdit(s)} className="font-semibold text-ruby hover:underline">Edit</button>
                <button
                  onClick={() => { if (window.confirm('Delete this slide? This cannot be undone.')) remove.mutate(s._id, { onError: (e) => toast.error(e.message) }); }}
                  className="font-semibold text-crimson hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {!isLoading && !slides.length && <p className="card px-5 py-8 text-center text-sm text-bordeaux/60">No slides yet.</p>}
      </div>
    </div>
  );
}
