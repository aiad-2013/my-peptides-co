import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { ShoppingBag, ArrowLeft, Loader2 } from 'lucide-react';

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [redirecting, setRedirecting] = useState(false);

  if (!redirecting && items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mx-auto" />
            <p className="text-muted-foreground text-lg">Your cart is empty</p>
            <Button variant="gold-outline" onClick={() => navigate('/')}>
              Continue Shopping
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (redirecting) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="w-10 h-10 text-accent mx-auto animate-spin" />
            <p className="text-muted-foreground text-lg">Redirecting to checkout…</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleCheckout = () => {
    const products = items
      .map(item => `${item.wooCommerceId}:${item.quantity}`)
      .join(',');
    const url = `https://checkout.mypeptideco.com/checkout/?lovable_cart=1&products=${encodeURIComponent(products)}`;
    setRedirecting(true);
    window.location.href = url;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 py-8 px-4">
        <div className="max-w-lg mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="bg-card rounded-xl border border-border p-6">
            <h1 className="text-2xl font-serif font-semibold mb-6">Order Summary</h1>

            <div className="space-y-3 mb-4">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-muted-foreground">Calculated at checkout</span>
              </div>
              <div className="flex justify-between text-lg font-semibold pt-2 border-t border-border">
                <span>Total</span>
                <span>${totalPrice.toFixed(2)} AUD</span>
              </div>
            </div>

            <Button
              variant="gold"
              size="lg"
              className="w-full mt-6"
              onClick={handleCheckout}
            >
              Proceed to Checkout
            </Button>

            <p className="text-xs text-muted-foreground text-center mt-3">
              You'll be redirected to complete billing, shipping & payment
            </p>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;