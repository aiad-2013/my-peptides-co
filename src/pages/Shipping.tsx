import { Header } from '@/components/Header';
import { useSEO } from '@/hooks/useSEO';
import { Footer } from '@/components/Footer';
import { Truck, Clock, MapPin, PackageCheck } from 'lucide-react';

const Shipping = () => {
  useSEO({
    title: 'Shipping Information — Fast Australian Delivery | My Peptide Co',
    description: 'My Peptide Co ships SARMs and peptides Australia-wide. Same-day dispatch on orders before 12pm AEDT. Discreet packaging. 2–5 business day delivery.',
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mb-3 text-center">
            Shipping Information
          </h1>
          <p className="text-muted-foreground text-center mb-10 max-w-xl mx-auto">
            Everything you need to know about how we ship your orders.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
            {[
              { icon: Truck, title: 'Fast Dispatch', desc: 'Orders dispatched within 1-2 business days' },
              { icon: Clock, title: 'Delivery Time', desc: '2-5 business days across Australia' },
              { icon: MapPin, title: 'Domestic Only', desc: 'We currently ship within Australia only' },
              { icon: PackageCheck, title: 'Discreet Packaging', desc: 'All orders shipped in plain, unmarked packaging' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4 p-5 rounded-lg border border-border bg-card">
                <Icon className="w-6 h-6 text-accent mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
            <h2 className="text-xl font-serif font-semibold text-foreground">Shipping Policy</h2>
            <p>All orders are processed and dispatched within 1-2 business days (Monday – Friday, excluding public holidays). Once dispatched, you will receive a confirmation email with your tracking number.</p>
            <p>Standard delivery within Australia typically takes 2-5 business days depending on your location. Remote areas may experience slightly longer delivery times.</p>

            <h2 className="text-xl font-serif font-semibold text-foreground">Shipping Rates</h2>
            <p>We offer flat-rate shipping across Australia. Shipping costs are calculated at checkout based on your order total and delivery location.</p>

            <h2 className="text-xl font-serif font-semibold text-foreground">Order Tracking</h2>
            <p>Once your order has been dispatched, you can track it using the tracking number provided in your shipping confirmation email, or by visiting our <a href="/track-order" className="text-accent hover:underline">Track Order</a> page.</p>

            <h2 className="text-xl font-serif font-semibold text-foreground">Lost or Damaged Packages</h2>
            <p>If your package is lost or arrives damaged, please contact us at <a href="mailto:info@mypeptideco.com" className="text-accent hover:underline">info@mypeptideco.com</a> within 7 days of the expected delivery date and we will resolve the issue promptly.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Shipping;
