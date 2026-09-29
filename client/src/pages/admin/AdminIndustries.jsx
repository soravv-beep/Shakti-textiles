import { useState } from 'react';
import { useAdminIndustries, useAdminIndustryMutations } from '../../lib/api.js';
import { useToast } from '../../components/ui/Toast.jsx';
import Spinner from '../../components/ui/Spinner.jsx';

/* Manage the homepage / industries-page explorer:
   Industry → sub-industry → applications. */

const BLANK_IND = { name: '', description: '', sortOrder: 0 };

export default function AdminIndustries() {
  const { data, isLoading } = useAdminIndustries();
  const { create, update, remove } = useAdminIndustryMutations();
  const toast = useToast();
  const [openId, setOpenId] = useState(null);
  const [draft, setDraft] = useState(null); // { _id? , name, description, sortOrder, subIndustries: [{name, applications:[{name,note}]}] }

  const industries = data?.data ?? [];
  const busy = create.isPending || update.isPending;

  function startNew() {
    setOpenId(null);
    setDraft({ ...BLANK_IND, subIndustries: [] });
  }
  function startEdit(ind) {
    setOpenId(null);
    setDraft({
      _id: ind._id,
      name: ind.name,
      description: ind.description || '',
      sortOrder: ind.sortOrder ?? 0,
      subIndustries: (ind.subIndustries ?? []).map((s) => ({
        name: s.name,
        applications: (s.applications ?? []).map((a) => ({ name: a.name, note: a.note || '' })),
      })),
    });
  }

  function patchSub(i, patch) {
    setDraft((d) => ({ ...d, subIndustries: d.subIndustries.map((s, j) => (j === i ? { ...s, ...patch } : s)) }));
  }
  function patchApp(si, ai, patch) {
    setDraft((d) => ({
      ...d,
      subIndustries: d.subIndustries.map((s, j) =>
        j === si ? { ...s, applications: s.applications.map((a, k) => (k === ai ? { ...a, ...patch } : a)) } : s),
    }));
  }

  function onSave(e) {
    e.preventDefault();
    const body = {
      name: draft.name,
      description: draft.description,
      sortOrder: draft.sortOrder,
      subIndustries: draft.subIndustries,
    };
    const opts = {
      onSuccess: () => { toast.success('Industry saved.'); setDraft(null); },
      onError: (err) => toast.error(err.message || 'Save failed.'),
    };
    if (draft._id) update.mutate({ id: draft._id, body }, opts);
    else create.mutate(body, opts);
  }

  if (draft) {
    return (
      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold text-ruby">{draft._id ? `Edit — ${draft.name}` : 'New industry'}</h1>
        <p className="mt-1 text-sm text-bordeaux/70">
          This powers the “Industries & applications” explorer on the homepage and Industries page.
        </p>
        <form className="card mt-6 grid gap-4 p-6" onSubmit={onSave}>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="in-name">Industry name *</label>
              <input id="in-name" className="field-input" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} required />
            </div>
            <div>
              <label className="field-label" htmlFor="in-sort">Sort order</label>
              <input id="in-sort" type="number" className="field-input" value={draft.sortOrder} onChange={(e) => setDraft((d) => ({ ...d, sortOrder: Number(e.target.value) }))} />
            </div>
          </div>
          <div>
            <label className="field-label" htmlFor="in-desc">Description</label>
            <textarea id="in-desc" rows={2} className="field-input" value={draft.description} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="field-label">Segments (sub-industries)</label>
              <button type="button" onClick={() => setDraft((d) => ({ ...d, subIndustries: [...d.subIndustries, { name: '', applications: [] }] }))}
                className="text-xs font-semibold text-ruby hover:underline">+ Add segment</button>
            </div>
            <div className="mt-2 space-y-3">
              {draft.subIndustries.map((s, i) => (
                <div key={i} className="rounded-lg border border-bordeaux/15 bg-blush p-3">
                  <div className="flex items-center gap-2">
                    <input className="field-input !py-1.5 text-sm" placeholder="Segment name e.g. Hotels & Resorts"
                      value={s.name} onChange={(e) => patchSub(i, { name: e.target.value })} />
                    <button type="button" aria-label="Remove segment"
                      onClick={() => setDraft((d) => ({ ...d, subIndustries: d.subIndustries.filter((_, j) => j !== i) }))}
                      className="px-2 text-lg leading-none text-crimson hover:text-ruby">×</button>
                  </div>
                  <div className="mt-2 space-y-2">
                    {s.applications.map((a, ai) => (
                      <div key={ai} className="flex items-center gap-2">
                        <input className="field-input !py-1 text-xs" placeholder="Application e.g. Guest-bathroom bath mats"
                          value={a.name} onChange={(e) => patchApp(i, ai, { name: e.target.value })} />
                        <input className="field-input !py-1 text-xs" placeholder="Note (optional)"
                          value={a.note} onChange={(e) => patchApp(i, ai, { note: e.target.value })} />
                        <button type="button" aria-label="Remove application"
                          onClick={() => patchSub(i, { applications: s.applications.filter((_, k) => k !== ai) })}
                          className="px-1.5 text-crimson hover:text-ruby">×</button>
                      </div>
                    ))}
                    <button type="button" onClick={() => patchSub(i, { applications: [...s.applications, { name: '', note: '' }] })}
                      className="text-xs font-semibold text-ruby hover:underline">+ Add application</button>
                  </div>
                </div>
              ))}
              {!draft.subIndustries.length && <p className="text-xs text-bordeaux/50">No segments yet — add one above.</p>}
            </div>
          </div>

          <div className="mt-2 flex gap-3">
            <button type="submit" disabled={busy} className="btn-primary">
              {busy && <Spinner light />}
              {draft._id ? 'Save changes' : 'Create industry'}
            </button>
            <button type="button" onClick={() => setDraft(null)} className="btn-ghost">Cancel</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ruby">Industries</h1>
          <p className="mt-1 text-sm text-bordeaux/70">Homepage explorer content — industry → segments → applications.</p>
        </div>
        <button onClick={startNew} className="btn-primary">+ New industry</button>
      </div>

      {isLoading && <div className="mt-8 h-40 animate-pulse rounded-xl bg-white/70" />}

      <div className="mt-6 space-y-3">
        {industries.map((ind) => (
          <div key={ind._id} className="card px-5 py-4">
            <button className="flex w-full items-center gap-3 text-left" onClick={() => setOpenId(openId === ind._id ? null : ind._id)} aria-expanded={openId === ind._id}>
              <span className="font-bold text-bordeaux">{ind.name}</span>
              <span className="text-xs text-bordeaux/50">#{ind.sortOrder}</span>
              <span className="ml-auto text-xs text-bordeaux/55">{ind.subIndustries?.length ?? 0} segments</span>
            </button>
            {openId === ind._id && (
              <div className="mt-3 border-t border-bordeaux/10 pt-3 text-sm">
                <p className="text-bordeaux/75">{ind.description || '—'}</p>
                <ul className="mt-2 space-y-1 text-xs text-bordeaux/65">
                  {(ind.subIndustries ?? []).map((s) => (
                    <li key={s.name}>• {s.name} — {(s.applications ?? []).map((a) => a.name).join(', ')}</li>
                  ))}
                </ul>
                <div className="mt-3 flex gap-3">
                  <button onClick={() => startEdit(ind)} className="font-semibold text-ruby hover:underline">Edit</button>
                  <button
                    onClick={() => { if (window.confirm(`Delete “${ind.name}”? This cannot be undone.`)) remove.mutate(ind._id, { onError: (e) => toast.error(e.message) }); }}
                    className="font-semibold text-crimson hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {!isLoading && !industries.length && <p className="card px-5 py-8 text-center text-sm text-bordeaux/60">No industries yet.</p>}
      </div>
    </div>
  );
}
