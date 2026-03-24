import { Link } from 'react-router-dom';
import { ProductCard } from './ProductCard';
import { useProductsByCategory } from '@/hooks/useProducts';
import { Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

type CategoryFilter = 'all' | 'sarms' | 'peptides' | 'glp-1' | 'erectile-performance' | 'dilutes';

interface ProductGridProps {
  category: CategoryFilter;
  limit?: number;
}

export const ProductGrid = ({ category, limit }: ProductGridProps) => {
  const { data: allProducts, isLoading, isError } = useProductsByCategory(category);

  const filteredProducts = limit
    ? allProducts
        ?.slice()
        .sort(() => Math.random() - 0.5)
        .slice(0, limit)
    : allProducts;

  const categoryTitles: Record<CategoryFilter, string> = {
    all: 'All Products',
    sarms: 'SARMs Collection',
    peptides: 'Peptides Collection',
    'glp-1': 'GLP-1',
    'erectile-performance': 'Erectile Performance',
    dilutes: 'PCT',
  };

  const categoryDescriptions: Record<CategoryFilter, string> = {
    all: 'Browse our complete range of premium research compounds',
    sarms: 'Selective Androgen Receptor Modulators for advanced research',
    peptides: 'High-purity lyophilised peptides for laboratory applications',
    'glp-1': 'GLP-1 receptor agonist peptides for metabolic and weight management research',
    'erectile-performance': 'Research peptides studied for sexual health and erectile function applications',
    dilutes: 'Post-cycle therapy compounds for hormonal research applications',
  };

  const categoryHref: Record<CategoryFilter, string> = {
    all: '/products',
    sarms: '/sarms',
    peptides: '/peptides',
    'glp-1': '/glp-1',
    'erectile-performance': '/erectile-performance',
    dilutes: '/dilutes',
  };

  return (
    <section className="py-12 md:py-16" id="products">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground mb-2">
              {limit ? 'Featured' : 'Catalogue'}
            </p>
            <h2 className="text-3xl md:text-4xl font-serif font-normal text-foreground">
              {categoryTitles[category]}
            </h2>
          </div>
          {limit && allProducts && allProducts.length > limit && (
            <Link
              to={categoryHref[category]}
              className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent transition-colors duration-200 group"
            >
              View all {allProducts.length}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
            </Link>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-accent/50" />
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="text-center py-16">
            <p className="text-sm text-muted-foreground">Unable to load products.</p>
          </div>
        )}

        {/* Grid */}
        {!isLoading && filteredProducts && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 items-stretch">
            {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                className="animate-fade-in flex w-full"
                style={{ animationDelay: `${index * 0.06}s` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!isLoading && filteredProducts?.length === 0 && (
          <div className="text-center py-16">
            <p className="text-sm text-muted-foreground">No products found.</p>
          </div>
        )}

        {/* Mobile View All */}
        {limit && allProducts && allProducts.length > limit && (
          <div className="mt-8 text-center sm:hidden">
            <Button variant="gold-outline" asChild>
              <Link to={categoryHref[category]}>
                View all products <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        )}

        {/* Desktop View All CTA (full-width, when limit set) */}
        {limit && allProducts && allProducts.length > limit && (
          <div className="hidden sm:flex justify-center mt-10">
            <Button variant="outline" className="rounded-sm px-8 text-sm" asChild>
              <Link to={categoryHref[category]}>
                View all products <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};
