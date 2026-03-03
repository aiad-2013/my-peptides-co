import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

import { useCart } from '@/context/CartContext';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ShoppingCart, Minus, Plus, Shield, FlaskConical, CheckCircle2, Eye, Pill, Package, Tag, Layers, Sparkles } from 'lucide-react';
import { getProxiedImageUrl } from '@/lib/imageProxy';

const ProductDetailContent = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: products, isLoading } = useProducts();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);
  const [retryCount, setRetryCount] = useState(0);
  

  const product = products?.find(p => p.id === slug);

  // SEO: Update document title and meta
  useEffect(() => {
    if (product) {
      document.title = `${product.name} | Vi Corpus - Premium Research Compounds`;
      const metaDesc = document.querySelector('meta[name="description"]');
      const desc = product.description?.slice(0, 155) || `${product.name} - Premium ${product.category} for research. ${product.concentration || ''} ${product.volume || ''}`.trim();
      if (metaDesc) {
        metaDesc.setAttribute('content', desc);
      } else {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = desc;
        document.head.appendChild(meta);
      }
    }
    return () => {
      document.title = 'Vi Corpus - Premium Research Compounds';
    };
  }, [product]);

  const handleImgError = () => {
    if (retryCount < 2) {
      setRetryCount(prev => prev + 1);
    } else {
      setImgError(true);
    }
  };

  const imageSrc = product?.image && product.image !== '/placeholder.svg'
    ? `${getProxiedImageUrl(product.image)}${retryCount > 0 ? `&retry=${retryCount}` : ''}`
    : null;

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      setQuantity(1);
    }
  };

  // Related products
  const relatedProducts = products?.filter(p => p.category === product?.category && p.id !== product?.id).slice(0, 4);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 gap-12">
            <Skeleton className="aspect-square rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-3xl font-serif font-semibold text-foreground mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-8">The product you're looking for doesn't exist or has been removed.</p>
          <Button variant="gold" asChild>
            <Link to="/">Back to Shop</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-accent transition-colors">Home</Link>
          <span>/</span>
          <Link to="/" className="hover:text-accent transition-colors capitalize">{product.category}</Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Image */}
          <div className="relative aspect-square bg-gradient-to-b from-muted to-secondary rounded-xl overflow-hidden">
            {!imgError && imageSrc ? (
              <img
                src={imageSrc}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover"
                onError={handleImgError}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-40 h-56 rounded-lg bg-gradient-navy shadow-xl">
                  <div className="h-full flex flex-col items-center justify-center p-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-gold mb-4" />
                    <div className="w-full h-2 bg-accent/30 rounded mb-2" />
                    <div className="w-2/3 h-1.5 bg-accent/20 rounded" />
                  </div>
                </div>
              </div>
            )}
            {product.isBundle && (
              <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground text-sm px-3 py-1">
                <Package className="w-4 h-4 mr-1.5" />
                Bundle
              </Badge>
            )}
            {product.badge && product.badge !== 'Bundle' && (
              <Badge className="absolute top-4 left-4 mt-10 bg-accent text-accent-foreground text-sm px-3 py-1">
                {product.badge}
              </Badge>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-accent uppercase tracking-wider">
                {product.category}
              </p>
              {product.peopleViewing && product.peopleViewing > 0 && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Eye className="w-4 h-4 text-accent" />
                  <span><strong className="text-foreground">{product.peopleViewing}</strong> people viewing</span>
                </div>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mb-3">
              {product.name}
            </h1>

            {product.concentration && (
              <p className="text-lg text-muted-foreground mb-6">
                {product.concentration} {product.volume && `• ${product.volume}`}
              </p>
            )}

            {/* Dosage */}
            {product.dosage && (
              <div className="flex items-center gap-3 mb-6 p-3 rounded-lg bg-accent/10 border border-accent/20">
                <Pill className="w-5 h-5 text-accent flex-shrink-0" />
                <div>
                  <span className="text-xs font-medium text-accent uppercase tracking-wider">Dosage</span>
                  <p className="text-sm font-semibold text-foreground">{product.dosage}</p>
                </div>
              </div>
            )}

            {/* Price */}
            <div className="mb-6 pb-6 border-b border-border">
              <span className="text-4xl font-semibold text-foreground">
                ${product.price.toFixed(2)}
              </span>
              <span className="text-muted-foreground ml-2 text-lg">AUD</span>
            </div>

            {/* Volume Discount Tiers */}
            {product.discountTiers && product.discountTiers.length > 0 && (
              <div className="mb-6">
                <div className="grid grid-cols-3 gap-3">
                  {product.discountTiers.map((tier, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-border bg-muted/30 p-3 text-center hover:border-accent/50 transition-colors"
                    >
                      <p className="text-xs text-muted-foreground mb-1">By Buying</p>
                      <p className="text-lg font-bold text-foreground">{tier.qty} Bottles</p>
                      <p className="text-xs font-medium text-accent mt-1">You can get {tier.discount}% off</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-accent mt-3 text-center flex items-center justify-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  To get a discount, simply add products to the cart and continue to the checkout page, and the discount will automatically be applied.
                </p>
              </div>
            )}

            {/* Bundle: What's in this stack */}
            {product.isBundle && product.bundledItems && product.bundledItems.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Layers className="w-5 h-5 text-accent" />
                  <h2 className="text-lg font-semibold text-foreground">What's in this stack</h2>
                </div>

                {/* Savings callout */}
                {product.savingsText && (
                  <div className="flex items-start gap-2 mb-4 p-3 rounded-lg bg-accent/10 border border-accent/30">
                    <Sparkles className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    <p className="text-sm font-medium text-accent">{product.savingsText}</p>
                  </div>
                )}

                <div className="space-y-3">
                  {product.bundledItems.map((item) => {
                    const itemImg = item.image && item.image !== '/placeholder.svg'
                      ? getProxiedImageUrl(item.image) : null;
                    return (
                      <Link
                        key={item.id}
                        to={`/product/${item.id}`}
                        className="flex items-center gap-4 p-3 rounded-lg border border-border bg-muted/30 hover:border-accent/50 hover:bg-muted/60 transition-all group"
                      >
                        {/* Thumbnail */}
                        <div className="w-14 h-14 rounded-md overflow-hidden bg-gradient-to-b from-muted to-secondary flex-shrink-0">
                          {itemImg ? (
                            <img src={itemImg} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="w-6 h-8 rounded bg-gradient-navy" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground text-sm leading-tight group-hover:text-accent transition-colors truncate">
                            {item.qty > 1 && <span className="text-accent mr-1">{item.qty}×</span>}
                            {item.name}
                          </p>
                          {(item.concentration || item.volume) && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {item.concentration}{item.volume && ` • ${item.volume}`}
                            </p>
                          )}
                        </div>

                        {/* Price */}
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-semibold text-foreground">${item.price.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">AUD</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Individual total vs bundle price */}
                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Individual total</p>
                    <p className="text-base font-semibold text-muted-foreground line-through">
                      ${product.bundledItems.reduce((sum, i) => sum + i.price * i.qty, 0).toFixed(2)} AUD
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-accent font-medium">Bundle price</p>
                    <p className="text-xl font-bold text-foreground">${product.price.toFixed(2)} AUD</p>
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-foreground mb-3">About this product</h2>
              <p className="text-foreground/80 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Shield className="w-5 h-5 text-accent flex-shrink-0" />
                <span className="text-sm text-foreground">Third-party tested</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                <span className="text-sm text-foreground">99%+ purity guaranteed</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <FlaskConical className="w-5 h-5 text-accent flex-shrink-0" />
                <span className="text-sm text-foreground">Research grade quality</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <ShoppingCart className="w-5 h-5 text-accent flex-shrink-0" />
                <span className="text-sm text-foreground">Fast Australian shipping</span>
              </div>
            </div>

            {/* FAQs */}
            {product.faqs && product.faqs.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-foreground mb-3">Frequently Asked Questions</h2>
                <Accordion type="single" collapsible className="w-full">
                  {product.faqs.map((faq, idx) => (
                    <AccordionItem key={idx} value={`faq-${idx}`}>
                      <AccordionTrigger className="text-sm text-left">{faq.question}</AccordionTrigger>
                      <AccordionContent className="text-foreground/80">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="flex items-center gap-4 mb-4">
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

            <Button
              variant="gold"
              size="xl"
              className="w-full"
              onClick={handleAddToCart}
              disabled={!product.inStock}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Add to Cart — ${(product.price * quantity).toFixed(2)}
            </Button>

            {!product.inStock && (
              <p className="text-destructive text-sm text-center mt-3 font-medium">
                Currently out of stock
              </p>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <section className="mt-16 pt-12 border-t border-border">
            <h2 className="text-2xl font-serif font-semibold text-foreground mb-8">
              Related Products
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map(rp => {
                const rpImage = rp.image && rp.image !== '/placeholder.svg'
                  ? getProxiedImageUrl(rp.image) : null;
                return (
                  <Link
                    key={rp.id}
                    to={`/product/${rp.id}`}
                    className="group bg-card rounded-lg border border-border overflow-hidden hover:shadow-md transition-all"
                  >
                    <div className="aspect-square bg-gradient-to-b from-muted to-secondary overflow-hidden">
                      {rpImage ? (
                        <img src={rpImage} alt={rp.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-16 h-20 rounded bg-gradient-navy" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-accent uppercase tracking-wider">{rp.category}</p>
                      <h3 className="font-serif text-sm font-semibold text-foreground line-clamp-1">{rp.name}</h3>
                      <p className="text-sm font-semibold text-foreground mt-1">${rp.price.toFixed(2)} <span className="text-xs text-muted-foreground">AUD</span></p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* JSON-LD for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              name: product.name,
              description: product.description,
              image: product.image,
              offers: {
                "@type": "Offer",
                price: product.price.toFixed(2),
                priceCurrency: "AUD",
                availability: product.inStock
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
              },
            }),
          }}
        />
      </main>

      <Footer />
    </div>
  );
};

const ProductDetail = () => <ProductDetailContent />;

export default ProductDetail;
