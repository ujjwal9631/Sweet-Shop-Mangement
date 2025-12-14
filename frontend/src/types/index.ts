export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt?: string;
}

export interface Sweet {
  _id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  description?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface SweetsResponse {
  sweets: Sweet[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface SweetResponse {
  message?: string;
  sweet: Sweet;
}

export interface PurchaseResponse {
  message: string;
  sweet: Sweet;
  purchased: number;
}

export interface RestockResponse {
  message: string;
  sweet: Sweet;
  added: number;
}

export interface SearchParams {
  name?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export interface CreateSweetData {
  name: string;
  category: string;
  price: number;
  quantity?: number;
  description?: string;
  imageUrl?: string;
}

export interface UpdateSweetData {
  name?: string;
  category?: string;
  price?: number;
  quantity?: number;
  description?: string;
  imageUrl?: string;
}

export const CATEGORIES = [
  'Chocolate',
  'Candy',
  'Cake',
  'Cookie',
  'Pastry',
  'Ice Cream',
  'Other'
] as const;

export type Category = typeof CATEGORIES[number];
