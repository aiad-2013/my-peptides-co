import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import heroBanner from '@/assets/hero-banner.webp';
import { MolecularCanvas } from '@/components/MolecularCanvas';

interface HeroProps {
  onShopClick: () => void;
  activeCategory?: 'all' | 'sarms' | 'peptides';
}

const heroContent = {
  all: {
    badge: 'Third-Party Tested · Pharma Grade',
    titleLine1: 'Premium Research',
    titleLine2: 'Compounds',
    description: 'Highest purity SARMs and Peptides for laboratory research. Every batch independently verified.',
    cta: 'View Products',
  },
  sarms: {
    badge: 'Selective Androgen Receptor Modulators',
    titleLine1: 'Research Grade',
    titleLine2: 'SARMs',
    description: 'Precisely dosed SARMs for advanced laboratory research. Each compound independently tested for purity and potency.',
    cta: 'View SARMs',
  },
  peptides: {
    badge: 'Bioactive Peptide Compounds',
    titleLine1: 'Clinical Grade',
    titleLine2: 'Peptides',
    description: 'Premium peptides synthesised to the highest standards for cutting-edge research applications.',
    cta: 'View Peptides',
  },
};

export const Hero = ({ onShopClick, activeCategory = 'all' }: HeroProps) => {
  const content = heroContent[activeCategory];

  return (
    <section
      className="relative overflow-hidden text-primary-foreground"
      style={{
        backgroundImage: `url(${heroBanner})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Gradient overlay — left-heavy, 40% opacity */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to right, hsl(213 22% 8% / 0.92) 0%, hsl(213 22% 8% / 0.75) 35%, hsl(213 22% 8% / 0.30) 65%, transparent 100%)',
          zIndex: 0,
        }}
      />

      {/* Molecular network animation — above gradient, below content */}
      <MolecularCanvas />

      <div className="container mx-auto px-4 py-20 md:py-28 lg:py-36 relative">
        <div className="max-w-xl text-left">

          {/* Clinical badge */}
          <div className="inline-flex items-center gap-2 mb-8 animate-fade-in">
            <span className="w-4 h-px bg-accent/60" />
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-accent/80">
              {content.badge}
            </span>
            <span className="w-4 h-px bg-accent/60" />
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-[56px] font-serif font-normal leading-[1.1] mb-6 animate-slide-up tracking-tight">
            {content.titleLine1}
            <span className="block text-gradient-gold italic">{content.titleLine2}</span>
          </h1>

          {/* Description */}
          <p
            className="text-base md:text-lg text-primary-foreground/60 mb-10 max-w-md leading-relaxed font-light animate-slide-up"
            style={{ animationDelay: '0.08s' }}
          >
            {content.description}
          </p>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row items-start gap-3 mb-16 animate-slide-up"
            style={{ animationDelay: '0.16s' }}
          >
            <Button variant="hero" onClick={onShopClick}>
              {content.cta}
            </Button>
            <Button variant="hero-outline" asChild>
              <Link to="/lab-reports">Lab Reports</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
