import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Eye } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';
import { getProxiedImageUrl } from '@/lib/imageProxy';

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
}

export const ProductCard = ({ product, onViewDetails }: ProductCardProps) => {
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
    <div className="group relative bg-card rounded-lg border border-border overflow-hidden transition-all duration-300 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-1">
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
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-32 rounded-lg bg-gradient-navy shadow-lg">
              <div className="h-full flex flex-col items-center justify-center p-2">
                <div className="w-8 h-8 rounded-full bg-gradient-gold mb-2" />
                <div className="w-full h-1 bg-accent/30 rounded" />
              </div>
            </div>
          </div>
        )}

        {/* Badge */}
        {product.badge && (
          <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground font-medium">
            {product.badge}
          </Badge>
        )}

        {/* Quick View Overlay */}
        <div className="absolute inset-0 bg-primary/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Button
            variant="gold"
            size="sm"
            onClick={() => onViewDetails(product)}
            className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
          >
            <Eye className="w-4 h-4 mr-1" />
            Quick View
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        <p className="text-xs font-medium text-accent uppercase tracking-wider mb-1">
          {product.category}
        </p>

        {/* Name */}
        <Link to={`/product/${product.id}`} className="block">
          <h3 className="font-serif text-lg font-semibold text-foreground mb-1 line-clamp-1 hover:text-accent transition-colors">
            {product.name}
          </h3>
        </Link>

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
            onClick={() => addItem(product)}
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
    </div>
  );
};
