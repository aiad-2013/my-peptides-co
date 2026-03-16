import { useState, useRef, type MouseEvent as ReactMouseEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Package, Eye, Images } from 'lucide-react';
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
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [added, setAdded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const imgWrapRef = useRef<HTMLDivElement>(null);
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

  const handleMouseMove = (_e: ReactMouseEvent<HTMLDivElement>) => {
    // zoom disabled
  };

  const hasRealImage = product.image && product.image !== '/placeholder.svg';

  // Build proxied image list — use the full images array when available
  const allImages = product.images && product.images.length > 0
    ? product.images
    : hasRealImage ? [product.image] : [];
  const hasMultipleImages = allImages.length > 1;

  // On hover, show the 2nd image (chemical structure) if available
  const primarySrc = hasRealImage
    ? `${getProxiedImageUrl(allImages[0])}${retryCount > 0 ? `&retry=${retryCount}` : ''}`
    : null;
  const secondarySrc = hasMultipleImages ? getProxiedImageUrl(allImages[1]) : null;

  // Show real WooCommerce image when available; fall back to molecule placeholder
  const displaySrc = !imgError && primarySrc ? primarySrc : moleculePlaceholder;
  const hoverSrc = !imgError && secondarySrc ? secondarySrc : null;

  const stockLeft = getSeededStock(product.id);
  const isLowStock = stockLeft <= 5;

  return (
    <Link
      to={`/product/${product.id}`}
      className="group relative bg-card rounded-sm border border-border overflow-hidden flex flex-col w-full h-full transition-shadow duration-500 hover:shadow-[var(--shadow-card-hover)]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div
        ref={imgWrapRef}
        className="relative aspect-square bg-gradient-to-b from-secondary/60 to-secondary overflow-hidden cursor-crosshair"
        onMouseMove={handleMouseMove}
      >
        {/* Primary image — zoom on hover when no secondary swap */}
        <img
          src={displaySrc}
          alt={product.name}
          className={cn(
            "absolute inset-0 w-full h-full transition-all duration-500 ease-out",
            hasRealImage && !imgError ? 'object-cover' : 'object-contain p-6 opacity-90',
            hoverSrc
              ? (isHovered ? 'opacity-0 scale-[1.04]' : 'opacity-100 scale-100')
              : 'scale-100'
          )}
          style={!hoverSrc && isHovered ? {
            transform: 'scale(1.8)',
            transformOrigin: zoomOrigin,
            transition: 'transform 0.15s ease-out',
          } : undefined}
          onError={hasRealImage ? handleImgError : undefined}
        />
        {/* Secondary image (hover reveal) — also zoom on hover */}
        {hoverSrc && (
          <img
            src={hoverSrc}
            alt={`${product.name} — chemical structure`}
            className={cn(
              "absolute inset-0 w-full h-full object-contain p-4 transition-all duration-500 ease-out",
              isHovered ? 'opacity-100' : 'opacity-0 scale-[0.97]'
            )}
            style={isHovered ? {
              transform: 'scale(1.5)',
              transformOrigin: zoomOrigin,
              transition: 'transform 0.15s ease-out, opacity 0.5s ease-out',
            } : undefined}
          />
        )}

        {/* Overlays — top-left */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
          {product.isBundle && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-widest px-2 py-1 bg-primary/90 text-primary-foreground rounded-sm backdrop-blur-sm">
              <Package className="w-3 h-3" />
              Bundle &amp; Save
            </span>
          )}
          {product.badge && product.badge !== 'Bundle' && (
            <span className="inline-flex items-center text-[10px] font-medium uppercase tracking-widest px-2 py-1 bg-accent/90 text-accent-foreground rounded-sm backdrop-blur-sm">
              {product.badge}
            </span>
          )}
        </div>

        {/* Multi-image indicator — top-right */}
        {hasMultipleImages && (
          <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-medium text-foreground/60 bg-background/75 backdrop-blur-sm rounded-sm px-1.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <Images className="w-3 h-3" />
            <span>{allImages.length}</span>
          </div>
        )}

        {/* Stock & viewing — bottom */}
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
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

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/product/${product.id}`); }}
              className="h-8 w-8 p-0 rounded-sm border-border/60 text-muted-foreground hover:text-foreground hover:border-border"
              aria-label="View product"
            >
              <Eye className="w-3.5 h-3.5" />
            </Button>

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
