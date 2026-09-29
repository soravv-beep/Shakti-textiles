import { useEffect, useMemo, useState } from 'react';
import { useEnquiry } from '../../context/EnquiryContext.jsx';
import { useProducts, useSubmitEnquiry } from '../../lib/api.js';
import { validators, validateFields } from '../../lib/validateForm.js';
import { useToast } from '../ui/Toast.jsx';
import Spinner from '../ui/Spinner.jsx';

const EMPTY = { name: '', company: '', phone: '', email: '', product: '', quantity: '', message: '' };

const SCHEMA = {
  name: [validators.required('Name')],
  phone: [validators.required('Phone'), validators.phone],
  email: [validators.required('Email'), validators.email],
  product: [validators.required('Product interest')],
  quantity: [validators.required('Estimated quantity')],
  message: [validators.maxLen(2000)],
};

export default function EnquiryModal() {
  const { isOpen, productSlug, closeEnquiry } = useEnquiry();
  const toast = useToast();
  const { data: productsResp } = useProducts();
  const submit = useSubmitEnquiry();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [blurred, setBlurred] = useState({});
  const [failed, setFailed] = useState(false);

  const products = productsResp?.data ?? [];

  // Reset the form whenever the modal closes.
  useEffect(() => {
    if (!isOpen) { setValues(EMPTY); setErrors({}); setBlurred({}); setFailed(false); }
  }, [isOpen]);

  // Pre-fill the product field when opened from a product card.
  useEffect(() => {
    if (!isOpen || !productSlug) return;
    const p = (productsResp?.data ?? []).find((x) => x.slug === productSlug);
    if (p) setValues((v) => (v.product === p.name ? v : { ...v, product: p.name }));
  }, [isOpen, productSlug, productsResp]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && closeEnquiry();
    if (isOpen) {
      document.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, closeEnquiry]);

  const fieldError = (field) => (blurred[field] ? errors[field] : '');

  const onBlur = (field) => () => {
    setBlurred((b) => ({ ...b, [field]: true }));
    const errs = validateFields({ [field]: values[field] }, { [field]: SCHEMA[field] });
    setErrors((e) => ({ ...e, [field]: errs[field] || '' }));
  };

  const onChange = (field) => (e) => {
    const v = e.target.value;
    setValues((s) => ({ ...s, [field]: v }));
    if (blurred[field]) {
      const errs = validateFields({ [field]: v }, { [field]: SCHEMA[field] });
      setErrors((s) => ({ ...s, [field]: errs[field] || '' }));
    }
  };

  async function onSubmit(e) {
    e.preventDefault();
    const errs = validateFields(values, SCHEMA);
    setErrors(errs);
    setBlurred(Object.keys(SCHEMA).reduce((a, k) => ({ ...a, [k]: true }), {}));
    if (Object.keys(errs).length) return;
    setFailed(false);
    submit.mutate(values, {
      onSuccess: (resp) => {
        toast.success(resp?.message || 'Sample request submitted successfully. Our team will contact you within 24 hours.');
        closeEnquiry();
      },
      onError: () => setFailed(true),
    });
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-bordeaux/60 p-0 backdrop-blur-sm sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label="Request a sample or quote">
      <button className="absolute inset-0 cursor-default" onClick={closeEnquiry} aria-label="Close dialog" tabIndex={-1} />
      <div className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-bordeaux/10 bg-blush px-6 py-5">
          <div>
            <img src="/logo.png" alt="Shakti Global Tex" className="h-9 w-auto" />
            <h2 className="mt-2 text-xl font-bold text-ruby">Request a Sample or Quote</h2>
            <p className="mt-1 text-sm text-bordeaux/80">Our export desk replies within 24 hours, Mon–Sat.</p>
          </div>
          <button onClick={closeEnquiry} aria-label="Close" className="rounded-lg p-1.5 text-bordeaux/70 hover:bg-bordeaux/5 hover:text-bordeaux">
            <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>

        <form className="grid gap-4 px-6 py-6 sm:grid-cols-2" onSubmit={onSubmit} noValidate>
          <div>
            <label className="field-label" htmlFor="enq-name">Name *</label>
            <input id="enq-name" className="field-input" value={values.name} onChange={onChange('name')} onBlur={onBlur('name')} placeholder="Your full name" />
            {fieldError('name') && <p className="field-error">{errors.name}</p>}
          </div>
          <div>
            <label className="field-label" htmlFor="enq-company">Company</label>
            <input id="enq-company" className="field-input" value={values.company} onChange={onChange('company')} onBlur={onBlur('company')} placeholder="Company / brand" />
          </div>
          <div>
            <label className="field-label" htmlFor="enq-phone">Phone (with country code) *</label>
            <input id="enq-phone" className="field-input" value={values.phone} onChange={onChange('phone')} onBlur={onBlur('phone')} placeholder="+91 …" inputMode="tel" />
            {fieldError('phone') && <p className="field-error">{errors.phone}</p>}
          </div>
          <div>
            <label className="field-label" htmlFor="enq-email">Business email *</label>
            <input id="enq-email" type="email" className="field-input" value={values.email} onChange={onChange('email')} onBlur={onBlur('email')} placeholder="you@company.com" />
            {fieldError('email') && <p className="field-error">{errors.email}</p>}
          </div>
          <div>
            <label className="field-label" htmlFor="enq-product">Product interest *</label>
            <select id="enq-product" className="field-input" value={values.product} onChange={onChange('product')} onBlur={onBlur('product')}>
              <option value="">Select a product…</option>
              {products.map((p) => <option key={p.slug} value={p.name}>{p.name}</option>)}
              <option value="Other / Not sure">Other / Not sure</option>
            </select>
            {fieldError('product') && <p className="field-error">{errors.product}</p>}
          </div>
          <div>
            <label className="field-label" htmlFor="enq-quantity">Estimated quantity *</label>
            <input id="enq-quantity" className="field-input" value={values.quantity} onChange={onChange('quantity')} onBlur={onBlur('quantity')} placeholder="e.g. 10,000 m per month" />
            {fieldError('quantity') && <p className="field-error">{errors.quantity}</p>}
          </div>
          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="enq-message">Specifications / message</label>
            <textarea id="enq-message" rows={3} className="field-input" value={values.message} onChange={onChange('message')} onBlur={onBlur('message')}            placeholder="Sizes, materials, colours, quantities, target price…" />
            {fieldError('message') && <p className="field-error">{errors.message}</p>}
          </div>

          {failed && (
            <div className="rounded-lg border border-crimson/30 bg-crimson/5 px-4 py-3 text-sm text-bordeaux sm:col-span-2">
              Submission failed — please check your connection and try again.
              <button type="button" onClick={onSubmit} className="ml-2 font-semibold text-crimson underline underline-offset-2">
                Retry
              </button>
            </div>
          )}

          <div className="sm:col-span-2">
            <button type="submit" disabled={submit.isPending} className="btn-primary w-full disabled:opacity-70">
              {submit.isPending && <Spinner light />}
              {submit.isPending ? 'Submitting…' : 'Submit request'}
            </button>
            <p className="mt-3 text-center text-xs text-bordeaux/60">
              We use your details only to answer this enquiry. No spam, ever.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
