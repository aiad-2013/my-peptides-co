import { useState, useRef } from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { ProductGrid } from '@/components/ProductGrid';
import { Footer } from '@/components/Footer';
import { SocialProofNotification } from '@/components/SocialProofNotification';


const IndexContent = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'sarms' | 'peptides'>('all');
  const productsRef = useRef<HTMLDivElement>(null);

  const scrollToProducts = () => {
    productsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        onCategoryChange={setActiveCategory}
        activeCategory={activeCategory}
      />

      <main>
        <Hero onShopClick={scrollToProducts} />
        
        <div ref={productsRef}>
          <ProductGrid category={activeCategory} />
        </div>
      </main>

      <Footer />
      <SocialProofNotification />
    </div>
  );
};

const Index = () => {
  return <IndexContent />;
};

export default Index;
