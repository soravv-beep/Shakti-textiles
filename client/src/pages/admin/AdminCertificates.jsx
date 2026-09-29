import { useState } from 'react';
import { useAdminCertificates, useAdminCertificateMutations } from '../../lib/api.js';
import { useToast } from '../../components/ui/Toast.jsx';

const BASE = import.meta.env.VITE_API_URL || '';

export default function AdminCertificates() {
  const { data, isLoading } = useAdminCertificates();
  const { upsert } = useAdminCertificateMutations();
  const toast = useToast();
  const [drafts, setDrafts] = useState({});
  const [files, setFiles] = useState({});

  const certificates = data?.data ?? [];

  function setDraft(key, field, value) {
    setDrafts((d) => ({ ...d, [key]: { ...(d[key] ?? certificates.find((c) => c.key === key)), [field]: value } }));
  }

  function save(cert) {
    const body = {
      name: drafts[cert.key]?.name ?? cert.name,
      description: drafts[cert.key]?.description ?? cert.description,
      fileUrl: cert.fileUrl || '',
      fileName: cert.fileName || '',
    };
    const file = files[cert.key];

    const finish = (extra) => {
      upsert.mutate(
        { key: cert.key, body: { ...body, ...extra } },
        {
          onSuccess: () => toast.success('Certificate saved.'),
          onError: (err) => toast.error(err.message || 'Save failed.'),
        },
      );
    };

    if (file) {
      // Upload PDF first, then link it to this certificate record.
      const fd = new FormData();
      fd.append('file', file);
      fetch(`${BASE}/api/admin/uploads/certificate`, { method: 'POST', body: fd, credentials: 'include' })
        .then((r) => (r.ok ? r.json() : r.json().then((j) => Promise.reject(new Error(j.message || 'Upload failed')))))
        .then((resp) => finish({ fileUrl: resp.data.url, fileName: file.name }))
        .catch((err) => toast.error(err.message));
      return;
    }
    finish({});
  }

  async function clearFile(cert) {
    if (!window.confirm('Remove the linked PDF?')) return;
    upsert.mutate(
      { key: cert.key, body: { name: cert.name, description: cert.description, fileUrl: '', fileName: '' } },
      { onSuccess: () => toast.success('PDF removed.'), onError: (e) => toast.error(e.message) },
    );
  }

  if (isLoading) return <div className="h-40 animate-pulse rounded-xl bg-white/70" />;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-ruby">Certificates</h1>
      <p className="mt-1 text-sm text-bordeaux/70">Upload current PDFs — buyers download them from the homepage compliance grid.</p>
      <div className="mt-6 space-y-4">
        {certificates.map((c) => (
          <div key={c.key} className="card p-5">
            <div className="flex items-center justify-between">
              <span className="pill">{c.key}</span>
              {c.fileUrl ? (
                <a href={`${BASE}${c.fileUrl}`} target="_blank" rel="noreferrer" className="text-xs font-semibold text-ruby hover:underline">
                  View current PDF ↗
                </a>
              ) : (
                <span className="text-xs text-bordeaux/50">No PDF uploaded</span>
              )}
            </div>
            <div className="mt-4 grid gap-4">
              <div>
                <label className="field-label">Name</label>
                <input className="field-input" value={drafts[c.key]?.name ?? c.name} onChange={(e) => setDraft(c.key, 'name', e.target.value)} />
              </div>
              <div>
                <label className="field-label">One-line description</label>
                <input className="field-input" value={drafts[c.key]?.description ?? c.description} onChange={(e) => setDraft(c.key, 'description', e.target.value)} />
              </div>
              <div>
                <label className="field-label">Replace PDF</label>
                <input type="file" accept="application/pdf" className="field-input"
                  onChange={(e) => setFiles((f) => ({ ...f, [c.key]: e.target.files?.[0] || null }))} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4">
              <button onClick={() => save(c)} disabled={upsert.isPending} className="btn-primary !py-2 text-sm">Save</button>
              {c.fileUrl && (
                <button onClick={() => clearFile(c)} className="text-sm font-semibold text-crimson hover:underline">Remove PDF</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
