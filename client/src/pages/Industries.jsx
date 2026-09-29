import SectionHeading from '../components/ui/SectionHeading.jsx';
import IndustryExplorer from '../components/home/IndustryExplorer.jsx';
import { useIndustries } from '../lib/api.js';

export default function Industries() {
  const { data } = useIndustries();
  const industries = data?.data ?? [];

  return (
    <div className="bg-blush py-14 sm:py-18">
      <div className="container-x">
        <SectionHeading
          eyebrow="Industries served"
          title="Five verticals, one weaving floor"
          description="From hotel bath programmes to designer rug collections — the same QA discipline applies at every size."
        />
      </div>
      <IndustryExplorer embedded />
      <div className="container-x pb-16">
        <div className="card p-8">
          <h2 className="text-xl font-bold text-ruby">Not listed? We develop for new verticals every quarter.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-bordeaux/75">
            Last year we shipped 95+ new developments across {industries.length || '5'} verticals.
            If your application needs a construction we do not weave today, our development floor can have swatch samples running within a week.
          </p>
        </div>
      </div>
    </div>
  );
}
