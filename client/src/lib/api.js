import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const BASE = import.meta.env.VITE_API_URL || '';
const jsonHeaders = { 'Content-Type': 'application/json' };

async function request(path, { method = 'GET', body, isForm = false } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: 'include',
    headers: isForm ? undefined : jsonHeaders,
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });
  let payload = null;
  try { payload = await res.json(); } catch { /* non-JSON */ }
  if (!res.ok) {
    const err = new Error(payload?.message || `Request failed (${res.status})`);
    err.status = res.status;
    err.fields = payload?.errors;
    throw err;
  }
  return payload;
}

/* ── Public queries ────────────────────────────────────── */
export const useStats = () => useQuery({ queryKey: ['stats'], queryFn: () => request('/api/stats') });
export const useProducts = (params = {}) => {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== false)).toString();
  return useQuery({ queryKey: ['products', params], queryFn: () => request(`/api/products?${qs}`) });
};
export const useProduct = (slug) => useQuery({ queryKey: ['product', slug], queryFn: () => request(`/api/products/${slug}`), enabled: !!slug });
export const useIndustries = () => useQuery({ queryKey: ['industries'], queryFn: () => request('/api/industries') });
export const useTestimonials = (all = false) => useQuery({ queryKey: ['testimonials', all], queryFn: () => request(`/api/testimonials${all ? '?all=true' : ''}`) });
export const useCertificates = () => useQuery({ queryKey: ['certificates'], queryFn: () => request('/api/certificates') });
export const useHeroSlides = () => useQuery({ queryKey: ['hero-slides'], queryFn: () => request('/api/hero-slides') });
export const useSiteContent = (key) => useQuery({ queryKey: ['site-content', key], queryFn: () => request(`/api/site-content/${key}`) });

/* ── Public mutations ──────────────────────────────────── */
export const useSubmitEnquiry = () => useMutation({ mutationFn: (body) => request('/api/enquiry', { method: 'POST', body }) });
export const useSubmitContact = () => useMutation({ mutationFn: (body) => request('/api/contact', { method: 'POST', body }) });

/* ── Admin auth ────────────────────────────────────────── */
export const adminLogin = (body) => request('/api/auth/login', { method: 'POST', body });
export const adminLogout = () => request('/api/auth/logout', { method: 'POST' });
export const adminMe = () => request('/api/auth/me');
export const useAdminMe = () => useQuery({ queryKey: ['admin-me'], queryFn: adminMe, retry: false });

/* ── Admin accounts (add/remove admins, passwords) ─────── */
export const useAdminAccounts = () => useQuery({ queryKey: ['admin-accounts'], queryFn: () => request('/api/admin/accounts') });
export const useAdminAccountMutations = () => {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-accounts'] });
  const create = useMutation({
    mutationFn: (body) => request('/api/admin/accounts', { method: 'POST', body }),
    onSuccess: invalidate,
  });
  const changeOwnPassword = useMutation({
    mutationFn: (body) => request('/api/admin/accounts/me/password', { method: 'PATCH', body }),
    onSuccess: invalidate,
  });
  const resetPassword = useMutation({
    mutationFn: ({ id, body }) => request(`/api/admin/accounts/${id}/password`, { method: 'PATCH', body }),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id) => request(`/api/admin/accounts/${id}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  });
  return { create, changeOwnPassword, resetPassword, remove };
};

/* ── Admin queries/mutations ───────────────────────────── */
export const useAdminEnquiries = (params = {}) => {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
  return useQuery({ queryKey: ['admin-enquiries', params], queryFn: () => request(`/api/admin/enquiries?${qs}`) });
};
export const useUpdateEnquiry = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => request(`/api/admin/enquiries/${id}`, { method: 'PATCH', body: { status } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-enquiries'] }),
  });
};

export const useDeleteEnquiry = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => request(`/api/admin/enquiries/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-enquiries'] }),
  });
};

