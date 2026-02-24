import { useNavigate } from 'react-router-dom';
import { X, Minus, Plus, Trash2, ShoppingBag, ExternalLink } from 'lucide-react';
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
      {/* Backdrop - transparent click area */}
      <div
        className="absolute inset-0"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md animate-slide-in-right" style={{ backgroundColor: 'hsl(var(--background))', boxShadow: '-12px 0 40px rgba(0,0,0,0.25), 0 12px 40px rgba(0,0,0,0.2)' }}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border" style={{ backgroundColor: 'hsl(var(--background))' }}>
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-accent" />
              <h2 className="text-lg font-serif font-semibold">Your Cart</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto px-4 py-3 scrollbar-none min-h-[120px]" style={{ backgroundColor: 'hsl(var(--background))' }}>
            {items.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Your cart is empty</p>
                <Button variant="gold-outline" size="sm" className="mt-3" onClick={onClose}>
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 pb-3 border-b border-border last:border-0">
                    <div className="w-14 h-14 rounded bg-gradient-to-b from-muted to-secondary flex-shrink-0 flex items-center justify-center">
                      <div className="w-7 h-10 rounded bg-gradient-navy">
                        <div className="h-full flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-gradient-gold" />
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-foreground line-clamp-1">{item.name}</h3>
                      <p className="text-xs text-muted-foreground">{item.quantity} × AUD ${item.price.toFixed(2)}</p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1 text-muted-foreground hover:text-destructive transition-colors self-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-border px-4 py-3 space-y-3" style={{ backgroundColor: 'hsl(var(--background))' }}>
              <div className="flex items-center justify-between">
                <span className="font-semibold">Subtotal</span>
                <span className="font-semibold">${totalPrice.toFixed(2)} AUD</span>
              </div>
              <p className="text-xs text-muted-foreground">Shipping calculated at checkout</p>
              <Button variant="gold" size="default" className="w-full" onClick={handleCheckout}>
                Checkout
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground" onClick={clearCart}>
                Clear Cart
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
