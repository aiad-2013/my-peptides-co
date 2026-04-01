import { Mail, MapPin } from 'lucide-react';
import logoWhite from '@/assets/logo-white.png';

export const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="mb-1">
              <img src={logoWhite} alt="mypeptideco" className="h-8 w-auto" />
            </div>
            <p className="text-sm text-primary-foreground/40 mb-4">
              Powered by <a href="https://vicorpus.co" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">Vicorpus</a>
            </p>
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
              <li><a href="/sarms" className="hover:text-accent transition-colors">SARMs</a></li>
              <li><a href="/peptides" className="hover:text-accent transition-colors">Peptides</a></li>
              <li><a href="/blog" className="hover:text-accent transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Lab Reports</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><a href="/faq" className="hover:text-accent transition-colors">FAQ</a></li>
              <li><a href="/shipping" className="hover:text-accent transition-colors">Shipping</a></li>
              <li><a href="/returns" className="hover:text-accent transition-colors">Returns</a></li>
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
            <a href="/privacy-policy" className="hover:text-primary-foreground transition-colors">Privacy Policy</a>
            <a href="/terms-of-service" className="hover:text-primary-foreground transition-colors">Terms of Service</a>
            <a href="/returns" className="hover:text-primary-foreground transition-colors">Returns Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
