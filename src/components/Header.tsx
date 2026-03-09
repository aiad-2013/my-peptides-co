import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';
import { CartDrawer } from '@/components/CartDrawer';
import { ProductSearch } from '@/components/ProductSearch';
import logo from '@/assets/logo.png';

export const Header = () => {
  const { totalItems, isOpen, setIsOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleCartClick = () => {
    setIsOpen(true);
  };

  const navItems = [
    { label: 'All Products', to: '/products' },
    { label: 'SARMs', to: '/sarms' },
    { label: 'Peptides', to: '/peptides' },
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
            <img src={logo} alt="mypeptideco" className="h-8 md:h-10 w-auto" />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="px-4 py-2 text-sm font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
              >
                {item.label}
              </Link>
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
            {/* Search */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Search products"
            >
              <Search className="w-5 h-5" />
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
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-left px-4 py-3 text-sm font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
              >
                {item.label}
              </Link>
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
      <ProductSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
};
