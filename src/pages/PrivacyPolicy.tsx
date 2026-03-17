import { Header } from '@/components/Header';
import { useSEO } from '@/hooks/useSEO';
import { Footer } from '@/components/Footer';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mb-3 text-center">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground text-center mb-10 max-w-xl mx-auto">
            How we collect, use, and protect your information.
          </p>

          <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
            <p className="text-sm">Last updated: {new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

            <h2 className="text-xl font-serif font-semibold text-foreground">Information We Collect</h2>
            <p>When you place an order or interact with our website, we may collect the following information:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Name and contact details (email address, phone number)</li>
              <li>Shipping and billing address</li>
              <li>Payment information (processed securely through our payment provider)</li>
              <li>Order history and preferences</li>
              <li>Website usage data through cookies and analytics</li>
            </ul>

            <h2 className="text-xl font-serif font-semibold text-foreground">How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Process and fulfil your orders</li>
              <li>Communicate with you about your orders and account</li>
              <li>Improve our website and services</li>
              <li>Send marketing communications (with your consent)</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2 className="text-xl font-serif font-semibold text-foreground">Data Protection</h2>
            <p>We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, alteration, disclosure, or destruction.</p>

            <h2 className="text-xl font-serif font-semibold text-foreground">Third-Party Sharing</h2>
            <p>We do not sell your personal information. We may share your data with trusted third parties only for the purposes of order fulfilment (e.g., shipping carriers, payment processors).</p>

            <h2 className="text-xl font-serif font-semibold text-foreground">Cookies</h2>
            <p>Our website uses cookies to enhance your browsing experience and analyse site traffic. You can manage your cookie preferences through your browser settings.</p>

            <h2 className="text-xl font-serif font-semibold text-foreground">Your Rights</h2>
            <p>Under Australian Privacy Law, you have the right to access, correct, or delete your personal information. To exercise these rights, please contact us at <a href="mailto:support@vicorpus.com" className="text-accent hover:underline">support@vicorpus.com</a>.</p>

            <h2 className="text-xl font-serif font-semibold text-foreground">Contact</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:support@vicorpus.com" className="text-accent hover:underline">support@vicorpus.com</a>.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
