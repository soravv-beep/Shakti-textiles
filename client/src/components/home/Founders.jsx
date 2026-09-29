import SectionHeading from '../ui/SectionHeading.jsx';

const PEOPLE = [
  {
    name: 'Rameshbhai Patel',
    title: 'Founder & Chairman',
    philosophy:
      '“A loom never lies. If the weave coming off it is honest, the customer will feel it in the very first piece they unroll.”',
    quote:
      'We still weave every new design on our own floor for a week before we offer it to a buyer.',
  },
  {
    name: 'Nilesh Patel',
    title: 'Managing Director',
    philosophy:
      '“Export business is a promise business. The date we confirm is the date the container leaves.”',
    quote:
      'I personally review the dispatch board every morning — every season of on-time exports.',
  },
  {
    name: 'Priya Patel',
    title: 'Director — Exports & Compliance',
    philosophy:
      '“Certification is not paperwork; it is the buyer sleeping well in another timezone.”',
    quote:
      'Every certificate we hold is re-audited yearly, and buyers get the documents before they ask.',
  },
];

export default function Founders({ people } = {}) {
  const list = (people?.length ? people : PEOPLE).filter((p) => p.name);
  if (!list.length) return null;

  return (
    <section className="bg-blush py-16 sm:py-20">
      <div className="container-x">
        <SectionHeading
          eyebrow="The people accountable"
          title="Run by its founders, not a faceless factory"
          description="Generations of weaving, one family accountable for every piece shipped."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {list.map((p) => (
            <div key={p.name} className="card flex flex-col p-7">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-bordeaux text-lg font-bold text-blush">
                  {p.name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-bordeaux">{p.name}</h3>
                  <p className="text-sm font-medium text-ruby">{p.title}</p>
                </div>
              </div>
              <p className="mt-5 flex-1 border-l-[3px] border-crimson pl-4 text-sm italic leading-relaxed text-bordeaux/85">
                {p.philosophy ? (p.philosophy.startsWith('“') ? p.philosophy : `“${p.philosophy}”`) : ''}
              </p>
              {p.quote && <p className="mt-5 text-sm leading-relaxed text-bordeaux/70">{p.quote}</p>}
            </div>
          ))}
        </div>
        <p className="mt-6 text-xs text-bordeaux/50">
          Portrait photos: replace the monograms above with leadership photography in the About page media kit (placeholders used pending shoot).
        </p>
    </div>
    </section>
  );
}