export const useAdminProducts = () => useQuery({ queryKey: ['admin-products'], queryFn: () => request('/api/admin/products') });
export const useAdminProductMutations = () => {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin-products'] });
    qc.invalidateQueries({ queryKey: ['products'] });
  };
  const create = useMutation({
    mutationFn: ({ body }) => request('/api/admin/products', { method: 'POST', body, isForm: body instanceof FormData }),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({ id, body }) => request(`/api/admin/products/${id}`, { method: 'PATCH', body, isForm: body instanceof FormData }),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id) => request(`/api/admin/products/${id}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  });
  return { create, update, remove };
};

export const useAdminTestimonials = () => useQuery({ queryKey: ['admin-testimonials'], queryFn: () => request('/api/admin/testimonials') });
export const useAdminTestimonialMutations = () => {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin-testimonials'] });
    qc.invalidateQueries({ queryKey: ['testimonials'] });
  };
  const create = useMutation({
    mutationFn: (body) => request('/api/admin/testimonials', { method: 'POST', body }),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id) => request(`/api/admin/testimonials/${id}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  });
  return { create, remove };
};

export const useAdminStats = () => useQuery({ queryKey: ['admin-stats'], queryFn: () => request('/api/admin/stats') });
export const useAdminStatMutations = () => {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin-stats'] });
    qc.invalidateQueries({ queryKey: ['stats'] });
  };
  const update = useMutation({
    mutationFn: ({ key, body }) => request(`/api/admin/stats/${key}`, { method: 'PATCH', body }),
    onSuccess: invalidate,
  });
  return { update };
};

export const useAdminCertificates = () => useQuery({ queryKey: ['admin-certificates'], queryFn: () => request('/api/admin/certificates') });

export const useAdminHeroSlides = () => useQuery({ queryKey: ['admin-hero-slides'], queryFn: () => request('/api/admin/hero-slides') });
export const useAdminHeroSlideMutations = () => {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin-hero-slides'] });
    qc.invalidateQueries({ queryKey: ['hero-slides'] });
  };
  const create = useMutation({
    mutationFn: ({ body }) => request('/api/admin/hero-slides', { method: 'POST', body, isForm: body instanceof FormData }),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({ id, body }) => request(`/api/admin/hero-slides/${id}`, { method: 'PATCH', body, isForm: body instanceof FormData }),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id) => request(`/api/admin/hero-slides/${id}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  });
  return { create, update, remove };
};

export const useAdminSiteContent = () => useQuery({ queryKey: ['admin-site-content'], queryFn: () => request('/api/admin/site-content') });
export const useAdminSiteContentMutations = () => {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin-site-content'] });
    qc.invalidateQueries({ queryKey: ['site-content'] });
  };
  const update = useMutation({
    mutationFn: ({ key, body }) => request(`/api/admin/site-content/${key}`, { method: 'PUT', body }),
    onSuccess: invalidate,
  });
  return { update };
};

export const useAdminIndustries = () => useQuery({ queryKey: ['admin-industries'], queryFn: () => request('/api/admin/industries') });
export const useAdminIndustryMutations = () => {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin-industries'] });
    qc.invalidateQueries({ queryKey: ['industries'] });
  };
  const create = useMutation({
    mutationFn: (body) => request('/api/admin/industries', { method: 'POST', body }),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({ id, body }) => request(`/api/admin/industries/${id}`, { method: 'PATCH', body }),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id) => request(`/api/admin/industries/${id}`, { method: 'DELETE' }),
    onSuccess: invalidate,
  });
  return { create, update, remove };
};
export const useAdminCertificateMutations = () => {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin-certificates'] });
    qc.invalidateQueries({ queryKey: ['certificates'] });
  };
  const upsert = useMutation({
    mutationFn: ({ key, body }) => request(`/api/admin/certificates/${key}`, { method: 'PUT', body }),
    onSuccess: invalidate,
  });
  return { upsert };
};
