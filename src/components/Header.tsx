import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';

interface HeaderProps {
  onCategoryChange?: (category: 'all' | 'sarms' | 'peptides') => void;
  activeCategory?: 'all' | 'sarms' | 'peptides';
}

export const Header = ({ onCategoryChange, activeCategory = 'all' }: HeaderProps = {}) => {
  const { totalItems, items, clearCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCartClick = async () => {
    if (items.length === 0) {
      toast.info('Your cart is empty');
      return;
    }

    setIsCheckingOut(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-wc-order', {
        body: {
          items: items.map((item) => ({
            wooCommerceId: item.wooCommerceId,
            quantity: item.quantity,
            name: item.name,
            price: item.price,
          })),
        },
      });

      if (error) throw error;
      if (data?.payUrl) {
        clearCart();
        window.open(data.payUrl, '_blank');
      } else {
        throw new Error('No payment URL returned');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      toast.error('Could not create order. Please try again.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const navItems = [
    { label: 'All Products', value: 'all' as const },
    { label: 'SARMs', value: 'sarms' as const },
    { label: 'Peptides', value: 'peptides' as const },
  ];

  const linkItems = [
    { label: 'Blog', to: '/blog' },
    { label: 'Track My Order', to: '/track-order' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center">
            <img src={logo} alt="VI CORPUS" className="h-10 md:h-12 w-auto" />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.value}
                onClick={() => onCategoryChange(item.value)}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-md transition-all duration-200",
                  activeCategory === item.value
                    ? "bg-accent/10 text-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {item.label}
              </button>
            ))}
            <span className="w-px h-5 bg-border mx-1" />
            {linkItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="px-4 py-2 text-sm font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCartClick}
              className="relative"
              disabled={isCheckingOut}
            >
              {isCheckingOut ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ShoppingCart className="w-5 h-5" />
              )}
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground text-xs font-semibold rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border animate-fade-in">
            {navItems.map((item) => (
              <button
                key={item.value}
                onClick={() => {
                  onCategoryChange(item.value);
                  setMobileMenuOpen(false);
                }}
                className={cn(
                  "block w-full text-left px-4 py-3 text-sm font-medium rounded-md transition-all duration-200",
                  activeCategory === item.value
                    ? "bg-accent/10 text-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {item.label}
              </button>
            ))}
            <div className="h-px bg-border my-2 mx-4" />
            {linkItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-left px-4 py-3 text-sm font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};
