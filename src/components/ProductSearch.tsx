import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ShoppingCart, Eye, Package } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';
import { Product } from '@/types/product';

interface ProductSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProductSearch = ({ isOpen, onClose }: ProductSearchProps) => {
  const [query, setQuery] = useState('');
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: products } = useProducts();
  const { addItem } = useCart();
  const navigate = useNavigate();

  // Sanitize & filter
  const sanitized = query.trim().toLowerCase().replace(/[<>"']/g, '');
  const results: Product[] = sanitized.length < 2
    ? []
    : (products ?? []).filter(p =>
        p.name.toLowerCase().includes(sanitized) ||
        p.id.toLowerCase().includes(sanitized) ||
        (p.sku && p.sku.toLowerCase().includes(sanitized)) ||
        (p.category && p.category.toLowerCase().includes(sanitized))
      ).slice(0, 8);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleAddToCart = useCallback((e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    addItem(product);
    setAddedIds(prev => new Set(prev).add(product.id));
    setTimeout(() => setAddedIds(prev => { const n = new Set(prev); n.delete(product.id); return n; }), 1800);
  }, [addItem]);

  const handleView = useCallback((e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    navigate(`/product/${product.id}`);
    onClose();
  }, [navigate, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[10vh] px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-xl bg-card border border-border rounded-sm shadow-2xl overflow-hidden animate-slide-up">

        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value.slice(0, 100))}
            placeholder="Search by name or SKU…"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results */}
        {sanitized.length >= 2 && (
          <div className="max-h-[60vh] overflow-y-auto scrollbar-none">
            {results.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-muted-foreground">No products found for "<span className="text-foreground">{sanitized}</span>"</p>
              </div>
            ) : (
              <ul className="py-2">
                {results.map((product) => (
                  <li
                    key={product.id}
                    className="flex items-center gap-4 px-4 py-3 hover:bg-muted/50 transition-colors duration-150 cursor-pointer group"
                    onClick={(e) => handleView(e, product)}
                  >
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        {product.isBundle && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-medium uppercase tracking-wider px-1.5 py-0.5 bg-primary text-primary-foreground rounded-sm">
                            <Package className="w-2.5 h-2.5" />
                            Bundle
                          </span>
                        )}
                        <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="uppercase tracking-wide">{product.category}</span>
                        {product.sku && <><span>·</span><span>SKU: {product.sku}</span></>}
                        {product.concentration && <><span>·</span><span>{product.concentration}</span></>}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-sm font-medium text-foreground tabular-nums flex-shrink-0">
                      ${product.price.toFixed(2)}
                      <span className="text-xs text-muted-foreground ml-1">AUD</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={(e) => handleView(e, product)}
                        className="w-8 h-8 flex items-center justify-center rounded-sm border border-border/60 text-muted-foreground hover:text-foreground hover:border-border transition-colors duration-200"
                        aria-label="View product"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleAddToCart(e, product)}
                        disabled={!product.inStock}
                        className={cn(
                          "w-8 h-8 flex items-center justify-center rounded-sm transition-all duration-200",
                          addedIds.has(product.id)
                            ? "bg-foreground text-background scale-95"
                            : "bg-accent text-accent-foreground hover:opacity-90",
                          !product.inStock && "opacity-30 cursor-not-allowed"
                        )}
                        aria-label="Add to cart"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Hint when empty */}
        {sanitized.length < 2 && (
          <div className="py-8 text-center">
            <p className="text-xs text-muted-foreground">Type at least 2 characters to search</p>
          </div>
        )}
      </div>
    </div>
  );
};
