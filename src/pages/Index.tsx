import { useRef } from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { ProductGrid } from '@/components/ProductGrid';
import { Footer } from '@/components/Footer';
import { SocialProofNotification } from '@/components/SocialProofNotification';
import { HomepageFAQ } from '@/components/HomepageFAQ';

const Index = () => {
  const productsRef = useRef<HTMLDivElement>(null);

  const scrollToProducts = () => {
    productsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero onShopClick={scrollToProducts} activeCategory="all" />
        <div ref={productsRef}>
          <ProductGrid category="all" />
        </div>
        <HomepageFAQ />
      </main>
      <Footer />
      <SocialProofNotification />
    </div>
  );
};

export default Index;
