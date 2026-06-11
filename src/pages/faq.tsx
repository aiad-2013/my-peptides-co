import { createFileRoute } from '@tanstack/react-router';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export const Route = createFileRoute('/faq')({
  head: () => ({
    meta: [
      { title: 'FAQ — SARMs & Peptides Questions Answered | My Peptide Co' },
      { name: 'description', content: 'Answers to common questions about buying SARMs and peptides in Australia. Shipping, purity, storage, returns and more — answered by My Peptide Co.' },
    ],
  }),
  component: FAQ,
});

const faqs = [
  {
    question: 'What are your products used for?',
    answer: 'All products sold by Vicorpus are intended for laboratory and research purposes only. They are not for human consumption.',
  },
  {
    question: 'Are your products third-party tested?',
    answer: 'Yes, every batch is independently verified by third-party laboratories for purity and quality assurance. We maintain 99%+ purity standards across all our compounds.',
  },
  {
    question: 'How do I place an order?',
    answer: 'Simply browse our product range, add items to your cart, and proceed to checkout. We accept various payment methods for your convenience.',
  },
  {
    question: 'How long does shipping take?',
    answer: 'Domestic orders within Australia are typically dispatched within 1-2 business days. Delivery usually takes 2-5 business days depending on your location.',
  },
  {
    question: 'Do you ship internationally?',
    answer: 'Currently, we only ship within Australia. We are working on expanding our shipping capabilities to serve international customers in the future.',
  },
  {
    question: 'What is your return policy?',
    answer: 'We accept returns of unopened, unused products within 30 days of delivery. Please visit our Returns page for full details.',
  },
  {
    question: 'How should I store the products?',
    answer: 'Products should be stored in a cool, dry place away from direct sunlight. Specific storage instructions are included with each product.',
  },
  {
    question: 'Can I track my order?',
    answer: 'Yes, once your order has been dispatched you will receive a tracking number via email. You can also use our Track Order page to check the status of your delivery.',
  },
];

function FAQ() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mb-3 text-center">
            Frequently Asked Questions
          </h1>
          <p className="text-muted-foreground text-center mb-10 max-w-xl mx-auto">
            Find answers to common questions about our products, shipping, and policies.
          </p>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </main>
      <Footer />
    </div>
  );
}
