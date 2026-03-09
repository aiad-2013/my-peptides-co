import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Package, Eye } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';
import { getProxiedImageUrl } from '@/lib/imageProxy';
import moleculePlaceholder from '@/assets/molecule-placeholder.jpg';

interface ProductCardProps {
  product: Product;
}

// Deterministic stock number seeded by product id
function getSeededStock(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return (hash % 8) + 3; // 3–10
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();
  const [imgError, setImgError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [added, setAdded] = useState(false);
  const maxRetries = 2;

  const handleImgError = () => {
    if (retryCount < maxRetries) setRetryCount(prev => prev + 1);
    else setImgError(true);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const isBpc = product.id === 'bpc-157' || product.name?.toLowerCase().includes('bpc');
  const realImageSrc = product.image && product.image !== '/placeholder.svg'
    ? `${getProxiedImageUrl(product.image)}${retryCount > 0 ? `&retry=${retryCount}` : ''}`
    : null;

  const displaySrc = isBpc
    ? (!imgError && realImageSrc ? realImageSrc : '/placeholder.svg')
    : moleculePlaceholder;

  const stockLeft = getSeededStock(product.id);
  const isLowStock = stockLeft <= 5;

  return (
    <Link
      to={`/product/${product.id}`}
      className="group relative bg-card rounded-sm border border-border overflow-hidden flex flex-col h-full transition-shadow duration-500 hover:shadow-[var(--shadow-card-hover)]"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gradient-to-b from-secondary/60 to-secondary overflow-hidden">
        <img
          src={isBpc && !imgError && realImageSrc ? realImageSrc : displaySrc}
          alt={product.name}
          className={cn(
            "absolute inset-0 w-full h-full transition-transform duration-700 ease-out group-hover:scale-[1.03]",
            isBpc ? 'object-cover' : 'object-contain p-6 opacity-90'
          )}
          onError={isBpc ? handleImgError : undefined}
        />

        {/* Overlays — top-left */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isBundle && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-widest px-2 py-1 bg-primary/90 text-primary-foreground rounded-sm backdrop-blur-sm">
              <Package className="w-3 h-3" />
              Bundle
            </span>
          )}
          {product.badge && product.badge !== 'Bundle' && (
            <span className="inline-flex items-center text-[10px] font-medium uppercase tracking-widest px-2 py-1 bg-accent/90 text-accent-foreground rounded-sm backdrop-blur-sm">
              {product.badge}
            </span>
          )}
        </div>

        {/* Stock & viewing — bottom */}
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {isLowStock && product.inStock && (
            <span className="text-[10px] font-medium tracking-widest uppercase text-foreground/70 bg-background/80 backdrop-blur-sm rounded-sm px-2 py-1">
              {stockLeft} remaining
            </span>
          )}
          {product.peopleViewing && product.peopleViewing > 0 && (
            <span className="ml-auto flex items-center gap-1 text-[10px] font-medium text-foreground/60 bg-background/80 backdrop-blur-sm rounded-sm px-2 py-1">
              <Eye className="w-3 h-3" />
              {product.peopleViewing}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1.5">
          {product.category}
        </p>

        <h3 className="font-serif text-base font-normal text-foreground mb-1 leading-snug group-hover:text-accent transition-colors duration-300">
          {product.name}
        </h3>

        {product.concentration && (
          <p className="text-xs text-muted-foreground tracking-wide">
            {product.concentration}{product.volume && ` · ${product.volume}`}
          </p>
        )}

        <div className="flex items-center justify-between pt-3 mt-auto border-t border-border/60">
          <div>
            <span className="text-base font-medium text-foreground tabular-nums">
              ${product.price.toFixed(2)}
            </span>
            <span className="text-xs text-muted-foreground ml-1">AUD</span>
          </div>

          <Button
            variant="gold"
            size="sm"
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={cn(
              "text-xs h-8 px-3 rounded-sm transition-all duration-300",
              added && "bg-foreground text-background scale-95",
              !product.inStock && "opacity-30 cursor-not-allowed"
            )}
          >
            {added ? (
              <span className="tracking-wide">Added</span>
            ) : (
              <ShoppingCart className="w-3.5 h-3.5" />
            )}
          </Button>
        </div>

        {!product.inStock && (
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-2">
            Unavailable
          </p>
        )}
      </div>
    </Link>
  );
};
