import { Header } from '@/components/Header';
import { useSEO } from '@/hooks/useSEO';
import { Footer } from '@/components/Footer';

const Returns = () => {
  useSEO({
    title: 'Returns & Refunds Policy | My Peptide Co',
    description: 'My Peptide Co returns and refunds policy in accordance with Australian Consumer Law. Unopened products accepted within 30 days. Fast refunds on faulty or incorrect orders.',
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mb-3 text-center">
            Returns & Refunds Policy
          </h1>
          <p className="text-muted-foreground text-center mb-10 max-w-xl mx-auto">
            Our policy on returns, exchanges, and refunds — in accordance with Australian Consumer Law.
          </p>

          <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
            <h2 className="text-xl font-serif font-semibold text-foreground">Your Rights Under Australian Consumer Law</h2>
            <p>Our goods come with guarantees that cannot be excluded under the Australian Consumer Law (ACL). You are entitled to a replacement or refund for a major failure and compensation for any other reasonably foreseeable loss or damage. You are also entitled to have the goods repaired or replaced if the goods fail to be of acceptable quality and the failure does not amount to a major failure.</p>

            <h2 className="text-xl font-serif font-semibold text-foreground">Change of Mind Returns</h2>
            <p>While not required by law, we offer a 30-day change-of-mind return policy for your convenience. To be eligible:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Products must be unopened, unused, and in their original sealed packaging</li>
              <li>Returns must be initiated within 30 days of delivery</li>
              <li>Proof of purchase (order confirmation or receipt) is required</li>
              <li>Products that have been opened, used, or had their seal broken cannot be returned under change of mind</li>
            </ul>
            <p>Return shipping costs for change-of-mind returns are the responsibility of the customer.</p>

            <h2 className="text-xl font-serif font-semibold text-foreground">Faulty, Damaged, or Incorrect Items</h2>
            <p>If you receive a product that is faulty, damaged during transit, or different from what you ordered, you are entitled to a remedy under Australian Consumer Law. Please contact us within 7 days of receiving your order. We will provide:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>A full refund, or</li>
              <li>A replacement product sent at no additional cost</li>
            </ul>
            <p>We will cover all return shipping costs for faulty, damaged, or incorrectly supplied items.</p>

            <h2 className="text-xl font-serif font-semibold text-foreground">How to Initiate a Return</h2>
            <p>To start a return, please contact our support team at <a href="mailto:info@mypeptideco.com" className="text-accent hover:underline">info@mypeptideco.com</a> with:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Your order number</li>
              <li>The reason for return</li>
              <li>Photos of the product (if faulty or damaged)</li>
            </ul>
            <p>We will respond within 1–2 business days with return instructions and a return authorisation number.</p>

            <h2 className="text-xl font-serif font-semibold text-foreground">Refund Processing</h2>
            <p>Once we receive and inspect your returned item, we will notify you of the approval or rejection of your refund. Approved refunds will be processed within 5–7 business days to your original payment method. Please note your bank or payment provider may take additional time to reflect the refund in your account.</p>

            <h2 className="text-xl font-serif font-semibold text-foreground">Exceptions</h2>
            <p>We cannot accept returns for products that have been opened or used, unless the product is faulty or not as described. This is to ensure the safety and integrity of all research compounds.</p>

            <h2 className="text-xl font-serif font-semibold text-foreground">Contact Us</h2>
            <p>If you have any questions about our returns policy, please reach out to <a href="mailto:info@mypeptideco.com" className="text-accent hover:underline">info@mypeptideco.com</a>. We're here to help.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Returns;
