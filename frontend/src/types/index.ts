export interface User {
  id: number;
  email: string;
  name: string;
  role: "user" | "admin";
  createdAt?: string;
}

export interface Sweet {
  id: number;
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
   "Chocolate",
   "Candy",
   "Cake",
   "Cookie",
   "Pastry",
   "Ice Cream",
   "Ladoo",
   "Barfi",
   "Halwa",
   "Rasgulla",
   "Gulab Jamun",
   "Kheer",
   "Peda",
   "Jalebi",
   "Bengali Sweets",
   "Dry Sweets",
   "Milk Sweets",
   "Namkeen",
   "Beverages",
   "Bakery",
   "Snacks",
   "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];
