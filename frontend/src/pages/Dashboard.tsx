import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Sweet, SearchParams } from "../types";
import apiService from "../services/api";
import SweetCard from "../components/SweetCard";
import SearchFilter from "../components/SearchFilter";
import { useAuth } from "../context/AuthContext";
import { Package, TrendingUp, AlertTriangle, Plus } from "lucide-react";
import toast from "react-hot-toast";
import "./Dashboard.css";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState<number | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });
  const [searchParams, setSearchParams] = useState<SearchParams>({});

  const { user } = useAuth();

  const fetchSweets = useCallback(
    async (params: SearchParams = {}) => {
      setIsLoading(true);
      try {
        const hasSearchParams =
          params.name || params.category || params.minPrice || params.maxPrice;

        if (hasSearchParams) {
          const response = await apiService.searchSweets({
            ...params,
            page: pagination.page,
            limit: pagination.limit,
          });
          setSweets(response.sweets);
          setPagination(response.pagination);
        } else {
          const response = await apiService.getAllSweets(
            pagination.page,
            pagination.limit
          );
          setSweets(response.sweets);
          setPagination(response.pagination);
        }
      } catch (error) {
        console.error("Failed to fetch sweets:", error);
        toast.error("Failed to load sweets");
      } finally {
        setIsLoading(false);
      }
    },
    [pagination.page, pagination.limit]
  );

  useEffect(() => {
    fetchSweets(searchParams);
  }, [fetchSweets, searchParams]);

  const handleSearch = (params: SearchParams) => {
    setSearchParams(params);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePurchase = async (id: number) => {
    setPurchasingId(id);
    try {
      await apiService.purchaseSweet(id, 1);
      toast.success("Purchase successful!");
      fetchSweets(searchParams);
    } catch (error: any) {
      const message = error.response?.data?.message || "Purchase failed";
      toast.error(message);
    } finally {
      setPurchasingId(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  // Calculate stats
  const inStock = sweets.filter((s) => s.quantity > 0).length;
  const outOfStock = sweets.filter((s) => s.quantity === 0).length;
  const lowStock = sweets.filter(
    (s) => s.quantity > 0 && s.quantity <= 5
  ).length;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.name}! 🍬</h1>
          <p className="page-subtitle">
            Browse and purchase your favorite sweets
          </p>
        </div>
        {user?.role === "admin" && (
          <button
            className="btn btn-primary add-sweet-btn"
            onClick={() => navigate("/add-sweet")}
          >
            <Plus size={20} />
            Add New Sweet
          </button>
        )}
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <Package size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{pagination.total}</span>
            <span className="stat-label">Total Sweets</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{inStock}</span>
            <span className="stat-label">In Stock</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon warning">
            <AlertTriangle size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{lowStock}</span>
            <span className="stat-label">Low Stock</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon danger">
            <Package size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{outOfStock}</span>
            <span className="stat-label">Out of Stock</span>
          </div>
        </div>
      </div>

      <SearchFilter onSearch={handleSearch} />

      {isLoading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading sweets...</p>
        </div>
      ) : sweets.length === 0 ? (
        <div className="empty-state">
          <span className="empty-emoji">🍭</span>
          <h3>No sweets found</h3>
          <p>Try adjusting your search filters or add some new sweets!</p>
        </div>
      ) : (
        <>
          <div className="sweets-grid grid grid-cols-4">
            {sweets.map((sweet) => (
              <SweetCard
                key={sweet.id}
                sweet={sweet}
                onPurchase={handlePurchase}
                isPurchasing={purchasingId === sweet.id}
              />
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-outline"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                className="btn btn-outline"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
