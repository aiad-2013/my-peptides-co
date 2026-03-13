import { useState, useEffect, useRef, useCallback, type MouseEvent as ReactMouseEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, Minus, Plus, Shield, FlaskConical, CheckCircle2, Eye, Pill, Package, Tag, Layers, Sparkles, Clock, ZoomIn, X, ChevronLeft, ChevronRight, Star } from 'lucide-react';

import { getProxiedImageUrl } from '@/lib/imageProxy';

// ── Reviews hook ─────────────────────────────────────────────────────────────
interface WooReview {
  id: number;
  date: string;
  review: string;
  rating: number;
  reviewer: string;
  avatar: string | null;
  verified: boolean;
}

function useProductReviews(wooCommerceId: number | undefined) {
  return useQuery<WooReview[]>({
    queryKey: ['reviews', wooCommerceId],
    enabled: !!wooCommerceId,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/get-reviews?product_id=${wooCommerceId}`,
        { headers: { 'apikey': anonKey, 'Authorization': `Bearer ${anonKey}` } }
      );
      if (!res.ok) throw new Error('Failed to fetch reviews');
      const data = await res.json();
      return data.reviews ?? [];
    },
  });
}

// ── Star Rating display ───────────────────────────────────────────────────────
const StarRating = ({ rating, size = 4 }: { rating: number; size?: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <Star
        key={i}
        className={`w-${size} h-${size} ${i <= rating ? 'fill-accent text-accent' : 'text-muted-foreground/30'}`}
      />
    ))}
  </div>
);

// Deterministic scarcity seed from product id
function seededRandom(id: string, offset = 0): number {
  let hash = offset;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return (hash >>> 0) / 0xFFFFFFFF;
}
function getStockLeft(id: string) { return Math.floor(seededRandom(id, 7) * 8) + 3; } // 3–10
function getSoldThisWeek(id: string) { return Math.floor(seededRandom(id, 13) * 40) + 12; } // 12–51

function useOrderDeadline() {
  const endOfDayRef = useRef<Date | null>(null);
  if (!endOfDayRef.current) {
    const d = new Date();
    d.setHours(23, 59, 59, 0);
    endOfDayRef.current = d;
  }

  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const diff = (endOfDayRef.current?.getTime() ?? 0) - now.getTime();
      if (diff <= 0) { setTimeLeft('00:00:00'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return timeLeft;
}

// ── Image Zoom Lightbox ──────────────────────────────────────────────────────
interface ZoomLightboxProps {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}

const ZoomLightbox = ({ images, initialIndex, onClose }: ZoomLightboxProps) => {
  const [index, setIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });

  const prev = useCallback(() => { setIndex(i => (i - 1 + images.length) % images.length); setScale(1); setOffset({ x: 0, y: 0 }); }, [images.length]);
  const next = useCallback(() => { setIndex(i => (i + 1) % images.length); setScale(1); setOffset({ x: 0, y: 0 }); }, [images.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, prev, next]);

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setScale(s => Math.min(4, Math.max(1, s - e.deltaY * 0.001)));
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: dragStart.current.ox + e.clientX - dragStart.current.x,
      y: dragStart.current.oy + e.clientY - dragStart.current.y,
    });
  };

  const onMouseUp = () => setIsDragging(false);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 animate-fade-in">
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Zoom hint */}
      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/40 text-xs tracking-widest uppercase">
        Scroll to zoom · Drag to pan
      </p>

      {/* Prev / Next */}
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Image */}
      <div
        className="relative w-full h-full flex items-center justify-center overflow-hidden"
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in' }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <img
          src={images[index]}
          alt=""
          draggable={false}
          className="max-w-[90vw] max-h-[90vh] object-contain select-none transition-transform duration-100"
          style={{ transform: `scale(${scale}) translate(${offset.x / scale}px, ${offset.y / scale}px)` }}
          onClick={() => scale === 1 && setScale(2)}
        />
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => { setIndex(i); setScale(1); setOffset({ x: 0, y: 0 }); }}
              className={`w-12 h-12 rounded overflow-hidden border-2 transition-all ${i === index ? 'border-accent scale-110' : 'border-white/20 opacity-50 hover:opacity-80'}`}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────────────
const ProductDetailContent = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: products, isLoading } = useProducts();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [imgError, setImgError] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({});
  const imgContainerRef = useRef<HTMLDivElement>(null);
  const orderDeadline = useOrderDeadline();

  // ── Pinch-to-zoom (touch) ──────────────────────────────────────────────────
  const [touchScale, setTouchScale] = useState(1);
  const [touchOrigin, setTouchOrigin] = useState('50% 50%');
  const touchRef = useRef<{ dist: number; scale: number; midX: number; midY: number } | null>(null);

  const getTouchDist = (t: React.TouchList) =>
    Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && imgContainerRef.current) {
      e.preventDefault();
      const rect = imgContainerRef.current.getBoundingClientRect();
      const midX = ((e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left) / rect.width * 100;
      const midY = ((e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top) / rect.height * 100;
      touchRef.current = { dist: getTouchDist(e.touches), scale: touchScale, midX, midY };
      setTouchOrigin(`${midX}% ${midY}%`);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && touchRef.current) {
      e.preventDefault();
      const newDist = getTouchDist(e.touches);
      const ratio = newDist / touchRef.current.dist;
      const next = Math.min(4, Math.max(1, touchRef.current.scale * ratio));
      setTouchScale(next);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length < 2) {
      touchRef.current = null;
      // Snap back to 1 if barely zoomed
      setTouchScale(s => s < 1.15 ? 1 : s);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    setSelectedImageIndex(0);
    setImgError(false);
    setRetryCount(0);
    setTouchScale(1);
  }, [slug]);

  const product = products?.find(p => p.id === slug);
  const { data: reviews, isLoading: reviewsLoading } = useProductReviews(product?.wooCommerceId);

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

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!imgContainerRef.current || imgError || !imageSrc) return;
    const rect = imgContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomStyle({ transformOrigin: `${x}% ${y}%` });
  };

  const handleMouseEnter = () => {
    if (!imgError && imageSrc) setIsZooming(true);
  };

  const handleMouseLeave = () => {
    setIsZooming(false);
  };

  const allImages = product?.images && product.images.length > 0
    ? product.images
    : product?.image && product.image !== '/placeholder.svg' ? [product.image] : [];

  const proxiedImages = allImages.map(img => getProxiedImageUrl(img));
  const activeImageSrc = proxiedImages[selectedImageIndex] || null;
  const isProxied = activeImageSrc?.includes('/functions/v1/image-proxy');
  const imageSrc = activeImageSrc
    ? `${activeImageSrc}${isProxied && retryCount > 0 ? `&retry=${retryCount}` : ''}`
    : null;

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      setQuantity(1);
    }
  };

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
    <>
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

        {/* ── TOP SECTION: Image + Purchase Info ── */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-12">

          {/* Left: Product Image Gallery */}
          <div className="flex flex-col gap-3">
            <div
              ref={imgContainerRef}
              className="relative aspect-square bg-gradient-to-b from-muted to-secondary rounded-xl overflow-hidden cursor-crosshair"
              onClick={() => !imgError && imageSrc && touchScale === 1 && setZoomOpen(true)}
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {!imgError && imageSrc ? (
                <img
                  src={imageSrc}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={touchScale > 1 ? {
                    // Touch: pinch zoom takes priority
                    transform: `scale(${touchScale})`,
                    transformOrigin: touchOrigin,
                    transition: 'transform 0.05s linear',
                  } : {
                    // Mouse: cursor-tracking zoom
                    transform: isZooming ? 'scale(2.2)' : 'scale(1)',
                    transition: 'transform 0.2s ease-out',
                    ...zoomStyle,
                  }}
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
              {/* Zoom hint overlay */}
              {!imgError && imageSrc && (
                <div
                  className="absolute bottom-3 right-3 p-1.5 rounded-md bg-black/40 text-white transition-opacity duration-200 backdrop-blur-sm pointer-events-none"
                  style={{ opacity: isZooming ? 0 : 1 }}
                >
                  <ZoomIn className="w-4 h-4" />
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

            {/* Thumbnails */}
            {proxiedImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {proxiedImages.map((src, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setSelectedImageIndex(idx); setImgError(false); setRetryCount(0); }}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      selectedImageIndex === idx
                        ? 'border-accent shadow-md scale-105'
                        : 'border-border opacity-60 hover:opacity-100 hover:border-accent/50'
                    }`}
                  >
                    <img src={src} alt={`${product.name} view ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Core Purchase Info */}
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
              <p className="text-lg text-muted-foreground mb-4">
                {product.concentration} {product.volume && `• ${product.volume}`}
              </p>
            )}

            {/* Dosage */}
            {product.dosage && (
              <div className="flex items-center gap-3 mb-5 p-3 rounded-lg bg-accent/10 border border-accent/20">
                <Pill className="w-5 h-5 text-accent flex-shrink-0" />
                <div>
                  <span className="text-xs font-medium text-accent uppercase tracking-wider">Dosage</span>
                  <p className="text-sm font-semibold text-foreground">{product.dosage}</p>
                </div>
              </div>
            )}

            {/* Price */}
            <div className="mb-5 pb-5 border-b border-border/60">
              <span className="text-3xl font-serif font-normal text-foreground tabular-nums">
                ${product.price.toFixed(2)}
              </span>
              <span className="text-muted-foreground ml-2 text-sm">AUD</span>
            </div>

            {/* ── Inventory & Dispatch ── */}
            {product.inStock && (() => {
              const stockLeft = getStockLeft(product.id);
              const soldThisWeek = getSoldThisWeek(product.id);
              const stockPct = Math.round((stockLeft / 15) * 100);
              return (
                <div className="mb-6 space-y-3">
                  {/* Inventory bar — clinical, quiet */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        Inventory
                      </span>
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        {stockLeft} units · {soldThisWeek} sold this week
                      </span>
                    </div>
                    <div className="w-full h-px bg-border overflow-hidden">
                      <div
                        className="h-full bg-accent/60 transition-all duration-700"
                        style={{ width: `${stockPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Dispatch window — subtle */}
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />
                    <p className="text-[11px] text-muted-foreground">
                      Order within{' '}
                      <span className="font-mono text-foreground tabular-nums">{orderDeadline}</span>
                      {' '}for same-day dispatch
                    </p>
                  </div>
                </div>
              );
            })()}


            {/* Volume Discount Tiers */}
            {product.discountTiers && product.discountTiers.length > 0 && (
              <div className="mb-6">
                <div className="grid grid-cols-3 gap-3">
                  {product.discountTiers.map((tier, idx) => (
                    <button
                      key={idx}
                      onClick={() => setQuantity(tier.qty)}
                      className={`rounded-lg border p-3 text-center transition-all duration-200 ${
                        quantity === tier.qty
                          ? 'border-accent bg-accent/10 shadow-sm scale-[1.02]'
                          : 'border-border bg-muted/30 hover:border-accent/50 hover:bg-muted/50'
                      }`}
                    >
                      <p className="text-xs text-muted-foreground mb-1">By Buying</p>
                      <p className="text-lg font-bold text-foreground">{tier.qty} Bottles</p>
                      <p className="text-xs font-medium text-accent mt-1">You can get {tier.discount}% off</p>
                    </button>
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
                        <div className="w-14 h-14 rounded-md overflow-hidden bg-gradient-to-b from-muted to-secondary flex-shrink-0">
                          {itemImg ? (
                            <img src={itemImg} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="w-6 h-8 rounded bg-gradient-navy" />
                            </div>
                          )}
                        </div>
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
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-semibold text-foreground">${item.price.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">AUD</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
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

        {/* ── BOTTOM SECTION: Tabs ── */}
        <Tabs defaultValue="description" className="mb-16">
          <TabsList className="w-full justify-start border-b border-border rounded-none bg-transparent h-auto p-0 mb-8 gap-0">
            <TabsTrigger
              value="description"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:text-accent px-6 py-3 text-sm font-medium text-muted-foreground data-[state=active]:shadow-none"
            >
              Description
            </TabsTrigger>
            {product.faqs && product.faqs.length > 0 && (
              <TabsTrigger
                value="faq"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:text-accent px-6 py-3 text-sm font-medium text-muted-foreground data-[state=active]:shadow-none"
              >
                FAQ's
              </TabsTrigger>
            )}
            {reviews && reviews.length > 0 && (
              <TabsTrigger
                value="reviews"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent data-[state=active]:text-accent px-6 py-3 text-sm font-medium text-muted-foreground data-[state=active]:shadow-none"
              >
                Reviews ({reviews.length})
              </TabsTrigger>
            )}
          </TabsList>

          {/* Description Tab */}
          <TabsContent value="description" className="mt-0">
            <div className="grid md:grid-cols-2 gap-10">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">About this product</h2>
                <p className="text-foreground/80 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Key Features */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-3">Key Features</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              </div>
            </div>
          </TabsContent>

          {/* FAQ Tab */}
          {product.faqs && product.faqs.length > 0 && (
            <TabsContent value="faq" className="mt-0">
              <div className="max-w-3xl">
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
            </TabsContent>
          )}

          {/* Reviews Tab */}
          {reviews && reviews.length > 0 && (
            <TabsContent value="reviews" className="mt-0">
              {/* Summary bar */}
              <div className="flex items-center gap-6 mb-8 p-5 rounded-xl bg-muted/40 border border-border w-fit">
                <div className="text-center">
                  <p className="text-4xl font-serif font-semibold text-foreground">
                    {(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)}
                  </p>
                  <StarRating rating={Math.round(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length)} size={4} />
                  <p className="text-xs text-muted-foreground mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="space-y-1.5 min-w-[160px]">
                  {[5, 4, 3, 2, 1].map(star => {
                    const count = reviews.filter(r => r.rating === star).length;
                    const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-4">{star}</span>
                        <Star className="w-3 h-3 fill-accent text-accent flex-shrink-0" />
                        <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                          <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground w-6 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Review list */}
              <div className="space-y-5 max-w-3xl">
                {reviews.map(review => (
                  <div key={review.id} className="p-5 rounded-xl border border-border bg-card">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        {review.avatar ? (
                          <img src={review.avatar} alt={review.reviewer} className="w-9 h-9 rounded-full" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-accent font-semibold text-sm">
                            {review.reviewer.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-sm text-foreground leading-tight">{review.reviewer}</p>
                          {review.verified && (
                            <p className="text-[10px] text-accent flex items-center gap-1 mt-0.5">
                              <CheckCircle2 className="w-3 h-3" /> Verified purchase
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <StarRating rating={review.rating} size={3} />
                      </div>
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed">{review.review}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
          )}

          {/* Reviews loading skeleton */}
          {reviewsLoading && (
            <TabsContent value="reviews" className="mt-0">
              <div className="space-y-4 max-w-3xl">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
              </div>
            </TabsContent>
          )}

        </Tabs>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <section className="pt-12 border-t border-border">
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

    {/* Zoom Lightbox */}
    {zoomOpen && proxiedImages.length > 0 && (
      <ZoomLightbox
        images={proxiedImages}
        initialIndex={selectedImageIndex}
        onClose={() => setZoomOpen(false)}
      />
    )}
    </>
  );
};

const ProductDetail = () => <ProductDetailContent />;

export default ProductDetail;
