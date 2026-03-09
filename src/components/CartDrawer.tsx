import { useNavigate } from 'react-router-dom';
import { X, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer = ({ isOpen, onClose }: CartDrawerProps) => {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-foreground/10 backdrop-blur-[2px]" onClick={onClose} />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 w-full max-w-sm h-screen flex flex-col animate-slide-in-right bg-card border-l border-border"
        style={{
          boxShadow: '-20px 0 60px hsl(213 22% 12% / 0.18), -4px 0 16px hsl(213 22% 12% / 0.08)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium tracking-wide">
              Cart{items.length > 0 && <span className="ml-2 text-muted-foreground font-normal">({items.length})</span>}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-none">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <ShoppingBag className="w-5 h-5 text-muted-foreground/40" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">Your cart is empty</p>
              <p className="text-xs text-muted-foreground/60 mb-6">Add a product to begin</p>
              <Button variant="ghost" size="sm" className="text-xs" onClick={onClose}>
                Continue browsing
              </Button>
            </div>
          ) : (
            <div className="space-y-5 py-2">
              {items.map((item) => (
                <div key={item.id} className="group flex gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-foreground leading-snug line-clamp-1">
                          {item.name}
                        </p>
                        {item.concentration && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {item.concentration}{item.volume && ` · ${item.volume}`}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="flex-shrink-0 text-muted-foreground/40 hover:text-muted-foreground transition-colors duration-200 mt-0.5"
                        aria-label="Remove"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2.5">
                      {/* Qty stepper — minimal */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm leading-none"
                        >
                          −
                        </button>
                        <span className="text-sm tabular-nums w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm leading-none"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-sm tabular-nums text-foreground">
                        ${(item.price * item.quantity).toFixed(2)}
                        <span className="text-xs text-muted-foreground ml-1">AUD</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-border/50 space-y-4">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-muted-foreground uppercase tracking-widest">Subtotal</span>
              <div>
                <span className="text-base font-medium tabular-nums">${totalPrice.toFixed(2)}</span>
                <span className="text-xs text-muted-foreground ml-1">AUD</span>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground/60">
              Shipping and taxes calculated at checkout
            </p>
            <Button variant="gold" size="default" className="w-full rounded-sm tracking-wide" onClick={handleCheckout}>
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </Button>
            <button
              onClick={clearCart}
              className="w-full text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors duration-200 text-center py-1"
            >
              Clear cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
