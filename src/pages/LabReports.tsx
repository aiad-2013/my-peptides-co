import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { useSEO } from '@/hooks/useSEO';
import { Footer } from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { FlaskConical, ExternalLink } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { getProxiedImageUrl } from '@/lib/imageProxy';

const categoryLabel: Record<string, string> = {
  sarms: 'SARMs',
  peptides: 'Peptides',
};

export default function LabReports() {
  useSEO({
    title: 'Lab Reports & Certificates of Analysis | My Peptide Co',
    description: 'Third-party Certificates of Analysis for all SARMs and peptides sold by My Peptide Co. Verify purity and quality of every batch we carry.',
  });

  const { data: products = [] } = useProducts();

  const sarms = products.filter(p => p.category === 'sarms');
  const peptides = products.filter(p => p.category === 'peptides');

  const sections = [
    { label: 'SARMs', items: sarms },
    { label: 'Peptides', items: peptides },
  ];

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

        {/* Product List */}
        <section className="container mx-auto px-4 py-14 md:py-20">
          {sections.map(({ label, items }) =>
            items.length === 0 ? null : (
              <div key={label} className="mb-14">
                <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6 flex items-center gap-3">
                  <span className="w-5 h-px bg-border" />
                  {label}
                </h2>
                <div className="divide-y divide-border border border-border rounded-sm overflow-hidden">
                  {items.map(product => {
                    const labImageRaw = product.images?.[2];
                    const labImageSrc = labImageRaw ? getProxiedImageUrl(labImageRaw) : null;
                    return (
                      <Link
                        key={product.id}
                        to={`/product/${product.id}`}
                        className="flex items-center justify-between gap-4 px-6 py-5 bg-card hover:bg-muted/30 transition-colors group"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          {/* Thumbnail: 3rd product image (lab report) or fallback icon */}
                          <div className="w-12 h-12 rounded-sm overflow-hidden bg-primary/8 flex items-center justify-center flex-shrink-0 border border-border/50">
                            {labImageSrc ? (
                              <img
                                src={labImageSrc}
                                alt={`${product.name} CoA`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <FlaskConical className="w-4 h-4 text-accent" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate group-hover:text-accent transition-colors">
                              {product.name}
                            </p>
                            {product.concentration && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {product.concentration}{product.volume ? ` · ${product.volume}` : ''}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {labImageSrc && (
                            <Badge
                              variant="outline"
                              className="gap-1.5 text-accent border-accent/40 text-[11px] font-normal px-3 py-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              View Report
                            </Badge>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )
          )}

          {/* Footnote */}
          <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
            Can't find a report? Email us at{' '}
            <a href="mailto:hello@mypeptideco.com.au" className="text-accent hover:underline">
              hello@mypeptideco.com.au
            </a>{' '}
            and we'll send the latest CoA directly to you.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
