import { useEffect, useState } from 'react';
import { useAdminSiteContent, useAdminSiteContentMutations } from '../../lib/api.js';
import { useToast } from '../../components/ui/Toast.jsx';
import Spinner from '../../components/ui/Spinner.jsx';

/* Homepage content editor — every text block on the homepage, editable. */

const TABS = [
  { key: 'welcome', label: 'Welcome section' },
  { key: 'process', label: 'How we work' },
  { key: 'closingCta', label: 'Closing CTA' },
  { key: 'trustedBy', label: 'Trusted by' },
  { key: 'about', label: 'About page' },
  { key: 'contactPage', label: 'Contact page' },
  { key: 'footer', label: 'Footer' },
];

const BLANKS = {
  welcome: { eyebrow: '', title: '', paragraphs: '', ctaLabel: '', ctaTo: '/about', active: true },
  process: { eyebrow: '', title: '', description: '', stepsText: '', active: true },
  closingCta: { title: '', highlight: '', description: '', primaryLabel: '', whatsappLabel: '', image: '', active: true },
  trustedBy: { eyebrow: '', title: '', partners: '', active: true },
  about: { eyebrow: '', title: '', intro: '', craftedTitle: '', craftedText: '', milestonesText: '', valuesText: '', foundersText: '', active: true },
  contactPage: { address: '', phone: '', phoneHref: '', email: '', hours: '', active: true },
  footer: { blurb: '', address: '', phone: '', phoneHref: '', email: '', tagline: '', active: true },
};

function toForm(key, data = {}) {
  if (key === 'welcome') {
    return { ...BLANKS.welcome, ...data, paragraphs: (data.paragraphs ?? []).join('\n\n') };
  }
  if (key === 'process') {
    return {
      ...BLANKS.process, ...data,
      stepsText: (data.steps ?? []).map((s) => [s.label, s.desc, s.tag].join(' | ')).join('\n'),
    };
  }
  if (key === 'trustedBy') {
    return { ...BLANKS.trustedBy, ...data, partners: (data.partners ?? []).join('\n') };
  }
  if (key === 'about') {
    return {
      ...BLANKS.about, ...data,
      milestonesText: (data.milestones ?? []).map((m) => [m.year, m.text].join(' | ')).join('\n'),
      valuesText: (data.values ?? []).map((v) => [v.title, v.text].join(' | ')).join('\n'),
      foundersText: (data.founders ?? []).map((f) => [f.name, f.title, f.philosophy, f.quote].join(' | ')).join('\n'),
    };
  }
  return { ...BLANKS[key], ...data };
}

function toBody(key, form) {
  if (key === 'welcome') {
    return {
      eyebrow: form.eyebrow, title: form.title,
      paragraphs: form.paragraphs.split('\n').map((s) => s.trim()).filter(Boolean),
      ctaLabel: form.ctaLabel, ctaTo: form.ctaTo, active: form.active,
    };
  }
  if (key === 'process') {
    return {
      eyebrow: form.eyebrow, title: form.title, description: form.description, active: form.active,
      steps: form.stepsText.split('\n').map((line) => {
        const [label, desc, tag] = line.split('|').map((s) => s.trim());
        return label || desc ? { label: label || '', desc: desc || '', tag: tag || `Step ${line.length ? '' : ''}` } : null;
      }).filter(Boolean),
    };
  }
  if (key === 'trustedBy') {
    return {
      eyebrow: form.eyebrow, title: form.title, active: form.active,
      partners: form.partners.split('\n').map((s) => s.trim()).filter(Boolean),
    };
  }
  if (key === 'about') {
    return {
      eyebrow: form.eyebrow, title: form.title, intro: form.intro,
      craftedTitle: form.craftedTitle, craftedText: form.craftedText, active: form.active,
      milestones: form.milestonesText.split('\n').map((line) => {
        const idx = line.indexOf('|');
        if (idx === -1) return line.trim() ? { year: '', text: line.trim() } : null;
        return { year: line.slice(0, idx).trim(), text: line.slice(idx + 1).trim() };
      }).filter(Boolean),
      values: form.valuesText.split('\n').map((line) => {
        const idx = line.indexOf('|');
        if (idx === -1) return line.trim() ? { title: line.trim(), text: '' } : null;
        return { title: line.slice(0, idx).trim(), text: line.slice(idx + 1).trim() };
      }).filter(Boolean),
      founders: form.foundersText.split('\n').map((line) => {
        const [name, title, philosophy, quote] = line.split('|').map((s) => s.trim());
        return name ? { name, title: title || '', philosophy: philosophy || '', quote: quote || '' } : null;
      }).filter(Boolean),
    };
  }
  return { ...form };
}

