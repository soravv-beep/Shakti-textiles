import CountUp from '../ui/CountUp.jsx';
import SectionHeading from '../ui/SectionHeading.jsx';
import { useStats } from '../../lib/api.js';

export default function StatStrip() {
  const { data, isLoading, isError } = useStats();
  const stats = data?.data ?? [];

  return (
    <section className="bg-blush py-16 sm:py-20">
      <div className="container-x">
        <SectionHeading
          eyebrow="By the numbers"
          title="Proof before promises"
          description="Reported production figures, not marketing rounding. Our export desk can walk you through the source of every number below."
        />
        {isLoading && (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => <div key={i} className="h-28 animate-pulse rounded-xl bg-white/70" />)}
          </div>
        )}
        {isError && (
          <p className="mt-10 rounded-xl border border-crimson/30 bg-white px-4 py-3 text-sm text-crimson">
            Could not load statistics — please refresh to retry.
          </p>
        )}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.slice(0, 4).map((s) => (
            <div key={s.key} className="card px-6 py-7">
              <p className="text-4xl font-bold text-ruby sm:text-[2.6rem]">
                <CountUp value={s.value} />
                {s.suffix}
              </p>
              <p className="mt-2 text-sm font-semibold text-bordeaux">{s.label}</p>
              {s.caption && <p className="mt-1 text-xs leading-relaxed text-bordeaux/60">{s.caption}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
