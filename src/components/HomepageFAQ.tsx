import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

const faqs = [
  {
    question: 'What are SARMs?',
    answer:
      'SARMs (Selective Androgen Receptor Modulators) are a class of therapeutic compounds with similar properties to anabolic agents, but with reduced androgenic effects. They are designed to selectively target androgen receptors in specific tissues without triggering the full spectrum of androgen effects throughout the body.',
  },
  {
    question: 'What are peptides and how are they used?',
    answer:
      'Peptides are short chains of amino acids that act as signalling molecules. They are used to study biological processes including hormone regulation, immune responses, and cellular signalling. Each peptide compound has a distinct mechanism of action and area of research application.',
  },
  {
    question: 'Do you provide third-party testing results?',
    answer:
      'Yes. We believe quality must be verifiable. Third-party Certificate of Analysis (CoA) results are available for all products to confirm purity and grade. You can request a lab report directly from any product page.',
  },
  {
    question: 'How should compounds be stored?',
    answer:
      'Store all compounds in a cool, dry environment, away from direct light, in a tightly sealed container to prevent contamination. Specific storage conditions may vary — refer to the documentation provided with each product. Most compounds carry a shelf life of at least two years when stored correctly.',
  },
  {
    question: 'Can SARMs and peptides be used together?',
    answer:
      'Depending on the research objective, compounds may be used in combination. It is essential to understand the individual mechanism and potential interaction of each before combining them. Professional discretion and thorough literature review are advised.',
  },
  {
    question: 'What is your shipping policy?',
    answer:
      'We offer fast, discreet shipping across Australia. Orders placed before 12pm AEDT Monday to Friday are dispatched same day. Full details including tracking and delivery timeframes are outlined on our Shipping page.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major payment methods for your convenience. Orders can be placed securely through our checkout — select your products, add to cart, and proceed to checkout where available payment options are displayed.',
  },
  {
    question: 'What is the shelf life of your products?',
    answer:
      'Shelf life varies by compound. Most of our SARMs and peptides have a shelf life of at least two years when stored under the recommended conditions. Always refer to the product label for the exact expiry date.',
  },
];

export const HomepageFAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section className="py-20 md:py-28 border-t border-border/50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <div className="mb-12">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground mb-3">
              Information
            </p>
            <h2 className="text-3xl md:text-4xl font-serif font-normal text-foreground">
              Commonly asked questions
            </h2>
          </div>

          {/* Accordion */}
          <div className="divide-y divide-border/60">
            {faqs.map((faq, i) => {
              const isOpen = openIndex === i;
              return (
                <div key={i}>
                  <button
                    onClick={() => toggle(i)}
                    className="w-full flex items-start justify-between gap-6 py-5 text-left group"
                  >
                    <span className={cn(
                      "text-sm font-medium leading-snug transition-colors duration-200",
                      isOpen ? "text-accent" : "text-foreground group-hover:text-accent"
                    )}>
                      {faq.question}
                    </span>
                    <span className={cn(
                      "flex-shrink-0 w-5 h-5 rounded-sm flex items-center justify-center mt-0.5 transition-all duration-200",
                      isOpen ? "bg-accent/10 text-accent" : "text-muted-foreground/50 group-hover:text-accent/60"
                    )}>
                      {isOpen
                        ? <Minus className="w-3.5 h-3.5" />
                        : <Plus className="w-3.5 h-3.5" />
                      }
                    </span>
                  </button>

                  <div className={cn(
                    "overflow-hidden transition-all duration-300 ease-out",
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  )}>
                    <p className="pb-5 text-sm text-muted-foreground leading-relaxed pr-8">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer note */}
          <p className="mt-10 text-xs text-muted-foreground/50">
            Have a question not listed here?{' '}
            <a href="mailto:info@mypeptideco.com" className="text-accent/70 hover:text-accent transition-colors duration-200 underline underline-offset-4">
              Contact us
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};
