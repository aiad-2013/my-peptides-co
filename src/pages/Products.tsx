import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { ProductGrid } from '@/components/ProductGrid';
import { Footer } from '@/components/Footer';
import { SocialProofNotification } from '@/components/SocialProofNotification';

interface ProductsProps {
  category: 'all' | 'sarms' | 'peptides';
}

const Products = ({ category }: ProductsProps) => (
  <div className="min-h-screen bg-background">
    <Header />
    <main>
      <Hero activeCategory={category} compact />
      <ProductGrid category={category} />
    </main>
    <Footer />
    <SocialProofNotification />
  </div>
);

export default Products;
