import { useState } from 'react';
import { useAdminMe, useAdminAccounts, useAdminAccountMutations } from '../../lib/api.js';
import Spinner from '../../components/ui/Spinner.jsx';
import { useToast } from '../../components/ui/Toast.jsx';

const inputCls = 'field-input w-full';

export default function AdminAccounts() {
  const { data: meData } = useAdminMe();
  const me = meData?.data;
  const { data, isLoading } = useAdminAccounts();
  const { create, changeOwnPassword, resetPassword, remove } = useAdminAccountMutations();
  const toast = useToast();

  const accounts = data?.data ?? [];

  /* New account form */
  const [showNew, setShowNew] = useState(false);
  const [newAcc, setNewAcc] = useState({ name: '', email: '', password: '', confirm: '' });
  const [newErr, setNewErr] = useState('');

  /* Change own password */
  const [own, setOwn] = useState({ current: '', next: '', confirm: '' });
  const [ownErr, setOwnErr] = useState('');

  /* Reset a colleague's password (keyed by account id) */
  const [resetId, setResetId] = useState(null);
  const [resetPw, setResetPw] = useState({ next: '', confirm: '' });
  const [resetErr, setResetErr] = useState('');

  function resetNewForm() {
    setNewAcc({ name: '', email: '', password: '', confirm: '' });
    setNewErr('');
    setShowNew(false);
  }

  function submitNew(e) {
    e.preventDefault();
    setNewErr('');
    if (newAcc.password !== newAcc.confirm) return setNewErr('Passwords do not match.');
    create.mutate(
      { name: newAcc.name, email: newAcc.email, password: newAcc.password },
      {
        onSuccess: () => {
          toast.success(`Admin account created for ${newAcc.email.trim()}.`);
          resetNewForm();
        },
        onError: (err) => setNewErr(err.message || 'Could not create the account.'),
      },
    );
  }

  function submitOwnPassword(e) {
    e.preventDefault();
    setOwnErr('');
    if (own.next !== own.confirm) return setOwnErr('New passwords do not match.');
    changeOwnPassword.mutate(
      { currentPassword: own.current, newPassword: own.next },
      {
        onSuccess: () => {
          toast.success('Your password has been updated.');
          setOwn({ current: '', next: '', confirm: '' });
        },
        onError: (err) => setOwnErr(err.message || 'Could not update the password.'),
      },
    );
  }

  function submitReset(e, acc) {
    e.preventDefault();
    setResetErr('');
    if (resetPw.next !== resetPw.confirm) return setResetErr('New passwords do not match.');
    resetPassword.mutate(
      { id: acc._id, body: { newPassword: resetPw.next } },
      {
        onSuccess: () => {
          toast.success(`Password reset for ${acc.email}.`);
          setResetId(null);
          setResetPw({ next: '', confirm: '' });
        },
        onError: (err) => setResetErr(err.message || 'Could not reset the password.'),
      },
    );
  }

  function onDelete(acc) {
    if (!window.confirm(`Delete the admin account “${acc.email}”? This cannot be undone.`)) return;
    remove.mutate(acc._id, { onError: (err) => toast.error(err.message) });
  }

  const rowPending = (acc) => (remove.isPending && remove.variables === acc._id) || (resetPassword.isPending && resetPassword.variables?.id === acc._id);

  return (
    <div>
      <h1 className="text-2xl font-bold text-ruby">Admin accounts</h1>
      <p className="mt-1 text-sm text-bordeaux/70">Add teammates, reset passwords and manage who can sign in to this console.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* ── Change own password ── */}
        <section className="card p-6">
          <h2 className="text-lg font-semibold text-bordeaux">Change my password</h2>
          <p className="mt-1 text-sm text-bordeaux/60">Signed in as <span className="font-semibold text-ruby">{me?.email}</span></p>
          <form className="mt-4 grid gap-3" onSubmit={submitOwnPassword}>
            <div>
              <label className="field-label" htmlFor="own-current">Current password</label>
              <input id="own-current" type="password" className={inputCls} autoComplete="current-password"
                value={own.current} onChange={(e) => setOwn((v) => ({ ...v, current: e.target.value }))} required />
            </div>
            <div>
              <label className="field-label" htmlFor="own-next">New password (min 8 chars)</label>
              <input id="own-next" type="password" className={inputCls} autoComplete="new-password" minLength={8}
                value={own.next} onChange={(e) => setOwn((v) => ({ ...v, next: e.target.value }))} required />
            </div>
            <div>
              <label className="field-label" htmlFor="own-confirm">Confirm new password</label>
              <input id="own-confirm" type="password" className={inputCls} autoComplete="new-password" minLength={8}
                value={own.confirm} onChange={(e) => setOwn((v) => ({ ...v, confirm: e.target.value }))} required />
            </div>
            {ownErr && <p className="field-error">{ownErr}</p>}
            <button type="submit" disabled={changeOwnPassword.isPending} className="btn-primary justify-self-start disabled:opacity-70">
              {changeOwnPassword.isPending && <Spinner light />}
              {changeOwnPassword.isPending ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </section>

        {/* ── Add new admin ── */}
        <section className="card p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-bordeaux">Add new admin</h2>
              <p className="mt-1 text-sm text-bordeaux/60">They can sign in immediately with the password you set.</p>
            </div>
            {!showNew && (
              <button onClick={() => setShowNew(true)} className="btn-primary shrink-0">
                + New account
              </button>
            )}
          </div>
          {showNew && (
            <form className="mt-4 grid gap-3" onSubmit={submitNew}>
              <div>
                <label className="field-label" htmlFor="new-name">Name</label>
                <input id="new-name" type="text" className={inputCls} value={newAcc.name}
                  onChange={(e) => setNewAcc((v) => ({ ...v, name: e.target.value }))} required />
              </div>
              <div>
                <label className="field-label" htmlFor="new-email">Email</label>
                <input id="new-email" type="email" className={inputCls} value={newAcc.email}
                  onChange={(e) => setNewAcc((v) => ({ ...v, email: e.target.value }))} required />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="field-label" htmlFor="new-password">Password (min 8 chars)</label>
                  <input id="new-password" type="password" className={inputCls} autoComplete="new-password" minLength={8}
                    value={newAcc.password} onChange={(e) => setNewAcc((v) => ({ ...v, password: e.target.value }))} required />
                </div>
                <div>
                  <label className="field-label" htmlFor="new-confirm">Confirm password</label>
                  <input id="new-confirm" type="password" className={inputCls} autoComplete="new-password" minLength={8}
                    value={newAcc.confirm} onChange={(e) => setNewAcc((v) => ({ ...v, confirm: e.target.value }))} required />
                </div>
              </div>
              {newErr && <p className="field-error">{newErr}</p>}
              <div className="flex gap-2">
                <button type="submit" disabled={create.isPending} className="btn-primary disabled:opacity-70">
                  {create.isPending && <Spinner light />}
                  {create.isPending ? 'Creating…' : 'Create account'}
                </button>
                <button type="button" onClick={resetNewForm} className="btn-ghost">Cancel</button>
              </div>
            </form>
          )}
        </section>
      </div>

      {/* ── Accounts list ── */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-bordeaux">All accounts ({accounts.length})</h2>
        {isLoading && <div className="mt-4 h-24 animate-pulse rounded-xl bg-white/70" />}
        <div className="mt-4 space-y-3">
          {accounts.map((acc) => {
            const isMe = String(acc._id) === String(me?.id || '');
            return (
              <div key={acc._id} className="card flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4">
                <div className="min-w-0">
                  <p className="font-semibold text-bordeaux">
                    {acc.name}
                    {isMe && <span className="ml-2 rounded-full bg-ruby px-2 py-0.5 text-[10px] font-bold text-white">YOU</span>}
                  </p>
                  <p className="truncate text-sm text-bordeaux/60">{acc.email}</p>
                </div>
                <span className="ml-auto text-xs text-bordeaux/50 tabular">
                  {acc.createdAt ? new Date(acc.createdAt).toLocaleDateString('en-GB', { dateStyle: 'medium' }) : ''}
                </span>
                {rowPending(acc) && <Spinner className="h-3.5 w-3.5" />}
                {!isMe && (
                  <>
                    <button
                      onClick={() => { setResetId(resetId === acc._id ? null : acc._id); setResetPw({ next: '', confirm: '' }); setResetErr(''); }}
                      aria-expanded={resetId === acc._id}
                      className="rounded-full border border-bordeaux/20 px-3 py-1 text-xs font-semibold text-bordeaux transition-colors hover:border-ruby hover:text-ruby"
                    >
                      Reset password
                    </button>
                    <button
                      onClick={() => onDelete(acc)}
                      disabled={remove.isPending}
                      className="rounded-full border border-crimson/30 px-3 py-1 text-xs font-semibold text-crimson transition-colors hover:bg-crimson hover:text-white disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            );
          })}
          {/* Reset password inline panel */}
          {accounts.filter((acc) => acc._id === resetId).map((acc) => (
            <form key={`reset-${acc._id}`} className="card -mt-1 border-ruby/30 px-5 py-4" onSubmit={(e) => submitReset(e, acc)}>
              <p className="text-sm font-semibold text-bordeaux">Set a new password for {acc.email}</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="field-label" htmlFor={`reset-next-${acc._id}`}>New password (min 8 chars)</label>
                  <input id={`reset-next-${acc._id}`} type="password" className={inputCls} autoComplete="new-password" minLength={8}
                    value={resetPw.next} onChange={(e) => setResetPw((v) => ({ ...v, next: e.target.value }))} required />
                </div>
                <div>
                  <label className="field-label" htmlFor={`reset-confirm-${acc._id}`}>Confirm new password</label>
                  <input id={`reset-confirm-${acc._id}`} type="password" className={inputCls} autoComplete="new-password" minLength={8}
                    value={resetPw.confirm} onChange={(e) => setResetPw((v) => ({ ...v, confirm: e.target.value }))} required />
                </div>
              </div>
              {resetErr && <p className="field-error">{resetErr}</p>}
              <div className="mt-3 flex gap-2">
                <button type="submit" disabled={resetPassword.isPending} className="btn-primary disabled:opacity-70">
                  {resetPassword.isPending && <Spinner light />}
                  {resetPassword.isPending ? 'Saving…' : 'Save password'}
                </button>
                <button type="button" onClick={() => { setResetId(null); setResetErr(''); }} className="btn-ghost">Cancel</button>
              </div>
            </form>
          ))}
          {!isLoading && !accounts.length && (
            <p className="card px-5 py-8 text-center text-sm text-bordeaux/60">No accounts found.</p>
          )}
        </div>
      </section>
    </div>
  );
}
