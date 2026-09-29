import SectionHeading from '../ui/SectionHeading.jsx';
import { useCertificates } from '../../lib/api.js';
import { useToast } from '../ui/Toast.jsx';

function CertIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3z" />
      <path d="M9 12l2 2 4-4.5" />
    </svg>
  );
}

export default function Certifications() {
  const { data, isLoading } = useCertificates();
  const toast = useToast();
  const certificates = data?.data ?? [];

  return (
    <section className="bg-blush py-16 sm:py-20">
      <div className="container-x">
        <SectionHeading
          eyebrow="Compliance"
          title="Certified, audited, documented"
          description="Certificates are re-issued yearly. PDFs ship with every order file and are downloadable below."
        />
        {isLoading && <div className="mt-10 h-40 animate-pulse rounded-xl bg-white/70" />}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((c) => (
            <div key={c.key} className="card flex flex-col p-6">
              <div className="flex items-start justify-between">
                <span className="text-ruby"><CertIcon /></span>
                <span className="pill">{c.key}</span>
              </div>
              <h3 className="mt-4 font-bold text-bordeaux">{c.name}</h3>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-bordeaux/70">{c.description}</p>
              {c.fileUrl ? (
                <a
                  href={c.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ruby hover:underline"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 4v12m0 0l-5-5m5 5l5-5M5 20h14" /></svg>
                  Download certificate (PDF)
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => toast.success('Certificate copy requested — our compliance desk will email it to you. Drop your email via the sample form.')}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ruby hover:underline"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 4v12m0 0l-5-5m5 5l5-5M5 20h14" /></svg>
                  Download certificates
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
