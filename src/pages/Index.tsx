import { useState, useRef } from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { ProductGrid } from '@/components/ProductGrid';
import { ProductModal } from '@/components/ProductModal';
import { Footer } from '@/components/Footer';
import { SocialProofNotification } from '@/components/SocialProofNotification';
import { CartProvider } from '@/context/CartContext';
import { Product } from '@/types/product';

const IndexContent = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'sarms' | 'peptides'>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const productsRef = useRef<HTMLDivElement>(null);

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

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
          <ProductGrid
            category={activeCategory}
            onViewDetails={handleViewDetails}
          />
        </div>
      </main>

      <Footer />
      <SocialProofNotification />

      <ProductModal
        product={selectedProduct}
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setSelectedProduct(null);
        }}
      />
    </div>
  );
};

const Index = () => {
  return (
    <CartProvider>
      <IndexContent />
    </CartProvider>
  );
};

export default Index;
