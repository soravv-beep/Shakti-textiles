import { useState } from 'react';
import SectionHeading from '../ui/SectionHeading.jsx';
import { useIndustries } from '../../lib/api.js';

export default function IndustryExplorer() {
  const { data, isLoading } = useIndustries();
  const industries = data?.data ?? [];
  const [activeIndustry, setActiveIndustry] = useState(null);
  const [activeSub, setActiveSub] = useState(null);

  const current = industries.find((i) => i.name === activeIndustry) || null;
  const currentSub = current?.subIndustries?.find((s) => s.name === activeSub) || null;

  return (
    <section className="bg-blush py-16 sm:py-20">
      <div className="container-x">
        <SectionHeading
          eyebrow="Industries & applications"
          title="Where our textiles end up"
          description="Select an industry to drill into sub-segments and the exact applications we produce for."
        />

        {isLoading && <div className="mt-10 h-48 animate-pulse rounded-xl bg-white/70" />}

        <div className="mt-8 grid gap-4 lg:grid-cols-12">
          {/* Level 1: industries */}
          <div className="flex flex-wrap gap-2 lg:col-span-4 lg:flex-col">
            {industries.map((ind) => {
              const active = activeIndustry === ind.name;
              return (
                <button
                  key={ind.name}
                  onClick={() => { setActiveIndustry(active ? null : ind.name); setActiveSub(null); }}
                  aria-pressed={active}
                  className={`rounded-lg border px-4 py-3 text-left text-sm font-semibold transition-colors ${
                    active
                      ? 'border-ruby bg-ruby text-white'
                      : 'border-bordeaux/25 bg-white text-bordeaux hover:border-ruby hover:text-ruby'
                  }`}
                >
                  {ind.name}
                  <span className={`block text-xs font-normal ${active ? 'text-blush/80' : 'text-bordeaux/50'}`}>
                    {ind.subIndustries?.length ?? 0} segments
                  </span>
                </button>
              );
            })}
          </div>

          {/* Level 2: sub-industries */}
          <div className="lg:col-span-8">
            {!current && (
              <div className="card flex h-full min-h-48 items-center justify-center p-8 text-center">
                <p className="text-sm text-bordeaux/60">Select an industry to explore applications.</p>
              </div>
            )}
            {current && (
              <div className="space-y-3">
                <p className="text-sm leading-relaxed text-bordeaux/80">{current.description}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {current.subIndustries?.map((sub) => {
                    const active = activeSub === sub.name;
                    return (
                      <div key={sub.name} className="card p-4">
                        <button
                          onClick={() => setActiveSub(active ? null : sub.name)}
                          aria-pressed={active}
                          className={`w-full rounded-md px-2 py-1.5 text-left text-sm font-semibold transition-colors ${
                            active ? 'bg-ruby text-white' : 'text-bordeaux hover:text-ruby'
                          }`}
                        >
                          {sub.name} <span className={active ? 'text-blush/70' : 'text-bordeaux/40'}>·</span>
                          <span className={`ml-1 text-xs font-normal ${active ? 'text-blush/80' : 'text-bordeaux/50'}`}>
                            {sub.applications?.length ?? 0} applications
                          </span>
                        </button>
                        {/* Level 3: applications */}
                        {active && (
                          <ul className="mt-3 space-y-2 border-t border-bordeaux/10 pt-3">
                            {sub.applications?.map((app) => (
                              <li key={app.name} className="text-sm">
                                <span className="font-medium text-bordeaux">{app.name}</span>
                                {app.note && <span className="block text-xs text-bordeaux/60">{app.note}</span>}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
