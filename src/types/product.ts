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
  category: 'sarms' | 'peptides';
  price: number;
  concentration?: string;
  volume?: string;
  description: string;
  image: string;
  badge?: string;
  inStock: boolean;
  wooCommerceUrl: string;
  dosage?: string;
  ingredients?: string;
  faqs?: ProductFAQ[];
  peopleViewing?: number;
  isBundle?: boolean;
  discountTiers?: DiscountTier[];
}

export interface CartItem extends Product {
  quantity: number;
}
