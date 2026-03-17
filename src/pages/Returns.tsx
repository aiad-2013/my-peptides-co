import { Header } from '@/components/Header';
import { useSEO } from '@/hooks/useSEO';
import { Footer } from '@/components/Footer';

const Returns = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mb-3 text-center">
            Returns & Refunds
          </h1>
          <p className="text-muted-foreground text-center mb-10 max-w-xl mx-auto">
            Our policy on returns, exchanges, and refunds.
          </p>

          <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
            <h2 className="text-xl font-serif font-semibold text-foreground">Return Policy</h2>
            <p>We want you to be completely satisfied with your purchase. If for any reason you are not, we accept returns of unopened and unused products within 30 days of delivery.</p>

            <h2 className="text-xl font-serif font-semibold text-foreground">Eligibility</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Products must be unopened and in their original packaging</li>
              <li>Returns must be initiated within 30 days of delivery</li>
              <li>Proof of purchase is required</li>
              <li>Products that have been opened, used, or tampered with cannot be returned</li>
            </ul>

            <h2 className="text-xl font-serif font-semibold text-foreground">How to Initiate a Return</h2>
            <p>To start a return, please contact our support team at <a href="mailto:support@vicorpus.com" className="text-accent hover:underline">support@vicorpus.com</a> with your order number and reason for return. We will provide you with return instructions and a return authorisation number.</p>

            <h2 className="text-xl font-serif font-semibold text-foreground">Refunds</h2>
            <p>Once we receive and inspect your returned item, we will notify you of the approval or rejection of your refund. Approved refunds will be processed within 5-7 business days to your original payment method.</p>

            <h2 className="text-xl font-serif font-semibold text-foreground">Damaged or Incorrect Items</h2>
            <p>If you receive a damaged or incorrect item, please contact us immediately at <a href="mailto:support@vicorpus.com" className="text-accent hover:underline">support@vicorpus.com</a>. We will arrange a replacement or full refund at no additional cost to you.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Returns;
