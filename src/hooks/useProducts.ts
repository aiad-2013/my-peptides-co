import { useQuery } from '@tanstack/react-query';
import { Product } from '@/types/product';
import { products as fallbackProducts, getProductsByCategory as getFallbackByCategory } from '@/data/products';
import mk677LabTest from '@/assets/mk677-lab-test.png';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

interface ProductsResponse {
  products: Product[];
  error?: string;
}

async function fetchProducts(): Promise<Product[]> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/get-products`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.status}`);
  }

  const data: ProductsResponse = await response.json();
  
  if (data.error) {
    throw new Error(data.error);
  }

  // Inject local image overrides
  const extraImages: Record<string, string[]> = {
    'mk677-growth': [mk677LabTest],
  };

  return data.products.map(p => {
    const extras = extraImages[p.id];
    if (!extras) return p;
    return { ...p, images: [...(p.images || [p.image]), ...extras] };
  });
}

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 0, // Always fetch fresh from WooCommerce
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 2,
    // Fall back to local products if fetch fails
    placeholderData: fallbackProducts,
  });
}

export function useProductsByCategory(category: 'all' | 'sarms' | 'peptides') {
  const { data: products, ...rest } = useProducts();
  
  const filteredProducts = category === 'all' 
    ? products 
    : products?.filter(p => p.category === category);

  return {
    ...rest,
    data: filteredProducts || getFallbackByCategory(category as 'sarms' | 'peptides'),
  };
}

export function useProductById(id: string) {
  const { data: products, ...rest } = useProducts();
  
  return {
    ...rest,
    data: products?.find(p => p.id === id),
  };
}
