import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Package, Eye, Flame } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';
import { getProxiedImageUrl } from '@/lib/imageProxy';
import moleculePlaceholder from '@/assets/molecule-placeholder.jpg';

interface ProductCardProps {
  product: Product;
}

// Deterministic "stock" number seeded by product id so it doesn't flicker
function getSeededStock(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return (hash % 8) + 3; // 3–10
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();
  const [imgError, setImgError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 2;

  const handleImgError = () => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
    } else {
      setImgError(true);
    }
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
  const showPeopleViewing = product.peopleViewing && product.peopleViewing > 0;

  return (
    <Link to={`/product/${product.id}`} className="group relative bg-card rounded-lg border border-border overflow-hidden transition-all duration-300 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-1 block">
      {/* Image Container */}
      <div className="relative aspect-square bg-gradient-to-b from-muted to-secondary overflow-hidden">
        <img
          src={isBpc && !imgError && realImageSrc ? realImageSrc : displaySrc}
          alt={product.name}
          className={`absolute inset-0 w-full h-full group-hover:scale-105 transition-transform duration-500 ${isBpc ? 'object-cover' : 'object-contain p-4'}`}
          onError={isBpc ? handleImgError : undefined}
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isBundle && (
            <Badge className="bg-primary text-primary-foreground font-medium">
              <Package className="w-3 h-3 mr-1" />
              Bundle
            </Badge>
          )}
          {product.badge && product.badge !== 'Bundle' && (
            <Badge className="bg-accent text-accent-foreground font-medium">
              {product.badge}
            </Badge>
          )}
          {isLowStock && product.inStock && (
            <Badge className="bg-destructive/90 text-destructive-foreground font-medium text-xs">
              <Flame className="w-3 h-3 mr-1" />
              Only {stockLeft} left
            </Badge>
          )}
        </div>

        {/* People Viewing */}
        {showPeopleViewing && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-full px-2 py-1">
            <Eye className="w-3 h-3 text-accent" />
            <span className="text-xs text-foreground font-medium">{product.peopleViewing} viewing</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        <p className="text-xs font-medium text-accent uppercase tracking-wider mb-1">
          {product.category}
        </p>

        {/* Name */}
        <h3 className="font-serif text-lg font-semibold text-foreground mb-1 line-clamp-1 group-hover:text-accent transition-colors">
          {product.name}
        </h3>

        {/* Concentration */}
        {product.concentration && (
          <p className="text-sm text-muted-foreground mb-3">
            {product.concentration} {product.volume && `• ${product.volume}`}
          </p>
        )}

        {/* Price & Add to Cart */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <span className="text-xl font-semibold text-foreground">
            ${product.price.toFixed(2)}
            <span className="text-sm font-normal text-muted-foreground ml-1">AUD</span>
          </span>

          <Button
            variant="gold"
            size="sm"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); addItem(product); }}
            disabled={!product.inStock}
            className={cn(!product.inStock && "opacity-50 cursor-not-allowed")}
          >
            <ShoppingCart className="w-4 h-4" />
          </Button>
        </div>

        {/* Stock Status */}
        {!product.inStock && (
          <p className="text-xs text-destructive mt-2 font-medium">Out of Stock</p>
        )}
      </div>
    </Link>
  );
};
