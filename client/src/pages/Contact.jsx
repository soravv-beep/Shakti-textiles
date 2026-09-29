import { useState } from 'react';
import SectionHeading from '../components/ui/SectionHeading.jsx';
import { useSubmitContact, useSiteContent } from '../lib/api.js';
import { useToast } from '../components/ui/Toast.jsx';
import { validators, validateFields } from '../lib/validateForm.js';
import Spinner from '../components/ui/Spinner.jsx';

const FALLBACK = {
  address: 'Panipat, Haryana, India',
  phone: '+91 70154 83332',
  phoneHref: '+917015483332',
  email: 'merchant@shaktitextile.com',
  hours: 'Monday–Saturday · 9:00–19:00 IST · replies within 24 h',
};

const EMPTY = { name: '', email: '', company: '', message: '' };
const SCHEMA = {
  name: [validators.required('Name')],
  email: [validators.required('Email'), validators.email],
  message: [validators.required('Message'), validators.maxLen(2000)],
};

export default function Contact() {
  const submit = useSubmitContact();
  const { data } = useSiteContent('contactPage');
  const c = { ...FALLBACK, ...(data?.data || {}) };
  const toast = useToast();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [blurred, setBlurred] = useState({});
  const [failed, setFailed] = useState(false);

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

  function onSubmit(e) {
    e.preventDefault();
    const errs = validateFields(values, SCHEMA);
    setErrors(errs);
    setBlurred(Object.keys(SCHEMA).reduce((a, k) => ({ ...a, [k]: true }), {}));
    if (Object.keys(errs).length) return;
    setFailed(false);
    submit.mutate(values, {
      onSuccess: (resp) => {
        toast.success(resp?.message || 'Message sent. We will get back to you within one business day.');
        setValues(EMPTY); setBlurred({}); setErrors({});
      },
      onError: () => setFailed(true),
    });
  }

  return (
    <div className="bg-blush py-14 sm:py-18">
      <div className="container-x grid gap-10 lg:grid-cols-2">
        <div>
          <SectionHeading
            eyebrow="Contact"
            title="Talk to the export desk"
            description="Specifications, samples, audits or a factory visit — reach us on any channel below."
          />
          <div className="card mt-8 space-y-5 p-7 text-sm">
            <div>
              <p className="font-semibold text-bordeaux">Works & office</p>
              <p className="mt-1 leading-relaxed text-bordeaux/75">{c.address}</p>
            </div>
            <div>
              <p className="font-semibold text-bordeaux">Talk to us</p>
              <p className="mt-1 text-bordeaux/75"><a className="text-ruby hover:underline" href={`tel:${c.phoneHref}`}>{c.phone}</a> · <a className="text-ruby hover:underline" href={`mailto:${c.email}`}>{c.email}</a></p>
            </div>
            <div>
              <p className="font-semibold text-bordeaux">Hours</p>
              <p className="mt-1 text-bordeaux/75">{c.hours}</p>
            </div>
            <div>
              <p className="font-semibold text-bordeaux">Compliance documents</p>
              <p className="mt-1 text-bordeaux/75">Certificates and test reports are on the <a href="/#compliance" className="text-ruby hover:underline">homepage compliance section</a>.</p>
            </div>
          </div>
        </div>

        <div className="card h-fit p-7">
          <h2 className="text-lg font-bold text-bordeaux">Send a message</h2>
          <form className="mt-5 grid gap-4" onSubmit={onSubmit} noValidate>
            <div>
              <label className="field-label" htmlFor="ct-name">Name *</label>
              <input id="ct-name" className="field-input" value={values.name} onChange={onChange('name')} onBlur={onBlur('name')} placeholder="Your full name" />
              {blurred.name && errors.name && <p className="field-error">{errors.name}</p>}
            </div>
            <div>
              <label className="field-label" htmlFor="ct-email">Business email *</label>
              <input id="ct-email" type="email" className="field-input" value={values.email} onChange={onChange('email')} onBlur={onBlur('email')} placeholder="you@company.com" />
              {blurred.email && errors.email && <p className="field-error">{errors.email}</p>}
            </div>
            <div>
              <label className="field-label" htmlFor="ct-company">Company</label>
              <input id="ct-company" className="field-input" value={values.company} onChange={onChange('company')} onBlur={onBlur('company')} placeholder="Company / brand" />
            </div>
            <div>
              <label className="field-label" htmlFor="ct-message">Message *</label>
              <textarea id="ct-message" rows={5} className="field-input" value={values.message} onChange={onChange('message')} onBlur={onBlur('message')}            placeholder="What do you need? Sizes, materials, quantities, certifications…" />
              {blurred.message && errors.message && <p className="field-error">{errors.message}</p>}
            </div>
            {failed && (
              <div className="rounded-lg border border-crimson/30 bg-crimson/5 px-4 py-3 text-sm text-bordeaux">
                Message failed to send — please check your connection and try again.
                <button type="button" onClick={onSubmit} className="ml-2 font-semibold text-crimson underline underline-offset-2">Retry</button>
              </div>
            )}
            <button type="submit" disabled={submit.isPending} className="btn-primary w-full disabled:opacity-70">
              {submit.isPending && <Spinner light />}
              {submit.isPending ? 'Sending…' : 'Send message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