export default function AdminContent() {
  const { data, isLoading } = useAdminSiteContent();
  const { update } = useAdminSiteContentMutations();
  const toast = useToast();
  const [tab, setTab] = useState('welcome');
  const [forms, setForms] = useState({});
  const [loaded, setLoaded] = useState(false);

  const rows = data?.data ?? [];

  useEffect(() => {
    if (loaded || isLoading) return;
    const next = {};
    for (const t of TABS) {
      const row = rows.find((r) => r.key === t.key);
      next[t.key] = toForm(t.key, row?.data ?? {});
    }
    setForms(next);
    setLoaded(true);
  }, [rows, isLoading, loaded]);

  const form = forms[tab] ?? BLANKS[tab];
  const set = (field) => (e) =>
    setForms((f) => ({ ...f, [tab]: { ...f[tab], [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value } }));

  function onSave(e) {
    e.preventDefault();
    const body = toBody(tab, form);
    update.mutate(
      { key: tab, body },
      {
        onSuccess: () => toast.success('Homepage updated — refresh the site to see it live.'),
        onError: (err) => toast.error(err.message || 'Save failed.'),
      },
    );
  }

  if (isLoading || !loaded) {
    return <div className="h-40 max-w-3xl animate-pulse rounded-xl bg-white/70" />;
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-ruby">Homepage content</h1>
      <p className="mt-1 text-sm text-bordeaux/70">
        Edit the text sections of the homepage. Changes go live immediately.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            aria-pressed={tab === t.key}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              tab === t.key ? 'bg-ruby text-white' : 'border border-bordeaux/20 bg-white text-bordeaux hover:border-ruby hover:text-ruby'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form className="card mt-6 grid gap-4 p-6" onSubmit={onSave} key={tab}>
        {tab === 'welcome' && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="wc-eyebrow">Eyebrow</label>
                <input id="wc-eyebrow" className="field-input" value={form.eyebrow} onChange={set('eyebrow')} />
              </div>
              <div>
                <label className="field-label" htmlFor="wc-title">Heading</label>
                <input id="wc-title" className="field-input" value={form.title} onChange={set('title')} />
              </div>
            </div>
            <div>
              <label className="field-label" htmlFor="wc-paras">Paragraphs (blank line = new paragraph)</label>
              <textarea id="wc-paras" rows={8} className="field-input" value={form.paragraphs} onChange={set('paragraphs')} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="wc-cta">Button label (empty = hide)</label>
                <input id="wc-cta" className="field-input" value={form.ctaLabel} onChange={set('ctaLabel')} />
              </div>
              <div>
                <label className="field-label" htmlFor="wc-cta-to">Button link</label>
                <input id="wc-cta-to" className="field-input" value={form.ctaTo} onChange={set('ctaTo')} />
              </div>
            </div>
          </>
        )}

        {tab === 'process' && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="pr-eyebrow">Eyebrow</label>
                <input id="pr-eyebrow" className="field-input" value={form.eyebrow} onChange={set('eyebrow')} />
              </div>
              <div>
                <label className="field-label" htmlFor="pr-title">Heading</label>
                <input id="pr-title" className="field-input" value={form.title} onChange={set('title')} />
              </div>
            </div>
            <div>
              <label className="field-label" htmlFor="pr-desc">Description</label>
              <textarea id="pr-desc" rows={2} className="field-input" value={form.description} onChange={set('description')} />
            </div>
            <div>
              <label className="field-label" htmlFor="pr-steps">Steps (one per line — Label | Description | Tag)</label>
              <textarea id="pr-steps" rows={6} className="field-input font-mono text-xs" value={form.stepsText} onChange={set('stepsText')} />
            </div>
          </>
        )}

        {tab === 'closingCta' && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="cc-title">Line 1</label>
                <input id="cc-title" className="field-input" value={form.title} onChange={set('title')} />
              </div>
              <div>
                <label className="field-label" htmlFor="cc-high">Highlighted line (crimson)</label>
                <input id="cc-high" className="field-input" value={form.highlight} onChange={set('highlight')} />
              </div>
            </div>
            <div>
              <label className="field-label" htmlFor="cc-desc">Description</label>
              <textarea id="cc-desc" rows={2} className="field-input" value={form.description} onChange={set('description')} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="cc-primary">Primary button label (empty = hide)</label>
                <input id="cc-primary" className="field-input" value={form.primaryLabel} onChange={set('primaryLabel')} />
              </div>
              <div>
                <label className="field-label" htmlFor="cc-wa">WhatsApp button label (empty = hide)</label>
                <input id="cc-wa" className="field-input" value={form.whatsappLabel} onChange={set('whatsappLabel')} />
              </div>
            </div>
            <div>
              <label className="field-label" htmlFor="cc-image">Background image URL (empty = default carpet showroom photo)</label>
              <input id="cc-image" className="field-input" value={form.image} onChange={set('image')} placeholder="/hero/carpet-showroom.jpg" />
            </div>
          </>
        )}

        {tab === 'trustedBy' && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="tb-eyebrow">Eyebrow</label>
                <input id="tb-eyebrow" className="field-input" value={form.eyebrow} onChange={set('eyebrow')} />
              </div>
              <div>
                <label className="field-label" htmlFor="tb-title">Heading</label>
                <input id="tb-title" className="field-input" value={form.title} onChange={set('title')} />
              </div>
            </div>
            <div>
              <label className="field-label" htmlFor="tb-partners">Buyer names (one per line)</label>
              <textarea id="tb-partners" rows={8} className="field-input" value={form.partners} onChange={set('partners')} />
            </div>
          </>
        )}

        {tab === 'about' && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="ab-eyebrow">Eyebrow</label>
                <input id="ab-eyebrow" className="field-input" value={form.eyebrow} onChange={set('eyebrow')} />
              </div>
              <div>
                <label className="field-label" htmlFor="ab-title">Heading</label>
                <input id="ab-title" className="field-input" value={form.title} onChange={set('title')} />
              </div>
            </div>
            <div>
              <label className="field-label" htmlFor="ab-intro">Intro paragraph</label>
              <textarea id="ab-intro" rows={4} className="field-input" value={form.intro} onChange={set('intro')} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="ab-ct">Crafted-with-care heading</label>
                <input id="ab-ct" className="field-input" value={form.craftedTitle} onChange={set('craftedTitle')} />
              </div>
            </div>
            <div>
              <label className="field-label" htmlFor="ab-ctx">Crafted-with-care text</label>
              <textarea id="ab-ctx" rows={4} className="field-input" value={form.craftedText} onChange={set('craftedText')} />
            </div>
            <div>
              <label className="field-label" htmlFor="ab-mile">Milestones (one per line — Year | Text)</label>
              <textarea id="ab-mile" rows={6} className="field-input font-mono text-xs" value={form.milestonesText} onChange={set('milestonesText')} />
            </div>
            <div>
              <label className="field-label" htmlFor="ab-vals">Why-choose points (one per line — Title | Text)</label>
              <textarea id="ab-vals" rows={6} className="field-input font-mono text-xs" value={form.valuesText} onChange={set('valuesText')} />
            </div>
            <div>
              <label className="field-label" htmlFor="ab-found">Founders (one per line — Name | Title | Philosophy | Quote)</label>
              <textarea id="ab-found" rows={4} className="field-input font-mono text-xs" value={form.foundersText} onChange={set('foundersText')} />
            </div>
          </>
        )}

        {tab === 'contactPage' && (
          <>
            <div>
              <label className="field-label" htmlFor="cp-addr">Address</label>
              <input id="cp-addr" className="field-input" value={form.address} onChange={set('address')} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="cp-phone">Phone (shown)</label>
                <input id="cp-phone" className="field-input" value={form.phone} onChange={set('phone')} />
              </div>
              <div>
                <label className="field-label" htmlFor="cp-phoneh">Phone (tel: link)</label>
                <input id="cp-phoneh" className="field-input" value={form.phoneHref} onChange={set('phoneHref')} />
              </div>
              <div>
                <label className="field-label" htmlFor="cp-email">Email</label>
                <input id="cp-email" className="field-input" value={form.email} onChange={set('email')} />
              </div>
              <div>
                <label className="field-label" htmlFor="cp-hours">Working hours</label>
                <input id="cp-hours" className="field-input" value={form.hours} onChange={set('hours')} />
              </div>
            </div>
          </>
        )}

        {tab === 'footer' && (
          <>
            <div>
              <label className="field-label" htmlFor="ft-blurb">Blurb (short description under logo)</label>
              <textarea id="ft-blurb" rows={3} className="field-input" value={form.blurb} onChange={set('blurb')} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="ft-addr">Address</label>
                <input id="ft-addr" className="field-input" value={form.address} onChange={set('address')} />
              </div>
              <div>
                <label className="field-label" htmlFor="ft-tag">Tagline (bottom-right)</label>
                <input id="ft-tag" className="field-input" value={form.tagline} onChange={set('tagline')} />
              </div>
              <div>
                <label className="field-label" htmlFor="ft-phone">Phone (shown)</label>
                <input id="ft-phone" className="field-input" value={form.phone} onChange={set('phone')} />
              </div>
              <div>
                <label className="field-label" htmlFor="ft-phoneh">Phone (tel: link)</label>
                <input id="ft-phoneh" className="field-input" value={form.phoneHref} onChange={set('phoneHref')} />
              </div>
              <div>
                <label className="field-label" htmlFor="ft-email">Email</label>
                <input id="ft-email" className="field-input" value={form.email} onChange={set('email')} />
              </div>
            </div>
          </>
        )}

        <label className="flex items-center gap-2 text-sm text-bordeaux">
          <input type="checkbox" checked={form.active !== false} onChange={set('active')} />
          Show this section on the homepage
        </label>

        <div className="mt-2">
          <button type="submit" disabled={update.isPending} className="btn-primary">
            {update.isPending && <Spinner light />}
            Save changes
          </button>
        </div>
      </form>
    </div>
  );
}
