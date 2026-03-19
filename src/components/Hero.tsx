import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import heroBanner from '@/assets/hero-banner-desktop-v2.webp';
import heroBannerMobile from '@/assets/hero-banner-mobile.jpg';
import { MolecularCanvas } from '@/components/MolecularCanvas';
import { useIsMobile } from '@/hooks/use-mobile';

interface HeroProps {
  onShopClick?: () => void;
  activeCategory?: 'all' | 'sarms' | 'peptides' | 'weight-loss' | 'dilutes';
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
  'weight-loss': {
    badge: 'Metabolic Research Compounds',
    titleLine1: 'Research Grade',
    titleLine2: 'Weight Loss',
    description: 'Premium peptides studied for metabolic regulation and weight management in laboratory research.',
    cta: 'View Weight Loss',
  },
  dilutes: {
    badge: 'Post-Cycle Therapy Compounds',
    titleLine1: 'Research Grade',
    titleLine2: 'Dilutes (PCT)',
    description: 'High-purity SERMs for post-cycle therapy research. Each compound independently tested for purity and potency.',
    cta: 'View Dilutes',
  },
};

export const Hero = ({ onShopClick, activeCategory = 'all', compact = false }: HeroProps) => {
  const content = heroContent[activeCategory];
  const isMobile = useIsMobile();

  return (
    <section
      className="relative overflow-hidden text-primary-foreground flex flex-col"
      style={compact ? {
        background: 'hsl(var(--primary))',
        height: '370px',
      } : {
        backgroundColor: 'hsl(var(--accent))',
        backgroundImage: `url(${isMobile ? heroBannerMobile : heroBanner})`,
        backgroundSize: 'cover',
        backgroundPosition: isMobile ? 'center bottom' : 'center',
        minHeight: isMobile ? '102vh' : '70vh',
      }}
    >
      {/* Gradient overlay — left-heavy on desktop, full-coverage fade on mobile */}
      <div
        className="absolute inset-0"
        style={{
          background: isMobile
            ? 'linear-gradient(to bottom, hsl(213 22% 8% / 0.82) 0%, hsl(213 22% 8% / 0.65) 50%, hsl(213 22% 8% / 0.50) 100%)'
            : 'linear-gradient(to right, hsl(213 22% 8% / 0.92) 0%, hsl(213 22% 8% / 0.75) 35%, hsl(213 22% 8% / 0.30) 65%, transparent 100%)',
          zIndex: 0,
        }}
      />

      {/* Molecular network animation — above gradient, below content */}
      <MolecularCanvas pivotXFactor={compact ? 0.73 : 0.43} />

      <div
        className={`container mx-auto px-4 relative flex flex-col justify-center ${compact ? 'h-full py-0' : 'pt-10 pb-4 md:py-16 lg:py-20'}`}
        style={{ zIndex: 2 }}
      >
        <div className={`text-left ${compact ? 'max-w-3xl' : 'max-w-xl'}`}>

          {/* Clinical badge */}
          <div className="inline-flex items-center gap-3 mb-6 animate-fade-in">
            <span className="w-6 h-px bg-accent/70" />
            <span className="text-xs md:text-sm font-semibold uppercase tracking-[0.18em] text-accent">
              {content.badge}
            </span>
            <span className="w-6 h-px bg-accent/70" />
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-[56px] font-serif font-normal leading-[1.1] mb-5 animate-slide-up tracking-tight">
            {content.titleLine1}
            <span className="block text-gradient-gold italic">{content.titleLine2}</span>
          </h1>

          {/* Description */}
          <p
            className={`text-base md:text-lg text-primary-foreground/60 max-w-md leading-relaxed font-light animate-slide-up ${compact ? 'mb-0' : 'mb-10'}`}
            style={{ animationDelay: '0.08s' }}
          >
            {content.description}
          </p>

          {/* CTA Buttons — hidden on collection pages */}
          {!compact && (
            <div
              className="flex flex-col sm:flex-row items-start gap-3 mt-8 mb-16 animate-slide-up"
              style={{ animationDelay: '0.16s' }}
            >
              <Button variant="hero" onClick={onShopClick}>
                {content.cta}
              </Button>
              <Button variant="hero-outline" asChild>
                <Link to="/lab-reports">Lab Reports</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
