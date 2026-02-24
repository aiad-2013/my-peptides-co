import { Button } from '@/components/ui/button';
import { Shield, Beaker, Award, FlaskConical, Syringe } from 'lucide-react';

interface HeroProps {
  onShopClick: () => void;
  activeCategory?: 'all' | 'sarms' | 'peptides';
}

const heroContent = {
  all: {
    badge: 'Third-Party Tested • Pharma Grade',
    titleLine1: 'Premium Research',
    titleLine2: 'Compounds',
    description: 'Highest purity SARMs and Peptides for laboratory research. Every batch independently verified for quality assurance.',
    cta: 'Shop All Products',
  },
  sarms: {
    badge: 'Selective Androgen Receptor Modulators',
    titleLine1: 'Research Grade',
    titleLine2: 'SARMs',
    description: 'Precisely dosed SARMs for advanced laboratory research. Each compound independently tested for purity and potency.',
    cta: 'Shop SARMs',
  },
  peptides: {
    badge: 'Bioactive Peptide Compounds',
    titleLine1: 'Clinical Grade',
    titleLine2: 'Peptides',
    description: 'Premium peptides synthesized to the highest standards for cutting-edge research applications.',
    cta: 'Shop Peptides',
  },
};

export const Hero = ({ onShopClick, activeCategory = 'all' }: HeroProps) => {
  const content = heroContent[activeCategory];

  return (
    <section className="relative overflow-hidden bg-gradient-hero text-primary-foreground">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }} />
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32 relative">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6 animate-fade-in">
            {activeCategory === 'sarms' ? <FlaskConical className="w-4 h-4 text-accent" /> :
             activeCategory === 'peptides' ? <Syringe className="w-4 h-4 text-accent" /> :
             <Award className="w-4 h-4 text-accent" />}
            <span className="text-sm font-medium text-accent">{content.badge}</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-semibold leading-tight mb-6 animate-slide-up">
            {content.titleLine1}
            <span className="block text-gradient-gold">{content.titleLine2}</span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-primary-foreground/70 mb-8 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {content.description}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Button variant="hero" onClick={onShopClick}>
              {content.cta}
            </Button>
            <Button variant="hero-outline">
              View Lab Reports
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-8 pt-8 border-t border-primary-foreground/10 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-5 h-5 text-accent" />
              <span className="text-primary-foreground/70">99%+ Purity</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Beaker className="w-5 h-5 text-accent" />
              <span className="text-primary-foreground/70">Lab Tested</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Award className="w-5 h-5 text-accent" />
              <span className="text-primary-foreground/70">Australian Made</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};
