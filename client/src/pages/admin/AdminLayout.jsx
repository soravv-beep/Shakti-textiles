import { useEffect, useState } from 'react';
import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAdminMe, adminLogout } from '../../lib/api.js';
import { useQueryClient } from '@tanstack/react-query';

const NAV = [
  { to: '/admin/enquiries', label: 'Enquiries' },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/hero', label: 'Hero slides' },
  { to: '/admin/content', label: 'Website content' },
  { to: '/admin/industries', label: 'Industries' },
  { to: '/admin/testimonials', label: 'Testimonials' },
  { to: '/admin/stats', label: 'Stats' },
  { to: '/admin/certificates', label: 'Certificates' },
  { to: '/admin/accounts', label: 'Accounts' },
];

/* Shared nav list — sidebar on desktop, slide-in drawer on mobile. */
function NavLinks({ onNavigate, email, onLogout }) {
  return (
    <>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Admin">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `block rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'bg-ruby text-white' : 'text-blush/85 hover:bg-blush/10 hover:text-white'
              }`
            }
          >
            {n.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-blush/15 px-5 py-4">
        <p className="truncate text-xs text-blush/70">{email}</p>
        <button onClick={onLogout} className="mt-2 text-xs font-semibold text-blush underline decoration-crimson decoration-2 underline-offset-4 hover:text-white">
          Sign out
        </button>
      </div>
    </>
  );
}

export default function AdminLayout() {
  const { data, isLoading, isError } = useAdminMe();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [drawerOpen, setDrawerOpen] = useState(false);

  /* Lock body scroll + close on Escape while the mobile drawer is open. */
  useEffect(() => {
    if (!drawerOpen) return undefined;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') setDrawerOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [drawerOpen]);

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-blush"><p className="text-sm text-bordeaux/60">Checking session…</p></div>;
  }
  if (isError || !data?.success) return <Navigate to="/admin" replace />;

  async function logout() {
    setDrawerOpen(false);
    try { await adminLogout(); } catch { /* ignore */ }
    await qc.invalidateQueries({ queryKey: ['admin-me'] });
    navigate('/admin', { replace: true });
  }

  const email = data?.data?.email;

  return (
    <div className="flex min-h-screen bg-blush">
      {/* ── Desktop sidebar ── */}
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col bg-bordeaux text-blush lg:flex">
        <div className="border-b border-blush/15 px-5 py-5">
          <img src="/logo.png" alt="Shakti Global Tex" className="h-9 w-auto rounded-md" />
          <p className="mt-2 text-xs text-blush/60">Admin console</p>
        </div>
        <NavLinks onNavigate={() => {}} email={email} onLogout={logout} />
      </aside>

      {/* ── Mobile drawer + backdrop ── */}
      <div
        className={`fixed inset-0 z-40 bg-bordeaux/60 backdrop-blur-sm transition-opacity lg:hidden ${drawerOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 max-w-[85vw] flex-col bg-bordeaux text-blush shadow-2xl transition-transform duration-200 ease-out lg:hidden ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Admin menu"
      >
        <div className="flex items-center justify-between border-b border-blush/15 px-5 py-4">
          <img src="/logo.png" alt="Shakti Global Tex" className="h-8 w-auto rounded-md" />
          <button
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
            className="rounded-lg p-1.5 text-blush/80 hover:bg-blush/10 hover:text-white"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <NavLinks onNavigate={() => setDrawerOpen(false)} email={email} onLogout={logout} />
      </aside>

      {/* ── Content + mobile top bar ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-bordeaux/10 bg-bordeaux px-4 py-3 text-blush lg:hidden">
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            aria-expanded={drawerOpen}
            className="rounded-lg p-1.5 hover:bg-blush/10"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <img src="/logo.png" alt="Shakti Global Tex" className="h-7 w-auto rounded-md" />
          <span className="text-xs text-blush/60">Admin</span>
        </header>
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
