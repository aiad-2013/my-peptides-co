import { Header } from '@/components/Header';
import { useSEO } from '@/hooks/useSEO';
import { Footer } from '@/components/Footer';

const TermsOfService = () => {
  useSEO({
    title: 'Terms of Service | My Peptide Co',
    description: 'Terms and conditions for using the My Peptide Co website. Research use only. Read our terms before purchasing SARMs or peptides in Australia.',
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mb-3 text-center">
            Terms of Service
          </h1>
          <p className="text-muted-foreground text-center mb-10 max-w-xl mx-auto">
            Please read these terms carefully before using our website.
          </p>

          <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
            <p className="text-sm">Last updated: {new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

            <h2 className="text-xl font-serif font-semibold text-foreground">Acceptance of Terms</h2>
            <p>By accessing and using the Vicorpus website, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>

            <h2 className="text-xl font-serif font-semibold text-foreground">Research Use Only</h2>
            <p>All products sold by Vicorpus are intended for laboratory and research purposes only. By purchasing our products, you confirm that they will be used solely for legitimate research purposes and not for human consumption.</p>

            <h2 className="text-xl font-serif font-semibold text-foreground">Orders and Payment</h2>
            <p>All orders are subject to product availability and confirmation of the order price. We reserve the right to refuse or cancel any order for any reason, including but not limited to product availability, errors in product or pricing information, or suspected fraudulent activity.</p>

            <h2 className="text-xl font-serif font-semibold text-foreground">Intellectual Property</h2>
            <p>All content on this website, including text, graphics, logos, images, and software, is the property of Vicorpus and is protected by Australian and international copyright laws.</p>

            <h2 className="text-xl font-serif font-semibold text-foreground">Limitation of Liability</h2>
            <p>Vicorpus shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our products or services. Our total liability shall not exceed the amount paid for the product giving rise to the claim.</p>

            <h2 className="text-xl font-serif font-semibold text-foreground">Governing Law</h2>
            <p>These terms shall be governed by and construed in accordance with the laws of the State of Victoria, Australia, without regard to its conflict of law provisions.</p>

            <h2 className="text-xl font-serif font-semibold text-foreground">Changes to Terms</h2>
            <p>We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to the website. Your continued use of the website constitutes acceptance of the modified terms.</p>

            <h2 className="text-xl font-serif font-semibold text-foreground">Contact</h2>
            <p>For questions about these Terms of Service, please contact us at <a href="mailto:support@vicorpus.com" className="text-accent hover:underline">support@vicorpus.com</a>.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;
