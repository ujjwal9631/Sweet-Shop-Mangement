import axios, { AxiosInstance, AxiosError } from "axios";
import {
  AuthResponse,
  SweetsResponse,
  SweetResponse,
  PurchaseResponse,
  RestockResponse,
  SearchParams,
  CreateSweetData,
  UpdateSweetData,
} from "../types";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async register(
    email: string,
    password: string,
    name: string,
    role?: string
  ): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>("/auth/register", {
      email,
      password,
      name,
      role,
    });
    return response.data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>("/auth/login", {
      email,
      password,
    });
    return response.data;
  }

  async getProfile(): Promise<{ user: AuthResponse["user"] }> {
    const response = await this.api.get("/auth/profile");
    return response.data;
  }

  // Sweet endpoints
  async getAllSweets(page = 1, limit = 12): Promise<SweetsResponse> {
    const response = await this.api.get<SweetsResponse>("/sweets", {
      params: { page, limit },
    });
    return response.data;
  }

  async getSweetById(id: number): Promise<SweetResponse> {
    const response = await this.api.get<SweetResponse>(`/sweets/${id}`);
    return response.data;
  }

  async searchSweets(params: SearchParams): Promise<SweetsResponse> {
    const response = await this.api.get<SweetsResponse>("/sweets/search", {
      params,
    });
    return response.data;
  }

  async createSweet(data: CreateSweetData): Promise<SweetResponse> {
    const response = await this.api.post<SweetResponse>("/sweets", data);
    return response.data;
  }

  async updateSweet(id: number, data: UpdateSweetData): Promise<SweetResponse> {
    const response = await this.api.put<SweetResponse>(`/sweets/${id}`, data);
    return response.data;
  }

  async deleteSweet(id: number): Promise<{ message: string }> {
    const response = await this.api.delete(`/sweets/${id}`);
    return response.data;
  }

  // Inventory endpoints
  async purchaseSweet(id: number, quantity = 1): Promise<PurchaseResponse> {
    const response = await this.api.post<PurchaseResponse>(
      `/sweets/${id}/purchase`,
      { quantity }
    );
    return response.data;
  }

  async restockSweet(id: number, quantity: number): Promise<RestockResponse> {
    const response = await this.api.post<RestockResponse>(
      `/sweets/${id}/restock`,
      { quantity }
    );
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
