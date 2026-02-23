export interface ProductFAQ {
  question: string;
  answer: string;
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
}

export interface CartItem extends Product {
  quantity: number;
}
