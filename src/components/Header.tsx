import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';
import { CartDrawer } from '@/components/CartDrawer';
import logo from '@/assets/logo.png';

interface HeaderProps {
  onCategoryChange?: (category: 'all' | 'sarms' | 'peptides') => void;
  activeCategory?: 'all' | 'sarms' | 'peptides';
}

export const Header = ({ onCategoryChange, activeCategory = 'all' }: HeaderProps = {}) => {
  const { totalItems, isOpen, setIsOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleCartClick = () => {
    setIsOpen(true);
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
          <Link to="/" className="flex items-center">
            <img src={logo} alt="VI CORPUS" className="h-10 md:h-12 w-auto" />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.value}
                onClick={() => {
                  if (onCategoryChange) {
                    onCategoryChange(item.value);
                  } else {
                    navigate(`/?category=${item.value}`);
                  }
                }}
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

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const win = window as any;
                // Retry until omnisend is truly initialized
                let attempts = 0;
                const tryOpen = setInterval(() => {
                  attempts++;
                if (win.omnisend && typeof win.omnisend.push === 'function') {
                    win.omnisend.push(['openForm', '699cff09ab3b5d06ef4e699d']);
                    clearInterval(tryOpen);
                  }
                  if (attempts > 50) clearInterval(tryOpen);
                }, 100);
              }}
              className="hidden md:inline-flex text-xs"
            >
              Test Omnisend
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={totalItems > 0 ? handleCartClick : undefined}
              className={cn("relative", totalItems === 0 && "opacity-50 cursor-default")}
              disabled={totalItems === 0}
            >
              <ShoppingCart className="w-5 h-5" />
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

        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border animate-fade-in">
            {navItems.map((item) => (
              <button
                key={item.value}
                onClick={() => {
                  if (onCategoryChange) {
                    onCategoryChange(item.value);
                  } else {
                    navigate(`/?category=${item.value}`);
                  }
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
      <CartDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </header>
  );
};
