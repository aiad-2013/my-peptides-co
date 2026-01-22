-- Create orders table to store WooCommerce order confirmations
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  woocommerce_order_id TEXT NOT NULL UNIQUE,
  order_number TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  customer_email TEXT,
  customer_name TEXT,
  billing_address JSONB,
  shipping_address JSONB,
  line_items JSONB,
  subtotal DECIMAL(10,2),
  shipping_total DECIMAL(10,2),
  tax_total DECIMAL(10,2),
  total DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'AUD',
  payment_method TEXT,
  order_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (customers can view their orders via order ID)
CREATE POLICY "Orders are viewable by order reference" 
ON public.orders 
FOR SELECT 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_orders_updated_at();

-- Create index for faster lookups
CREATE INDEX idx_orders_woocommerce_id ON public.orders(woocommerce_order_id);
CREATE INDEX idx_orders_customer_email ON public.orders(customer_email);