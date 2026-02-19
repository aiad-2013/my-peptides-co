import { Mail, MapPin } from 'lucide-react';
import logoWhite from '@/assets/logo-white.png';

export const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Research Disclaimer */}
      <div className="border-b border-primary-foreground/10">
        <div className="container mx-auto px-4 py-6">
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 text-center">
            <p className="text-sm text-primary-foreground/80">
              <strong className="text-accent">Research Use Only:</strong> All products sold by Vicorpus are intended for laboratory and research purposes only. Not for human consumption.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="mb-4">
              <img src={logoWhite} alt="VI CORPUS" className="h-10 w-auto" />
            </div>
            <p className="text-primary-foreground/70 max-w-md mb-6">
              Australia's trusted supplier of premium research compounds. 
              Every product is third-party tested for purity and quality assurance.
            </p>
            <div className="flex items-center gap-2 text-sm text-primary-foreground/60">
              <MapPin className="w-4 h-4" />
              <span>Melbourne, Australia</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Products</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><a href="#" className="hover:text-accent transition-colors">SARMs</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Peptides</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Lab Reports</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Bundles</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><a href="#" className="hover:text-accent transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Shipping</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Returns</a></li>
              <li><a href="/track-order" className="hover:text-accent transition-colors">Track Order</a></li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a href="mailto:support@vicorpus.com" className="hover:text-accent transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-primary-foreground/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-primary-foreground/50">
            © {new Date().getFullYear()} Vicorpus. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-primary-foreground/50">
            <a href="#" className="hover:text-primary-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary-foreground transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
