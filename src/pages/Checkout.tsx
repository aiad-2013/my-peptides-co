import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AddressForm, AddressFields, emptyAddress } from '@/components/AddressForm';

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [billing, setBilling] = useState<AddressFields>({ ...emptyAddress });
  const [shipping, setShipping] = useState<AddressFields>({ ...emptyAddress });
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [loading, setLoading] = useState(false);

  if (items.length === 0) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!billing.firstName || !billing.lastName || !billing.email || !billing.address1 || !billing.city || !billing.postcode) {
      toast({ title: 'Please fill in all required billing fields', variant: 'destructive' });
      return;
    }

    const effectiveShipping = sameAsShipping ? billing : shipping;
    if (!sameAsShipping && (!shipping.address1 || !shipping.city || !shipping.postcode)) {
      toast({ title: 'Please fill in all required shipping fields', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-wc-order', {
        body: {
          items: items.map(item => ({
            wooCommerceId: item.wooCommerceId,
            quantity: item.quantity,
            name: item.name,
            price: item.price,
          })),
          billing: {
            first_name: billing.firstName,
            last_name: billing.lastName,
            email: billing.email,
            phone: billing.phone,
            address_1: billing.address1,
            address_2: billing.address2,
            city: billing.city,
            state: billing.state,
            postcode: billing.postcode,
            country: billing.country,
          },
          shipping: {
            first_name: effectiveShipping.firstName,
            last_name: effectiveShipping.lastName,
            address_1: effectiveShipping.address1,
            address_2: effectiveShipping.address2,
            city: effectiveShipping.city,
            state: effectiveShipping.state,
            postcode: effectiveShipping.postcode,
            country: effectiveShipping.country,
          },
        },
      });

      if (error) throw error;
      if (data?.payUrl) {
        clearCart();
        window.location.href = data.payUrl;
      }
    } catch (err) {
      console.error('Checkout error:', err);
      toast({ title: 'Something went wrong. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <h1 className="text-3xl font-serif font-semibold mb-8">Checkout</h1>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-card rounded-xl border border-border p-6">
                  <h2 className="text-xl font-serif font-semibold mb-4">Billing Details</h2>
                  <AddressForm values={billing} onChange={setBilling} prefix="billing" showEmailPhone />
                </div>

                <div className="bg-card rounded-xl border border-border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-serif font-semibold">Shipping Address</h2>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <Checkbox
                      id="same-as-billing"
                      checked={sameAsShipping}
                      onCheckedChange={(checked) => setSameAsShipping(checked === true)}
                    />
                    <Label htmlFor="same-as-billing" className="cursor-pointer text-sm text-muted-foreground">
                      Same as billing address
                    </Label>
                  </div>
                  {!sameAsShipping && (
                    <AddressForm values={shipping} onChange={setShipping} prefix="shipping" />
                  )}
                </div>
              </div>

              <div>
                <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
                  <h2 className="text-xl font-serif font-semibold mb-4">Order Summary</h2>
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
                      <span className="text-muted-foreground">Calculated at payment</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold pt-2 border-t border-border">
                      <span>Total</span>
                      <span>${totalPrice.toFixed(2)} AUD</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="gold"
                    size="lg"
                    className="w-full mt-6"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Proceed to Payment'
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center mt-3">
                    You'll be redirected to our secure payment page
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
