import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import heroBanner from '@/assets/hero-banner.webp';
import heroBannerMobile from '@/assets/hero-banner-mobile.jpg';
import { MolecularCanvas } from '@/components/MolecularCanvas';
import { useIsMobile } from '@/hooks/use-mobile';

interface HeroProps {
  onShopClick?: () => void;
  activeCategory?: 'all' | 'sarms' | 'peptides';
  compact?: boolean;
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
  const isMobile = useIsMobile();

  return (
    <section
      className="relative overflow-hidden text-primary-foreground min-h-[85vh] md:min-h-0 flex flex-col"
      style={{
        backgroundImage: `url(${isMobile ? heroBannerMobile : heroBanner})`,
        backgroundSize: 'cover',
        backgroundPosition: isMobile ? 'center bottom' : 'center',
      }}
    >
      {/* Gradient overlay — left-heavy on desktop, top-fade on mobile */}
      <div
        className="absolute inset-0"
        style={{
          background: isMobile
            ? 'linear-gradient(to bottom, hsl(213 22% 8% / 0.70) 0%, hsl(213 22% 8% / 0.45) 40%, transparent 70%)'
            : 'linear-gradient(to right, hsl(213 22% 8% / 0.92) 0%, hsl(213 22% 8% / 0.75) 35%, hsl(213 22% 8% / 0.30) 65%, transparent 100%)',
          zIndex: 0,
        }}
      />

      {/* Molecular network animation — above gradient, below content */}
      {!isMobile && <MolecularCanvas />}

      <div className="container mx-auto px-4 pt-10 pb-4 md:py-16 lg:py-20 relative" style={{ zIndex: 2 }}>
        <div className="max-w-xl text-left">

          {/* Clinical badge */}
          <div className="inline-flex items-center gap-3 mb-8 animate-fade-in">
            <span className="w-6 h-px bg-accent/70" />
            <span className="text-xs md:text-sm font-semibold uppercase tracking-[0.18em] text-accent">
              {content.badge}
            </span>
            <span className="w-6 h-px bg-accent/70" />
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
