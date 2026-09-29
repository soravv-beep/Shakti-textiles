import { useState } from 'react';
import { useAdminTestimonials, useAdminTestimonialMutations } from '../../lib/api.js';
import { useToast } from '../../components/ui/Toast.jsx';
import Spinner from '../../components/ui/Spinner.jsx';

const BLANK = { quote: '', name: '', role: '', company: '', city: '' };

export default function AdminTestimonials() {
  const { data, isLoading } = useAdminTestimonials();
  const { create, remove } = useAdminTestimonialMutations();
  const toast = useToast();
  const [form, setForm] = useState(BLANK);
  const [adding, setAdding] = useState(false);

  const testimonials = data?.data ?? [];

  function onAdd(e) {
    e.preventDefault();
    create.mutate(form, {
      onSuccess: () => { toast.success('Testimonial added.'); setForm(BLANK); setAdding(false); },
      onError: (err) => toast.error(err.message || 'Could not add testimonial.'),
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ruby">Testimonials</h1>
          <p className="mt-1 text-sm text-bordeaux/70">{testimonials.length} published</p>
        </div>
        <button onClick={() => setAdding(!adding)} className="btn-primary">{adding ? 'Close' : '+ Add'}</button>
      </div>

      {adding && (
        <form className="card mt-6 grid gap-4 p-6" onSubmit={onAdd}>
          <div>
            <label className="field-label" htmlFor="ts-quote">Quote *</label>
            <textarea id="ts-quote" rows={3} className="field-input" value={form.quote} onChange={(e) => setForm((f) => ({ ...f, quote: e.target.value }))} required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="ts-name">Name *</label>
              <input id="ts-name" className="field-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
            </div>
            <div>
              <label className="field-label" htmlFor="ts-role">Role *</label>
              <input id="ts-role" className="field-input" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} required />
            </div>
            <div>
              <label className="field-label" htmlFor="ts-company">Company *</label>
              <input id="ts-company" className="field-input" value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} required />
            </div>
            <div>
              <label className="field-label" htmlFor="ts-city">City</label>
              <input id="ts-city" className="field-input" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
            </div>
          </div>
          <button type="submit" disabled={create.isPending} className="btn-primary w-fit">
            {create.isPending && <Spinner light />} Add testimonial
          </button>
        </form>
      )}

      {isLoading && <div className="mt-8 h-40 animate-pulse rounded-xl bg-white/70" />}

      <div className="mt-6 space-y-3">
        {testimonials.map((t) => (
          <div key={t._id} className="card p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm leading-relaxed text-bordeaux">“{t.quote}”</p>
                <p className="mt-2 text-sm font-bold text-bordeaux">{t.name} <span className="font-medium text-ruby">· {t.role}, {t.company}</span> {t.city && <span className="text-bordeaux/50">· {t.city}</span>}</p>
              </div>
              <button
                onClick={() => { if (window.confirm('Delete this testimonial?')) remove.mutate(t._id, { onError: (e) => toast.error(e.message) }); }}
                className="shrink-0 text-sm font-semibold text-crimson hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {!isLoading && !testimonials.length && <p className="card px-5 py-8 text-center text-sm text-bordeaux/60">No testimonials yet.</p>}
      </div>
    </div>
  );
}
