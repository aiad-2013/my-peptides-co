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
    'growth-mk677': [mk677LabTest],
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
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    placeholderData: fallbackProducts,
  });
}

type CategoryFilter = 'all' | 'sarms' | 'peptides' | 'glp-1' | 'erectile-performance' | 'dilutes' | 'pct';

// Explicit sort order for categories. Products not listed appear at the end.
const CATEGORY_ORDER: Partial<Record<CategoryFilter, string[]>> = {
  sarms: ['growth-mk677', 'testolone-rad140', 'extreme-physique-lgd4033', 'vascular-mk2866', 'shred-sr9009-2'],
  peptides: ['bpc-157', 'tb-500', 'mots-c', 'hcg', 'ghk-cu', 'cjc-1295-dac', 'tesamorelin', 'ipamorelin', 'pt-141', 'glow-blend', 'klow-blend', 'nad-plus', 'dsip'],
};

function sortByOrder(products: Product[], order: string[]): Product[] {
  return [...products].sort((a, b) => {
    const ai = order.indexOf(a.id);
    const bi = order.indexOf(b.id);
    if (ai === -1 && bi === -1) return 0;
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

export function useProductsByCategory(category: CategoryFilter) {
  const { data: products, ...rest } = useProducts();
  
  let filteredProducts = category === 'all'
    ? products
    : products?.filter(p =>
        p.category === category ||
        (p.categories && p.categories.includes(category))
      );

  const order = CATEGORY_ORDER[category];
  if (filteredProducts && order) {
    filteredProducts = sortByOrder(filteredProducts, order);
  }

  const fallback = category === 'all'
    ? fallbackProducts
    : getFallbackByCategory(category as 'sarms' | 'peptides' | 'glp-1' | 'erectile-performance' | 'dilutes' | 'pct');

  return {
    ...rest,
    data: filteredProducts || fallback,
  };
}

export function useProductById(id: string) {
  const { data: products, ...rest } = useProducts();
  
  return {
    ...rest,
    data: products?.find(p => p.id === id),
  };
}
