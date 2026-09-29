import { useState } from 'react';
import { useEnquiry } from '../../context/EnquiryContext.jsx';

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '917015483332';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const { openEnquiry } = useEnquiry();

  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    'Hello Shakti Global Tex — I would like a quote for rugs, cushions & home textiles.',
  )}`;

  return (
    <div className="fixed bottom-4 right-4 z-[80] sm:bottom-6 sm:right-6 print:hidden">
      {open && (
        <div className="mb-3 w-[calc(100vw-2rem)] max-w-xs overflow-hidden rounded-2xl bg-white shadow-2xl sm:w-80">
          <div className="bg-blush px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ruby font-bold text-white">P</div>
              <div>
                <p className="text-sm font-semibold text-bordeaux">Ask Priya</p>
                <p className="flex items-center gap-1.5 text-xs text-bordeaux/70">
                  <span className="inline-block h-2 w-2 rounded-full bg-crimson" /> Export desk · replies in minutes
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-2 px-4 py-4">
            <p className="rounded-xl rounded-tl-sm bg-blush px-3.5 py-2.5 text-sm text-bordeaux">
              Hi! I can get you samples, prices or certifications. What do you need?
            </p>
            <button
              onClick={() => { setOpen(false); openEnquiry(); }}
              className="w-full rounded-lg border border-bordeaux/15 bg-white px-3.5 py-2.5 text-left text-sm font-medium text-bordeaux transition-colors hover:border-ruby hover:text-ruby"
            >
              📦 Request a sample
            </button>
            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              className="block w-full rounded-lg border border-bordeaux/15 bg-white px-3.5 py-2.5 text-left text-sm font-medium text-bordeaux transition-colors hover:border-ruby hover:text-ruby"
            >
              💬 Get a quote on WhatsApp
            </a>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label="Chat with Priya from the export desk"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-crimson text-white shadow-xl transition-colors hover:bg-ruby focus:outline-none focus-visible:ring-2 focus-visible:ring-ruby focus-visible:ring-offset-2"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 3C6.9 3 3 6.5 3 11c0 2.2 1 4.2 2.6 5.6-.1 1-.5 2.4-1.5 3.4 1.9-.2 3.3-.9 4.2-1.6 1.1.4 2.4.6 3.7.6 5.1 0 9-3.5 9-8s-3.9-8-9-8z" />
          </svg>
        )}
      </button>
    </div>
  );
}
