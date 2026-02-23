import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

import { Package, Search, ArrowLeft, Loader2, CheckCircle, Clock, Truck, XCircle, Mail, MapPin, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface LineItem {
  name: string;
  quantity: number;
  total: string;
}

interface TrackingInfo {
  provider: string;
  number: string;
  url: string;
}

interface ShippingAddress {
  city: string;
  state: string;
  country: string;
}

interface Order {
  order_number: string;
  status: string;
  customer_name: string | null;
  line_items: LineItem[] | null;
  subtotal: number | null;
  shipping_total: number | null;
  tax_total: number | null;
  total: number;
  currency: string | null;
  created_at: string;
  shipping_method: string | null;
  shipping_address: ShippingAddress | null;
  tracking: TrackingInfo[];
}

const statusConfig: Record<string, { icon: typeof CheckCircle; label: string; color: string }> = {
  pending: { icon: Clock, label: 'Pending', color: 'text-yellow-500' },
  processing: { icon: Package, label: 'Processing', color: 'text-blue-500' },
  'on-hold': { icon: Clock, label: 'On Hold', color: 'text-yellow-500' },
  completed: { icon: CheckCircle, label: 'Completed', color: 'text-green-500' },
  shipped: { icon: Truck, label: 'Shipped', color: 'text-accent' },
  cancelled: { icon: XCircle, label: 'Cancelled', color: 'text-destructive' },
  refunded: { icon: XCircle, label: 'Refunded', color: 'text-destructive' },
  failed: { icon: XCircle, label: 'Failed', color: 'text-destructive' },
};

const TrackOrderContent = () => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderNumberInput, setOrderNumberInput] = useState('');
  const [emailInput, setEmailInput] = useState('');

  const fetchOrder = async () => {
    const trimmedOrder = orderNumberInput.trim();
    const trimmedEmail = emailInput.trim();

    if (!trimmedOrder || !trimmedEmail) {
      setError('Please enter both your order number and email address.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/track-order`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            order_number: trimmedOrder,
            email: trimmedEmail,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Order not found.');
      } else if (result.order) {
        setOrder(result.order);
      }
    } catch {
      setError('Failed to load order details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const status = order ? statusConfig[order.status] || statusConfig.processing : null;
  const StatusIcon = status?.icon || Package;

  return (
    <div className="min-h-screen bg-background">
      <Header
        onCategoryChange={() => {}}
        activeCategory="all"
      />

      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-4">
            <Package className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-3xl font-serif font-semibold mb-2">Track Your Order</h1>
          <p className="text-muted-foreground">
            Enter the email address and order number from your confirmation email
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-8">
          <div className="space-y-4">
            <div>
              <label htmlFor="orderNumber" className="block text-sm font-medium mb-1.5">
                Order Number
              </label>
              <Input
                id="orderNumber"
                placeholder="e.g. 12345"
                value={orderNumberInput}
                onChange={(e) => setOrderNumberInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchOrder()}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="The email used when placing your order"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchOrder()}
                  className="pl-10"
                />
              </div>
            </div>
            <Button
              variant="gold"
              className="w-full"
              onClick={fetchOrder}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              Track Order
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center mb-8">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Order Result */}
        {order && (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-6 animate-fade-in">
            {/* Status Header */}
            <div className="text-center pb-6 border-b border-border">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-4">
                <StatusIcon className={`w-8 h-8 ${status?.color || 'text-accent'}`} />
              </div>
              <h2 className="text-xl font-serif font-semibold mb-1">
                Order #{order.order_number}
              </h2>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent/10 capitalize ${status?.color || 'text-accent'}`}>
                {status?.label || order.status}
              </span>
            </div>

            {/* Order Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Customer</p>
                <p className="font-medium">{order.customer_name || 'Guest'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Date</p>
                <p className="font-medium">
                  {new Date(order.created_at).toLocaleDateString('en-AU', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {/* Shipping & Tracking */}
            {(order.shipping_method || order.tracking.length > 0 || order.shipping_address) && (
              <div className="space-y-3 pt-2">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Truck className="w-4 h-4 text-accent" />
                  Shipping Information
                </h3>
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  {order.shipping_method && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Method: </span>
                      <span className="font-medium">{order.shipping_method}</span>
                    </div>
                  )}
                  {order.shipping_address && (order.shipping_address.city || order.shipping_address.state) && (
                    <div className="text-sm flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                      <span>
                        {[order.shipping_address.city, order.shipping_address.state, order.shipping_address.country]
                          .filter(Boolean)
                          .join(', ')}
                      </span>
                    </div>
                  )}
                  {order.tracking.length > 0 ? (
                    <div className="space-y-2">
                      {order.tracking.map((t, i) => (
                        <div key={i} className="flex items-center justify-between gap-3 bg-card rounded-md p-3 border border-border">
                          <div className="min-w-0">
                            <p className="text-sm font-medium">{t.provider}</p>
                            <p className="text-xs text-muted-foreground font-mono truncate">{t.number}</p>
                          </div>
                          {t.url ? (
                            <a
                              href={t.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0"
                            >
                              <Button variant="gold-outline" size="sm">
                                Track
                                <ExternalLink className="w-3 h-3 ml-1" />
                              </Button>
                            </a>
                          ) : (
                            <span className="text-xs text-muted-foreground">No tracking link</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Tracking information will appear here once your order has been shipped.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Line Items */}
            {order.line_items && order.line_items.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Items</h3>
                {order.line_items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">${parseFloat(item.total).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Totals */}
            <div className="pt-4 border-t border-border space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${order.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>${order.shipping_total?.toFixed(2)}</span>
              </div>
              {order.tax_total && order.tax_total > 0 && (
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
        )}

        {/* Back link */}
        <div className="text-center pt-8">
          <Link to="/">
            <Button variant="ghost" className="text-muted-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Shop
            </Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

const TrackOrder = () => <TrackOrderContent />;

export default TrackOrder;
