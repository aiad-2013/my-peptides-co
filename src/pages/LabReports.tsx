import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { useSEO } from '@/hooks/useSEO';
import { Footer } from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { FlaskConical } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { getProxiedImageUrl } from '@/lib/imageProxy';
import { cn } from '@/lib/utils';

const categoryOrder = ['sarms', 'peptides', 'weight-loss', 'dilutes'] as const;
const categoryLabel: Record<string, string> = {
  sarms: 'SARMs',
  peptides: 'Peptides',
  'weight-loss': 'Weight Loss',
  dilutes: 'Dilutes / PCT',
};

function getLabImageIndex(productId: string): number {
  const slug = productId.toLowerCase();
  if (slug.includes('glow')) return 4;
  if (slug.includes('klow')) return 5;
  return 2;
}

export default function LabReports() {
  useSEO({
    title: 'Lab Reports & Certificates of Analysis | My Peptide Co',
    description: 'Third-party Certificates of Analysis for all SARMs and peptides sold by My Peptide Co. Verify purity and quality of every batch we carry.',
  });

  const { data: products = [], isLoading } = useProducts();
  const [selected, setSelected] = useState<{ name: string; src: string } | null>(null);

  const byCategory = categoryOrder.map(cat => ({
    cat,
    label: categoryLabel[cat],
    items: products.filter(p => p.category === cat),
  })).filter(g => g.items.length > 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Page Hero */}
        <section className="bg-primary text-primary-foreground py-16 md:py-24 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage: `linear-gradient(hsl(0 0% 100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)`,
              backgroundSize: '64px 64px',
            }}
          />
          <div className="absolute -left-24 top-1/2 -translate-y-1/2 w-72 h-72 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
          <div className="container mx-auto px-4 relative">
            <p className="text-[10px] uppercase tracking-[0.2em] text-accent/70 mb-4 flex items-center gap-2">
              <span className="w-6 h-px bg-accent/50" />
              Transparency
            </p>
            <h1 className="text-3xl md:text-5xl font-serif font-normal leading-tight mb-4 text-white">
              Certificates of Analysis
            </h1>
            <p className="text-base text-primary-foreground/50 max-w-xl font-light leading-relaxed">
              Every compound we carry is independently tested by an accredited third-party laboratory.
              CoAs for each batch are listed below and available on request.
            </p>
          </div>
        </section>

        {/* Product Grid */}
        <section className="container mx-auto px-4 py-14 md:py-20">
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            </div>
          ) : (
            <div className="space-y-14">
              {byCategory.map(({ cat, label, items }) => (
                <section key={cat}>
                  <h2 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-6 flex items-center gap-3">
                    <span className="w-5 h-px bg-border" />
                    {label}
                    <span className="text-border">·</span>
                    <span>{items.length}</span>
                  </h2>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {items.map(product => {
                      const imgs = product.images && product.images.length > 0
                        ? product.images
                        : product.image ? [product.image] : [];
                      const labIndex = getLabImageIndex(product.id ?? '');
                      const labImageRaw = imgs[labIndex];
                      const labImageSrc = labImageRaw ? getProxiedImageUrl(labImageRaw) : null;
                      const primarySrc = imgs[0] ? getProxiedImageUrl(imgs[0]) : null;

                      return (
                        <div
                          key={product.id}
                          className="bg-card border border-border rounded-sm overflow-hidden flex flex-col group"
                        >
                          {/* CoA image or fallback */}
                          <button
                            className="relative aspect-square bg-secondary/40 overflow-hidden cursor-zoom-in"
                            onClick={() => labImageSrc && setSelected({ name: `${product.name} — CoA`, src: labImageSrc })}
                            disabled={!labImageSrc}
                            aria-label={labImageSrc ? `View CoA for ${product.name}` : `No CoA available for ${product.name}`}
                          >
                            {labImageSrc ? (
                              <img
                                src={labImageSrc}
                                alt={`${product.name} Certificate of Analysis`}
                                className="absolute inset-0 w-full h-full object-contain p-3 transition-transform duration-300 group-hover:scale-105"
                              />
                            ) : (
                              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                                <FlaskConical className="w-5 h-5 text-muted-foreground/30" />
                                <span className="text-[9px] text-muted-foreground/40 italic">Coming Soon</span>
                              </div>
                            )}
                            {labImageSrc && (
                              <div className="absolute top-1.5 right-1.5 bg-accent/90 text-accent-foreground text-[8px] uppercase tracking-widest px-1.5 py-0.5 rounded-sm font-medium">
                                CoA
                              </div>
                            )}
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
                                {product.volume ? ` · ${product.volume}` : ''}
                              </p>
                            )}
                            <div className="flex items-center justify-between mt-1">
                              <Badge
                                variant="outline"
                                className="text-[9px] px-1.5 py-0.5 border-border/60 text-muted-foreground font-normal rounded-sm"
                              >
                                {categoryLabel[product.category]}
                              </Badge>
                              <span className="text-[9px] text-muted-foreground/50">
                                {imgs.length} img{imgs.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>

                          {/* Image strip */}
                          {imgs.length > 0 && (
                            <div className="flex gap-1 px-2.5 pb-2.5">
                              {imgs.slice(0, 4).map((src, i) => (
                                <button
                                  key={i}
                                  onClick={() => setSelected({ name: `${product.name} — image ${i + 1}`, src: getProxiedImageUrl(src) })}
                                  className={cn(
                                    "relative w-8 h-8 rounded-sm border overflow-hidden flex-shrink-0 cursor-zoom-in hover:border-accent/60 transition-colors",
                                    i === labIndex ? "border-accent/50" : "border-border/40"
                                  )}
                                  title={i === labIndex ? 'Certificate of Analysis' : i === 0 ? 'Product photo' : `Image ${i + 1}`}
                                >
                                  <img
                                    src={getProxiedImageUrl(src)}
                                    alt={`img ${i + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                  {i === labIndex && (
                                    <div className="absolute inset-0 ring-1 ring-inset ring-accent/40 rounded-sm pointer-events-none" />
                                  )}
                                </button>
                              ))}
                              {imgs.length > 4 && (
                                <div className="w-8 h-8 rounded-sm border border-border/40 bg-secondary/60 flex items-center justify-center flex-shrink-0">
                                  <span className="text-[9px] text-muted-foreground">+{imgs.length - 4}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}

          {/* Footnote */}
          <p className="text-xs text-muted-foreground leading-relaxed mt-14">
            Can't find a report? Email us at{' '}
            <a href="mailto:hello@mypeptideco.com.au" className="text-accent hover:underline">
              hello@mypeptideco.com.au
            </a>{' '}
            and we'll send the latest CoA directly to you.
          </p>
        </section>
      </main>
      <Footer />

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
