import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { ProductGrid } from '@/components/ProductGrid';
import { Footer } from '@/components/Footer';
import { SocialProofNotification } from '@/components/SocialProofNotification';
import { HomepageFAQ } from '@/components/HomepageFAQ';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Beaker, Truck, ArrowRight } from 'lucide-react';
import peptidesBg from '@/assets/peptides-card-bg.webp';
import sarmsBg from '@/assets/sarms-card-bg.webp';

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

        {/* SARMs — photo bg */}
        <Link
          to="/sarms"
          className="group relative overflow-hidden rounded-sm flex flex-col justify-end p-8 min-h-[280px]"
          style={{
            backgroundImage: `url(${sarmsBg})`,
            backgroundSize: 'cover',
            backgroundPosition: '60% center',
          }}
        >
          <div className="absolute inset-0" style={{ background: 'linear-gradient(30deg, hsl(var(--primary) / 0.95) 0%, hsl(var(--primary) / 0.75) 40%, hsl(var(--primary) / 0.15) 65%, transparent 100%)' }} />
          <div className="relative">
            <h3 className="text-3xl font-serif font-bold text-white mb-6">SARMs</h3>
            <span className="inline-flex items-center gap-2 text-sm font-medium text-accent group-hover:gap-3 transition-all duration-300">
              Explore range <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </Link>

        {/* Peptides — photo bg */}
        <Link
          to="/peptides"
          className="group relative overflow-hidden rounded-sm flex flex-col justify-end p-8 min-h-[280px]"
          style={{
            backgroundImage: `url(${peptidesBg})`,
            backgroundSize: 'cover',
            backgroundPosition: '80% center',
          }}
        >
          <div className="absolute inset-0" style={{ background: 'linear-gradient(30deg, hsl(var(--primary) / 0.95) 0%, hsl(var(--primary) / 0.75) 40%, hsl(var(--primary) / 0.15) 65%, transparent 100%)' }} />

          <div className="relative">
            <h3 className="text-3xl font-serif font-bold text-white mb-6">Peptides</h3>
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
