import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { adminLogin, useAdminMe } from '../../lib/api.js';
import Spinner from '../../components/ui/Spinner.jsx';

export default function AdminLogin() {
  const { data: me, isLoading } = useAdminMe();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [values, setValues] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  if (!isLoading && me?.success) return <Navigate to="/admin/enquiries" replace />;

  async function onSubmit(e) {
    e.preventDefault();
    setPending(true);
    setError('');
    try {
      await adminLogin(values);
      await qc.invalidateQueries({ queryKey: ['admin-me'] });
      navigate('/admin/enquiries', { replace: true });
    } catch (err) {
      setError(err.message || 'Sign in failed.');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bordeaux px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl">
        <img src="/logo.png" alt="Shakti Global Tex" className="mx-auto h-12 w-auto rounded-md" />
        <h1 className="mt-4 text-center text-xl font-bold text-ruby">Admin sign in</h1>
        <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
          <div>
            <label className="field-label" htmlFor="ad-email">Email</label>
            <input id="ad-email" type="email" className="field-input" value={values.email} autoComplete="username"
              onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))} required />
          </div>
          <div>
            <label className="field-label" htmlFor="ad-password">Password</label>
            <input id="ad-password" type="password" className="field-input" value={values.password} autoComplete="current-password"
              onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))} required />
          </div>
          {error && <p className="field-error">{error}</p>}
          <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-70">
            {pending && <Spinner light />}
            {pending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
