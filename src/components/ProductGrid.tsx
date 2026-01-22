import { Product } from '@/types/product';
import { ProductCard } from './ProductCard';
import { products, getProductsByCategory } from '@/data/products';

interface ProductGridProps {
  category: 'all' | 'sarms' | 'peptides';
  onViewDetails: (product: Product) => void;
}

export const ProductGrid = ({ category, onViewDetails }: ProductGridProps) => {
  const filteredProducts = category === 'all' 
    ? products 
    : getProductsByCategory(category);

  const categoryTitles = {
    all: 'All Products',
    sarms: 'SARMs Collection',
    peptides: 'Peptides Collection',
  };

  const categoryDescriptions = {
    all: 'Browse our complete range of premium research compounds',
    sarms: 'Selective Androgen Receptor Modulators for advanced research',
    peptides: 'High-purity peptides for laboratory applications',
  };

  return (
    <section className="py-12 md:py-16" id="products">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mb-3">
            {categoryTitles[category]}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {categoryDescriptions[category]}
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => (
            <div
              key={product.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <ProductCard product={product} onViewDetails={onViewDetails} />
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No products found in this category.</p>
          </div>
        )}
      </div>
    </section>
  );
};
