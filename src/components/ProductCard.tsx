import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Package } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';
import { getProxiedImageUrl } from '@/lib/imageProxy';
import moleculePlaceholder from '@/assets/molecule-placeholder.jpg';

interface ProductCardProps {
  product: Product;
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

  const imageSrc = product.image && product.image !== '/placeholder.svg'
    ? `${getProxiedImageUrl(product.image)}${retryCount > 0 ? `&retry=${retryCount}` : ''}`
    : null;

  return (
    <Link to={`/product/${product.id}`} className="group relative bg-card rounded-lg border border-border overflow-hidden transition-all duration-300 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-1 block">
      {/* Image Container */}
      <div className="relative aspect-square bg-gradient-to-b from-muted to-secondary overflow-hidden">
        {!imgError && imageSrc ? (
          <img
            src={imageSrc}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={handleImgError}
          />
        ) : (
          <img
            src={product.id !== 'bpc-157' ? moleculePlaceholder : '/placeholder.svg'}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 p-4"
          />
        )}

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
        </div>
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
