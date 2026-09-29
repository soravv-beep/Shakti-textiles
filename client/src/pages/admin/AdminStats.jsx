import { useEffect, useState } from 'react';
import { useAdminStats, useAdminStatMutations } from '../../lib/api.js';
import { useToast } from '../../components/ui/Toast.jsx';
import Spinner from '../../components/ui/Spinner.jsx';

export default function AdminStats() {
  const { data, isLoading } = useAdminStats();
  const { update } = useAdminStatMutations();
  const toast = useToast();
  const [drafts, setDrafts] = useState({});

  const stats = data?.data ?? [];

  useEffect(() => {
    setDrafts(Object.fromEntries(stats.map((s) => [s.key, { value: s.value, suffix: s.suffix || '', label: s.label, caption: s.caption || '' }])));
  }, [data]);

  function save(key) {
    update.mutate(
      { key, body: drafts[key] },
      {
        onSuccess: () => toast.success('Stat updated — live on the homepage.'),
        onError: (err) => toast.error(err.message || 'Update failed.'),
      },
    );
  }

  function setDraft(key, field, value) {
    setDrafts((d) => ({ ...d, [key]: { ...d[key], [field]: field === 'value' ? Number(value) : value } }));
  }

  if (isLoading) return <div className="h-40 animate-pulse rounded-xl bg-white/70" />;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-ruby">Stat strip</h1>
      <p className="mt-1 text-sm text-bordeaux/70">The four homepage numbers. Keep them honest — buyers check.</p>
      <div className="mt-6 space-y-4">
        {stats.map((s) => (
          <div key={s.key} className="card p-5">
            <div className="grid gap-4 sm:grid-cols-[110px_90px_1fr]">
              <div>
                <label className="field-label">Value</label>
                <input type="number" className="field-input tabular" value={drafts[s.key]?.value ?? s.value}
                  onChange={(e) => setDraft(s.key, 'value', e.target.value)} />
              </div>
              <div>
                <label className="field-label">Suffix</label>
                <input className="field-input" value={drafts[s.key]?.suffix ?? s.suffix} placeholder="+ / %"
                  onChange={(e) => setDraft(s.key, 'suffix', e.target.value)} />
              </div>
              <div>
                <label className="field-label">Label</label>
                <input className="field-input" value={drafts[s.key]?.label ?? s.label}
                  onChange={(e) => setDraft(s.key, 'label', e.target.value)} />
              </div>
            </div>
            <div className="mt-4">
              <label className="field-label">Caption</label>
              <input className="field-input" value={drafts[s.key]?.caption ?? s.caption}
                onChange={(e) => setDraft(s.key, 'caption', e.target.value)} />
            </div>
            <div className="mt-4 flex items-center gap-3">
              <button onClick={() => save(s.key)} disabled={update.isPending} className="btn-primary !py-2 text-sm">
                {update.isPending && <Spinner light />} Save
              </button>
              <span className="text-xs text-bordeaux/50">key: {s.key}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
