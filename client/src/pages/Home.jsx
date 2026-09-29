import Hero from '../components/home/Hero.jsx';
import Welcome from '../components/home/Welcome.jsx';
import StatStrip from '../components/home/StatStrip.jsx';
import TrustedBy from '../components/home/TrustedBy.jsx';
import Certifications from '../components/home/Certifications.jsx';
import ProductCarousel from '../components/home/ProductCarousel.jsx';
import IndustryExplorer from '../components/home/IndustryExplorer.jsx';
import ProcessTimeline from '../components/home/ProcessTimeline.jsx';
import Testimonials from '../components/home/Testimonials.jsx';
import ClosingCta from '../components/home/ClosingCta.jsx';

export default function Home() {
  return (
    <>
      <Hero />
      <Welcome />
      <StatStrip />
      <TrustedBy />
      <Certifications />
      <ProductCarousel />
      <IndustryExplorer />
      <ProcessTimeline />
      <Testimonials />
      <ClosingCta />
    </>
  );
}
