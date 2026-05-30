import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import DeepInsights from '@/components/DeepInsights';
import WorkflowSection from '@/components/WorkflowSection';
import HowItWorks from '@/components/HowItWorks';
import BottomCTA from '@/components/BottomCTA';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Vyntrise SEO Checker',
            url: 'https://seo-analyzer.vyntrise.com',
            potentialAction: {
              '@type': 'SearchAction',
              target: 'https://seo-analyzer.vyntrise.com/results?url={url}',
              'query-input': 'required name=url',
            },
          }),
        }}
      />
      <Header />
      <Hero />
      <Features />
      <DeepInsights />
      <WorkflowSection />
      <HowItWorks />
      <BottomCTA />
      <Footer />
    </main>
  );
}
