import Header from '@/components/Header';
import Hero from '@/components/Hero';
import TrustBar from '@/components/TrustBar';
import Features from '@/components/Features';
import PreviewSection from '@/components/PreviewSection';
import HowItWorks from '@/components/HowItWorks';
import FAQ from '@/components/FAQ';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <TrustBar />
      <Features />
      <PreviewSection />
      <HowItWorks />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
