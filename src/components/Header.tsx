import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, Search, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';
import { CartDrawer } from '@/components/CartDrawer';
import { ProductSearch } from '@/components/ProductSearch';
import logo from '@/assets/logo.png';

const shopCategories = [
  { label: 'All Products', to: '/products' },
  { label: 'SARMs', to: '/sarms' },
  { label: 'Peptides', to: '/peptides' },
  { label: 'GLP-1', to: '/glp-1' },
  { label: 'Erectile Performance', to: '/erectile-performance' },
  { label: 'Dilutes', to: '/dilutes' },
];

export const Header = () => {
  const { totalItems, isOpen, setIsOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const handleCartClick = () => {
    setIsOpen(true);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShopDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setShopDropdownOpen(false);
  }, [location.pathname]);

  const shopPaths = shopCategories.map(c => c.to);
  const isShopActive = shopPaths.includes(location.pathname);

  const beforeShopItems = [
    { label: 'Home', to: '/' },
  ];

  const afterShopItems = [
    { label: 'Blog', to: '/blog' },
    { label: 'Track My Order', to: '/track-order' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex-shrink-0">
            <img src={logo} alt="mypeptideco" className="h-8 md:h-10 w-auto object-contain block" />
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {/* Home */}
            {beforeShopItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="px-4 py-2 text-sm font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
              >
                {item.label}
              </Link>
            ))}

            {/* Shop dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShopDropdownOpen(prev => !prev)}
                className={cn(
                  'flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200',
                  isShopActive
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Shop
                <ChevronDown className={cn('w-3.5 h-3.5 transition-transform duration-200', shopDropdownOpen && 'rotate-180')} />
              </button>

              {shopDropdownOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-52 bg-background border border-border rounded-md shadow-lg py-1 animate-fade-in">
                  {shopCategories.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setShopDropdownOpen(false)}
                      className={cn(
                        'block px-4 py-2.5 text-sm transition-colors duration-150',
                        location.pathname === item.to
                          ? 'text-foreground bg-muted font-medium'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            
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
            {/* Search pill — desktop */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden sm:flex items-center gap-2.5 px-3.5 py-2 rounded-md border border-border bg-muted/60 hover:bg-muted hover:border-border/80 text-muted-foreground hover:text-foreground transition-all duration-200 text-sm min-w-[180px]"
              aria-label="Search products"
            >
              <Search className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 text-left text-xs">Search products…</span>
            </button>

            {/* Search icon — mobile only */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
              className="sm:hidden text-muted-foreground hover:text-foreground"
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
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-border animate-fade-in">
            {/* Shop expandable group */}
            <button
              onClick={() => setMobileShopOpen(prev => !prev)}
              className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
            >
              <span>Shop</span>
              <ChevronDown className={cn('w-4 h-4 transition-transform duration-200', mobileShopOpen && 'rotate-180')} />
            </button>
            {mobileShopOpen && (
              <div className="pl-4 mb-1">
                {shopCategories.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-left px-4 py-2.5 text-sm rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
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
