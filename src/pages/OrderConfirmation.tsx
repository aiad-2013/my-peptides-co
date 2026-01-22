import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartProvider } from '@/context/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, Package, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LineItem {
  name: string;
  quantity: number;
  total: string;
}

interface Order {
  id: string;
  order_number: string | null;
  status: string;
  customer_name: string | null;
  line_items: LineItem[] | null;
  subtotal: number | null;
  shipping_total: number | null;
  tax_total: number | null;
  total: number;
  currency: string | null;
  created_at: string;
}

const OrderConfirmationContent = () => {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orderId = searchParams.get('order_id');

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        // Use edge function to securely fetch order (no direct table access)
        const { data: { session } } = await supabase.auth.getSession();
        
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-order?order_id=${encodeURIComponent(orderId)}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            },
          }
        );

        const result = await response.json();

        if (!response.ok) {
          console.error('Error fetching order:', result.error);
          setError('Order not found');
        } else if (result.order) {
          // Parse line_items from JSON
          const lineItems = Array.isArray(result.order.line_items) 
            ? (result.order.line_items as LineItem[]) 
            : null;
          const orderData: Order = {
            ...result.order,
            line_items: lineItems,
          };
          setOrder(orderData);
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  return (
    <div className="min-h-screen bg-background">
      <Header
        onCartClick={() => {}}
        onCategoryChange={() => {}}
        activeCategory="all"
      />

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-accent animate-spin mb-4" />
            <p className="text-muted-foreground">Loading order details...</p>
          </div>
        ) : error || !order ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h1 className="text-2xl font-serif font-semibold mb-2">Order Not Found</h1>
            <p className="text-muted-foreground mb-6">
              {error || "We couldn't find your order. It may still be processing."}
            </p>
            <Link to="/">
              <Button variant="gold">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to Shop
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Success Header */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/10 mb-6">
                <CheckCircle className="w-10 h-10 text-accent" />
              </div>
              <h1 className="text-3xl font-serif font-semibold mb-2">Order Confirmed!</h1>
              <p className="text-muted-foreground">
                Thank you for your order, {order.customer_name || 'valued customer'}
              </p>
            </div>

            {/* Order Summary Card */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
              {/* Order Info */}
              <div className="flex flex-wrap gap-4 justify-between pb-6 border-b border-border">
                <div>
                  <p className="text-sm text-muted-foreground">Order Number</p>
                  <p className="font-semibold">#{order.order_number || order.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent capitalize">
                    {order.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {new Date(order.created_at).toLocaleDateString('en-AU', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-4">
                <h3 className="font-semibold">Items Ordered</h3>
                {order.line_items && order.line_items.length > 0 ? (
                  <div className="space-y-3">
                    {order.line_items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-semibold">${parseFloat(item.total).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No items found</p>
                )}
              </div>

              {/* Order Totals */}
              <div className="pt-6 border-t border-border space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>${order.shipping_total.toFixed(2)}</span>
                </div>
                {order.tax_total > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>${order.tax_total.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-border">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)} {order.currency}</span>
                </div>
              </div>
            </div>

            {/* Back to Shop */}
            <div className="text-center pt-4">
              <Link to="/">
                <Button variant="gold-outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

const OrderConfirmation = () => {
  return (
    <CartProvider>
      <OrderConfirmationContent />
    </CartProvider>
  );
};

export default OrderConfirmation;
