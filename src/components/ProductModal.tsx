import { useState, useRef, useCallback, type MouseEvent as ReactMouseEvent, type TouchEvent as ReactTouchEvent } from 'react';
import { X, Minus, Plus, ShoppingCart, Shield } from 'lucide-react';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/context/CartContext';
import { getProxiedImageUrl } from '@/lib/imageProxy';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductModal = ({ product, isOpen, onClose }: ProductModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const [imgError, setImgError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  // Desktop hover zoom
  const [isZooming, setIsZooming] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState('50% 50%');
  // Touch / pinch zoom
  const [touchScale, setTouchScale] = useState(1);
  const [touchOrigin, setTouchOrigin] = useState('50% 50%');
  const [isTapZoomed, setIsTapZoomed] = useState(false);
  const lastTapRef = useRef<number>(0);
  const pinchStartDistRef = useRef<number | null>(null);
  const pinchStartScaleRef = useRef<number>(1);
  const imgWrapRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCart();

  if (!isOpen || !product) return null;

  const handleImgError = () => {
    if (retryCount < 2) {
      setRetryCount(prev => prev + 1);
    } else {
      setImgError(true);
    }
  };

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!imgWrapRef.current) return;
    const rect = imgWrapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin(`${x}% ${y}%`);
  };

  const imageSrc = product.image && product.image !== '/placeholder.svg'
    ? `${getProxiedImageUrl(product.image)}${retryCount > 0 ? `&retry=${retryCount}` : ''}`
    : null;

  const handleAddToCart = () => {
    addItem(product, quantity);
    setQuantity(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-primary/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-card rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid md:grid-cols-2 gap-0">
          {/* Image */}
          <div
            ref={imgWrapRef}
            className="relative aspect-square bg-gradient-to-b from-muted to-secondary overflow-hidden cursor-crosshair"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => { if (!imgError && imageSrc) setIsZooming(true); }}
            onMouseLeave={() => setIsZooming(false)}
          >
            {!imgError && imageSrc ? (
              <img
                src={imageSrc}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover"
                style={{
                  transform: isZooming ? 'scale(2.5)' : 'scale(1)',
                  transformOrigin: zoomOrigin,
                  transition: isZooming ? 'transform 0.15s ease-out' : 'transform 0.3s ease-out',
                }}
                onError={handleImgError}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-44 rounded-lg bg-gradient-navy shadow-xl animate-float">
                  <div className="h-full flex flex-col items-center justify-center p-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-gold mb-3" />
                    <div className="w-full h-1.5 bg-accent/30 rounded mb-1" />
                    <div className="w-2/3 h-1 bg-accent/20 rounded" />
                  </div>
                </div>
              </div>
            )}
            {product.badge && (
              <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground pointer-events-none">
                {product.badge}
              </Badge>
            )}
            {/* Zoom hint */}
            {!imgError && imageSrc && !isZooming && (
              <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-white/50 uppercase tracking-widest pointer-events-none">
                Hover to zoom
              </p>
            )}
          </div>

          {/* Content */}
          <div className="p-6 md:p-8">
            <p className="text-sm font-medium text-accent uppercase tracking-wider mb-2">
              {product.category}
            </p>

            <h2 className="text-2xl md:text-3xl font-serif font-semibold text-foreground mb-2">
              {product.name}
            </h2>

            {product.concentration && (
              <p className="text-muted-foreground mb-4">
                {product.concentration} {product.volume && `• ${product.volume}`}
              </p>
            )}

            <p className="text-foreground/80 text-sm leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Trust Badge */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 pb-6 border-b border-border">
              <Shield className="w-4 h-4 text-accent" />
              <span>Third-party tested • 99%+ purity guaranteed</span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <span className="text-3xl font-semibold text-foreground">
                ${product.price.toFixed(2)}
              </span>
              <span className="text-muted-foreground ml-2">AUD</span>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium text-foreground">Quantity:</span>
              <div className="flex items-center border border-border rounded-md">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-muted transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 font-medium min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 hover:bg-muted transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <Button
              variant="gold"
              size="lg"
              className="w-full"
              onClick={handleAddToCart}
              disabled={!product.inStock}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Add to Cart — ${(product.price * quantity).toFixed(2)}
            </Button>

            {!product.inStock && (
              <p className="text-destructive text-sm text-center mt-3">
                Currently out of stock
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
