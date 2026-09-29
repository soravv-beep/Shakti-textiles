import { useState } from 'react';
import { useAdminEnquiries, useUpdateEnquiry, useDeleteEnquiry } from '../../lib/api.js';
import Spinner from '../../components/ui/Spinner.jsx';
import { useToast } from '../../components/ui/Toast.jsx';

const STATUSES = ['ALL', 'NEW', 'CONTACTED', 'QUOTED', 'CLOSED'];

export default function AdminEnquiries() {
  const [status, setStatus] = useState('ALL');
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState(null);
  const { data, isLoading } = useAdminEnquiries({ status: status === 'ALL' ? '' : status, q });
  const update = useUpdateEnquiry();
  const remove = useDeleteEnquiry();
  const toast = useToast();

  const enquiries = data?.data ?? [];
  const counts = data?.counts ?? {};

  return (
    <div>
      <h1 className="text-2xl font-bold text-ruby">Enquiry inbox</h1>
      <p className="mt-1 text-sm text-bordeaux/70">Sample and quote requests from the website, newest first.</p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            aria-pressed={status === s}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              status === s ? 'bg-ruby text-white' : 'border border-bordeaux/20 bg-white text-bordeaux hover:border-ruby hover:text-ruby'
            }`}
          >
            {s}{s !== 'ALL' && ` (${counts[s] ?? 0})`}
          </button>
        ))}
        <input
          className="field-input ml-auto max-w-xs"
          placeholder="Search name, email, company, product…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search enquiries"
        />
      </div>

      {isLoading && <div className="mt-8 h-40 animate-pulse rounded-xl bg-white/70" />}

      <div className="mt-6 space-y-3">
        {enquiries.map((enq) => (
          <div key={enq._id} className="card overflow-hidden">
            <button
              className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 px-5 py-4 text-left hover:bg-blush/40"
              onClick={() => setOpenId(openId === enq._id ? null : enq._id)}
              aria-expanded={openId === enq._id}
            >
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide ${enq.status === 'NEW' ? 'bg-crimson text-white' : 'bg-blush text-bordeaux'}`}>
                {enq.status}
              </span>
              <span className="font-semibold text-bordeaux">{enq.name}</span>
              <span className="text-sm text-bordeaux/60">{enq.company || '—'}</span>
              <span className="ml-auto text-xs text-bordeaux/50 tabular">
                {new Date(enq.createdAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
              </span>
            </button>
            {openId === enq._id && (
              <div className="border-t border-bordeaux/10 bg-white px-5 py-4 text-sm">
                <dl className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
                  <div><dt className="text-bordeaux/50">Email</dt><dd><a className="text-ruby hover:underline" href={`mailto:${enq.email}`}>{enq.email}</a></dd></div>
                  <div><dt className="text-bordeaux/50">Phone</dt><dd className="tabular text-bordeaux">{enq.phone || '—'}</dd></div>
                  <div><dt className="text-bordeaux/50">Product</dt><dd className="text-bordeaux">{enq.product || '—'}</dd></div>
                  <div><dt className="text-bordeaux/50">Quantity</dt><dd className="tabular text-bordeaux">{enq.quantity || '—'}</dd></div>
                  <div className="sm:col-span-2"><dt className="text-bordeaux/50">Message</dt><dd className="text-bordeaux">{enq.message || '—'}</dd></div>
                </dl>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-bordeaux/50">Set status</span>
                  {STATUSES.slice(1).map((s) => (
                    <button
                      key={s}
                      onClick={() => update.mutate({ id: enq._id, status: s })}
                      disabled={update.isPending}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                        enq.status === s ? 'bg-ruby text-white' : 'border border-bordeaux/20 text-bordeaux hover:border-ruby hover:text-ruby'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                  {update.isPending && <Spinner className="h-3.5 w-3.5" />}
                  <button
                    onClick={() => { if (window.confirm(`Delete the enquiry from “${enq.name}”? This cannot be undone.`)) remove.mutate(enq._id, { onError: (e) => toast.error(e.message) }); }}
                    className="ml-auto rounded-full border border-crimson/30 px-3 py-1 text-xs font-semibold text-crimson transition-colors hover:bg-crimson hover:text-white"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {!isLoading && !enquiries.length && (
          <p className="card px-5 py-8 text-center text-sm text-bordeaux/60">No enquiries match this filter.</p>
        )}
      </div>
    </div>
  );
}
