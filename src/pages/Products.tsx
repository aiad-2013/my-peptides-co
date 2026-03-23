import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { ProductGrid } from '@/components/ProductGrid';
import { Footer } from '@/components/Footer';
import { SocialProofNotification } from '@/components/SocialProofNotification';
import { useSEO } from '@/hooks/useSEO';

type CategoryFilter = 'all' | 'sarms' | 'peptides' | 'glp-1' | 'performance-enhancements' | 'erectile-performance' | 'dilutes';

interface ProductsProps {
  category: CategoryFilter;
}

const SEO_MAP: Record<CategoryFilter, { title: string; description: string }> = {
  all: {
    title: 'Buy SARMs & Peptides Online Australia | My Peptide Co',
    description: 'Shop pharmaceutical-grade SARMs and peptides in Australia. RAD-140, MK-677, BPC-157, TB-500 and more. 99%+ purity, third-party tested, fast dispatch.',
  },
  sarms: {
    title: 'Buy SARMs Australia — RAD-140, MK-677, LGD-4033 | My Peptide Co',
    description: 'High-purity SARMs for sale in Australia. Shop RAD-140, MK-677, LGD-4033, SR-9009 and more. Lab-tested, same-day dispatch on orders before 12pm.',
  },
  peptides: {
    title: 'Buy Peptides Australia — BPC-157, TB-500, CJC-1295 | My Peptide Co',
    description: 'Premium research peptides for sale in Australia. BPC-157, TB-500, CJC-1295, Ipamorelin and more. Pharmaceutical-grade purity, lab-verified, fast shipping.',
  },
  'glp-1': {
    title: 'Buy GLP-1 Peptides Australia — Retatrutide, Tirzepatide | My Peptide Co',
    description: 'Shop research-grade GLP-1 peptides in Australia. Retatrutide, Tirzepatide, 5-Amino-1MQ and more. Lab-tested, fast dispatch.',
  },
  'performance-enhancements': {
    title: 'Buy Performance Enhancement Compounds Australia | My Peptide Co',
    description: 'Research-grade performance enhancement compounds in Australia. Lab-tested, same-day dispatch.',
  },
  'erectile-performance': {
    title: 'Buy Erectile Performance Peptides Australia — PT-141 | My Peptide Co',
    description: 'Research-grade erectile performance peptides in Australia. PT-141, HCG and more. Lab-tested, same-day dispatch.',
  },
  dilutes: {
    title: 'Buy PCT Compounds Australia — Clomid, Nolvadex | My Peptide Co',
    description: 'Research-grade post-cycle therapy compounds in Australia. Clomiphene (Clomid), Tamoxifen (Nolvadex). Lab-tested, same-day dispatch.',
  },
};

const Products = ({ category }: ProductsProps) => {
  const seo = SEO_MAP[category];
  useSEO(seo);
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero activeCategory={category} compact />
        <ProductGrid category={category} />
      </main>
      <Footer />
      <SocialProofNotification />
    </div>
  );
};

export default Products;
