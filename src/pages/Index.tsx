import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { ProductGrid } from '@/components/ProductGrid';
import { Footer } from '@/components/Footer';
import { SocialProofNotification } from '@/components/SocialProofNotification';
import { HomepageFAQ } from '@/components/HomepageFAQ';
import { Button } from '@/components/ui/button';
import { ShieldCheck, FlaskConical, Truck, ArrowRight, Beaker } from 'lucide-react';

/* ── Trust Strip ───────────────────────────────────── */
const TrustStrip = () => (
  <div className="bg-primary text-primary-foreground">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-primary-foreground/10">
        {[
          { icon: ShieldCheck, label: '99%+ Purity', sub: 'Third-party verified' },
          { icon: Beaker, label: 'Lab Tested', sub: 'Certificate of Analysis on every batch' },
          { icon: Truck, label: 'Same-Day Dispatch', sub: 'Order before 12pm AEDT, Mon–Fri' },
        ].map(({ icon: Icon, label, sub }) => (
          <div key={label} className="flex items-center gap-4 px-6 py-5">
            <Icon className="w-5 h-5 text-accent flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-primary-foreground/50 mt-0.5">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ── Category Split ────────────────────────────────── */
const CategorySplit = () => (
  <section className="py-12 md:py-16 border-t border-border/40">
    <div className="container mx-auto px-4">
      <div className="grid md:grid-cols-2 gap-4">
        {/* SARMs */}
        <Link
          to="/sarms"
          className="group relative overflow-hidden rounded-sm bg-primary aspect-[16/7] flex flex-col justify-end p-8"
        >
          {/* Grid texture */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `linear-gradient(hsl(0 0% 100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)`,
              backgroundSize: '48px 48px',
            }}
          />
          {/* Teal glow */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-accent/10 blur-3xl translate-x-1/3 -translate-y-1/3" />
          <div className="relative">
            <p className="text-[10px] uppercase tracking-[0.2em] text-accent/70 mb-2">Category</p>
            <h3 className="text-2xl md:text-3xl font-serif font-normal text-white mb-1">SARMs</h3>
            <p className="text-sm text-white/50 mb-5">Selective Androgen Receptor Modulators</p>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-accent group-hover:gap-3 transition-all duration-300">
              Explore range <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Link>

        {/* Peptides */}
        <Link
          to="/peptides"
          className="group relative overflow-hidden rounded-sm bg-secondary aspect-[16/7] flex flex-col justify-end p-8 border border-border"
        >
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, hsl(213 22% 12%) 1px, transparent 0)`,
              backgroundSize: '32px 32px',
            }}
          />
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-accent/6 blur-3xl translate-x-1/3 -translate-y-1/3" />
          <div className="relative">
            <p className="text-[10px] uppercase tracking-[0.2em] text-accent mb-2">Category</p>
            <h3 className="text-2xl md:text-3xl font-serif font-normal text-foreground mb-1">Peptides</h3>
            <p className="text-sm text-muted-foreground mb-5">Bioactive compounds for precision research</p>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-accent group-hover:gap-3 transition-all duration-300">
              Explore range <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Link>
      </div>
    </div>
  </section>
);

/* ── Editorial Band ────────────────────────────────── */
const EditorialBand = () => (
  <section className="bg-primary text-primary-foreground py-16 md:py-24 overflow-hidden relative">
    <div
      className="absolute inset-0 opacity-[0.035]"
      style={{
        backgroundImage: `linear-gradient(hsl(0 0% 100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)`,
        backgroundSize: '64px 64px',
      }}
    />
    {/* Glow orbs */}
    <div className="absolute -left-32 top-1/2 -translate-y-1/2 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
    <div className="absolute -right-32 top-1/2 -translate-y-1/2 w-64 h-64 bg-accent/6 rounded-full blur-3xl" />

    <div className="container mx-auto px-4 relative">
      <div className="max-w-2xl">
        <p className="text-[10px] uppercase tracking-[0.2em] text-accent/70 mb-4 flex items-center gap-2">
          <span className="w-6 h-px bg-accent/50" />
          Our Standard
        </p>
        <h2 className="text-3xl md:text-5xl font-serif font-normal leading-tight mb-6 text-white">
          Pharmaceutical-grade compounds.<br />
          <span className="text-accent/80 italic">Every single batch.</span>
        </h2>
        <p className="text-base text-primary-foreground/50 leading-relaxed mb-8 max-w-lg font-light">
          Every compound we carry is independently tested by an accredited third-party laboratory. 
          Certificates of Analysis are available on request — because transparency is the baseline, not a selling point.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="hero" asChild>
            <Link to="/products">Shop Compounds</Link>
          </Button>
          <Button variant="hero-outline" asChild>
            <Link to="/faq">Learn More</Link>
          </Button>
        </div>
      </div>
    </div>
  </section>
);

/* ── Index Page ────────────────────────────────────── */
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
        <TrustStrip />
        <CategorySplit />
        <div ref={productsRef}>
          <ProductGrid category="all" limit={4} />
        </div>
        <EditorialBand />
        <HomepageFAQ />
      </main>
      <Footer />
      <SocialProofNotification />
    </div>
  );
};

export default Index;
