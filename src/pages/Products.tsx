import { useRef } from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { ProductGrid } from '@/components/ProductGrid';
import { Footer } from '@/components/Footer';
import { SocialProofNotification } from '@/components/SocialProofNotification';

interface ProductsProps {
  category: 'all' | 'sarms' | 'peptides';
}

const Products = ({ category }: ProductsProps) => {
  const productsRef = useRef<HTMLDivElement>(null);

  const scrollToProducts = () => {
    productsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero activeCategory={category} compact />
        <div ref={productsRef}>
          <ProductGrid category={category} />
        </div>
      </main>
      <Footer />
      <SocialProofNotification />
    </div>
  );
};

export default Products;
