import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { ProductGrid } from '@/components/ProductGrid';
import { Footer } from '@/components/Footer';
import { SocialProofNotification } from '@/components/SocialProofNotification';
import { HomepageFAQ } from '@/components/HomepageFAQ';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Beaker, Truck, ArrowRight } from 'lucide-react';

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
            <Icon className="w-4 h-4 text-accent flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-primary-foreground">{label}</p>
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
  <section className="py-12 md:py-16">
    <div className="container mx-auto px-4">
      <div className="grid md:grid-cols-2 gap-4">

        {/* SARMs — dark */}
        <Link
          to="/sarms"
          className="group relative overflow-hidden rounded-sm bg-primary flex flex-col justify-end p-8 min-h-[280px]"
        >
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `linear-gradient(hsl(0 0% 100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)`,
              backgroundSize: '48px 48px',
            }}
          />
          <div className="absolute top-0 right-0 w-72 h-72 bg-accent/15 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="relative">
            <p className="text-[10px] uppercase tracking-[0.2em] text-accent/70 mb-3">Category</p>
            <h3 className="text-3xl font-serif font-normal text-white mb-2">SARMs</h3>
            <p className="text-sm text-white/50 mb-6 font-light">Selective Androgen Receptor Modulators</p>
            <span className="inline-flex items-center gap-2 text-sm font-medium text-accent group-hover:gap-3 transition-all duration-300">
              Explore range <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </Link>

        {/* Peptides — mid-dark */}
        <Link
          to="/peptides"
          className="group relative overflow-hidden rounded-sm flex flex-col justify-end p-8 min-h-[280px]"
          style={{ backgroundColor: 'hsl(213 18% 22%)' }}
        >
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `linear-gradient(hsl(0 0% 100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)`,
              backgroundSize: '48px 48px',
            }}
          />
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="relative">
            <p className="text-[10px] uppercase tracking-[0.2em] text-accent/70 mb-3">Category</p>
            <h3 className="text-3xl font-serif font-normal text-white mb-2">Peptides</h3>
            <p className="text-sm text-white/50 mb-6 font-light">Bioactive compounds for precision research</p>
            <span className="inline-flex items-center gap-2 text-sm font-medium text-accent group-hover:gap-3 transition-all duration-300">
              Explore range <ArrowRight className="w-4 h-4" />
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
    <div className="absolute -left-32 top-1/2 -translate-y-1/2 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
    <div className="absolute -right-32 top-1/2 -translate-y-1/2 w-64 h-64 bg-accent/6 rounded-full blur-3xl pointer-events-none" />

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

      {/* Fixed hero + trust strip — sits below sticky header (top-[64px] md:top-[80px]) */}
      <div className="fixed left-0 right-0 top-[64px] md:top-[80px] z-30">
        <Hero onShopClick={scrollToProducts} activeCategory="all" />
        <TrustStrip />
      </div>

      {/* Spacer pushes scrollable content below the fixed block */}
      <div
        className="relative z-40 bg-background"
        style={{ marginTop: 'calc(var(--fixed-hero-height, 100vh) - 64px)' }}
      >
        {/* We use a dynamic spacer via a sentinel — simpler: just give it enough top margin */}
      </div>

      <main className="relative z-40 bg-background">
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
