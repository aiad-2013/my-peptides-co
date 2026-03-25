export interface ProductFAQ {
  question: string;
  answer: string;
}

export interface DiscountTier {
  qty: number;
  discount: number;
}

export interface BundledItem {
  id: string;
  wooCommerceId: number;
  name: string;
  image: string;
  price: number;
  qty: number;
  concentration?: string;
  volume?: string;
}

export interface Product {
  id: string;
  wooCommerceId?: number;
  name: string;
  category: 'sarms' | 'peptides' | 'glp-1' | 'erectile-performance' | 'dilutes' | 'pct';
  categories?: Array<'sarms' | 'peptides' | 'glp-1' | 'erectile-performance' | 'dilutes' | 'pct'>;
  price: number;
  concentration?: string;
  volume?: string;
  description: string;
  image: string;
  images?: string[];
  badge?: string;
  inStock: boolean;
  wooCommerceUrl: string;
  dosage?: string;
  ingredients?: string;
  faqs?: ProductFAQ[];
  peopleViewing?: number;
  isBundle?: boolean;
  bundledItems?: BundledItem[];
  savingsText?: string;
  discountTiers?: DiscountTier[];
}

export interface CartItem extends Product {
  quantity: number;
}
