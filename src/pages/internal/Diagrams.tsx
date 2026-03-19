import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import { getProxiedImageUrl } from '@/lib/imageProxy';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const categoryOrder = ['sarms', 'peptides', 'weight-loss', 'dilutes'] as const;
const categoryLabel: Record<string, string> = {
  sarms: 'SARMs',
  peptides: 'Peptides',
  'weight-loss': 'Weight Loss',
  dilutes: 'Dilutes / PCT',
};

export default function InternalDiagrams() {
  const { data: products = [], isLoading } = useProducts();
  const [selected, setSelected] = useState<{ name: string; src: string } | null>(null);

  // Only products that have a 2nd image (index 1 = chemical structure diagram)
  const withDiagram = products.filter(p => {
    const imgs = p.images && p.images.length > 0 ? p.images : p.image ? [p.image] : [];
    return imgs.length >= 2;
  });

  const byCategory = categoryOrder.map(cat => ({
    cat,
    label: categoryLabel[cat],
    items: withDiagram.filter(p => p.category === cat),
  })).filter(g => g.items.length > 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header bar */}
      <div className="border-b border-border bg-card px-6 py-4 flex items-center justify-between sticky top-0 z-40 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground border border-border rounded-sm px-2 py-0.5">
            Internal
          </span>
          <h1 className="text-sm font-medium text-foreground">
            Product Diagrams
          </h1>
        </div>
        <span className="text-xs text-muted-foreground">
          {withDiagram.length} product{withDiagram.length !== 1 ? 's' : ''} with diagram
        </span>
      </div>

      <main className="container mx-auto px-4 py-10 max-w-7xl">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          </div>
        ) : withDiagram.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-24">No products with diagrams found.</p>
        ) : (
          <div className="space-y-12">
            {byCategory.map(({ cat, label, items }) => (
              <section key={cat}>
                <h2 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-5 flex items-center gap-3">
                  <span className="w-5 h-px bg-border" />
                  {label}
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {items.map(product => {
                    const imgs = product.images && product.images.length > 0
                      ? product.images
                      : [product.image];
                    const primarySrc = getProxiedImageUrl(imgs[0]);
                    const diagramSrc = getProxiedImageUrl(imgs[1]);
                    const extraCount = imgs.length - 2;

                    return (
                      <div
                        key={product.id}
                        className="bg-card border border-border rounded-sm overflow-hidden flex flex-col group"
                      >
                        {/* Diagram image */}
                        <button
                          className="relative aspect-square bg-secondary/40 overflow-hidden cursor-zoom-in"
                          onClick={() => setSelected({ name: product.name, src: diagramSrc })}
                          aria-label={`View diagram for ${product.name}`}
                        >
                          <img
                            src={diagramSrc}
                            alt={`${product.name} — chemical structure`}
                            className="absolute inset-0 w-full h-full object-contain p-3 transition-transform duration-300 group-hover:scale-105"
                          />
                        </button>

                        {/* Info */}
                        <div className="p-2.5 flex flex-col gap-1 border-t border-border/60">
                           <Link
                              to={`/product/${product.id}`}
                              className="text-xs font-medium text-foreground leading-snug line-clamp-2 hover:text-accent transition-colors"
                            >
                              {product.name}
                            </Link>
                          {(product.concentration || product.dosage) && (
                            <p className="text-[10px] text-muted-foreground">
                              {product.concentration || product.dosage}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-1">
                            <Badge
                              variant="outline"
                              className="text-[9px] px-1.5 py-0.5 border-border/60 text-muted-foreground font-normal rounded-sm"
                            >
                              {categoryLabel[product.category]}
                            </Badge>
                            <div className="flex items-center gap-1">
                              {/* All image count */}
                              <span className="text-[9px] text-muted-foreground/50">
                                {imgs.length} img{imgs.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Product image strip */}
                        <div className="flex gap-1 px-2.5 pb-2.5">
                          {imgs.slice(0, 4).map((src, i) => (
                            <button
                              key={i}
                              onClick={() => setSelected({ name: `${product.name} — image ${i + 1}`, src: getProxiedImageUrl(src) })}
                              className={cn(
                                "relative w-8 h-8 rounded-sm border overflow-hidden flex-shrink-0 cursor-zoom-in hover:border-accent/60 transition-colors",
                                i === 0 ? "border-border/60" : i === 1 ? "border-accent/40" : "border-border/40"
                              )}
                              title={i === 0 ? 'Product photo' : i === 1 ? 'Chemical structure' : `Image ${i + 1}`}
                            >
                              <img
                                src={getProxiedImageUrl(src)}
                                alt={`img ${i + 1}`}
                                className="w-full h-full object-cover"
                              />
                              {i === 1 && (
                                <div className="absolute inset-0 ring-1 ring-inset ring-accent/30 rounded-sm pointer-events-none" />
                              )}
                            </button>
                          ))}
                          {extraCount > 0 && (
                            <div className="w-8 h-8 rounded-sm border border-border/40 bg-secondary/60 flex items-center justify-center flex-shrink-0">
                              <span className="text-[9px] text-muted-foreground">+{extraCount}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-card border border-border rounded-sm overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <p className="text-sm font-medium text-foreground truncate">{selected.name}</p>
              <button
                onClick={() => setSelected(null)}
                className="text-muted-foreground hover:text-foreground text-xs uppercase tracking-widest transition-colors"
              >
                Close
              </button>
            </div>
            <div className="p-4 bg-secondary/30">
              <img
                src={selected.src}
                alt={selected.name}
                className="w-full h-auto max-h-[70vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
