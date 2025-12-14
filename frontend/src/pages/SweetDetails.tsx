import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Sweet } from "../types";
import apiService from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  ArrowLeft,
  ShoppingCart,
  Package,
  Edit,
  Trash2,
  RefreshCw,
  Minus,
  Plus,
} from "lucide-react";
import toast from "react-hot-toast";
import "./SweetDetails.css";

const SweetDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [sweet, setSweet] = useState<Sweet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [restockAmount, setRestockAmount] = useState(10);
  const [isRestocking, setIsRestocking] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);

  useEffect(() => {
    const fetchSweet = async () => {
      if (!id) return;
      try {
        const response = await apiService.getSweetById(parseInt(id));
        setSweet(response.sweet);
      } catch (error) {
        toast.error("Failed to load sweet details");
        navigate("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSweet();
  }, [id, navigate]);

  const handlePurchase = async () => {
    if (!sweet) return;
    setIsPurchasing(true);
    try {
      const response = await apiService.purchaseSweet(sweet.id, quantity);
      setSweet(response.sweet);
      toast.success(`Successfully purchased ${quantity} ${sweet.name}!`);
      setQuantity(1);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Purchase failed");
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleDelete = async () => {
    if (
      !sweet ||
      !window.confirm("Are you sure you want to delete this sweet?")
    )
      return;
    setIsDeleting(true);
    try {
      await apiService.deleteSweet(sweet.id);
      toast.success("Sweet deleted successfully");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete sweet");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRestock = async () => {
    if (!sweet) return;
    setIsRestocking(true);
    try {
      const response = await apiService.restockSweet(sweet.id, restockAmount);
      setSweet(response.sweet);
      toast.success(`Added ${restockAmount} units to stock`);
      setShowRestockModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Restock failed");
    } finally {
      setIsRestocking(false);
    }
  };

  const getCategoryEmoji = (category: string): string => {
    const emojis: { [key: string]: string } = {
      Chocolate: "🍫",
      Candy: "🍬",
      Cake: "🎂",
      Cookie: "🍪",
      Pastry: "🥐",
      "Ice Cream": "🍦",
      Other: "🍭",
    };
    return emojis[category] || "🍭";
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading sweet details...</p>
      </div>
    );
  }

  if (!sweet) {
    return (
      <div className="not-found">
        <h2>Sweet not found</h2>
        <Link to="/dashboard" className="btn btn-primary">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const isOutOfStock = sweet.quantity === 0;
  const isLowStock = sweet.quantity > 0 && sweet.quantity <= 5;
  const maxPurchase = Math.min(sweet.quantity, 10);

  return (
    <div className="sweet-details">
      <button onClick={() => navigate(-1)} className="back-button">
        <ArrowLeft size={20} />
        Back
      </button>

      <div className="sweet-details-grid">
        <div className="sweet-image-section">
          {sweet.imageUrl ? (
            <img
              src={sweet.imageUrl}
              alt={sweet.name}
              className="sweet-image"
            />
          ) : (
            <div className="sweet-image-placeholder">
              <span>{getCategoryEmoji(sweet.category)}</span>
            </div>
          )}
        </div>

        <div className="sweet-info-section">
          <span className="sweet-category">{sweet.category}</span>
          <h1 className="sweet-name">{sweet.name}</h1>

          {sweet.description && (
            <p className="sweet-description">{sweet.description}</p>
          )}

          <div className="sweet-price">₹{sweet.price.toFixed(2)}</div>

          <div
            className={`stock-status ${
              isOutOfStock ? "out" : isLowStock ? "low" : "in"
            }`}
          >
            <Package size={20} />
            <span>
              {isOutOfStock ? "Out of Stock" : `${sweet.quantity} in stock`}
              {isLowStock && " (Low stock!)"}
            </span>
          </div>

          {!isOutOfStock && (
            <div className="purchase-section">
              <div className="quantity-selector">
                <button
                  className="qty-btn"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus size={16} />
                </button>
                <span className="qty-value">{quantity}</span>
                <button
                  className="qty-btn"
                  onClick={() =>
                    setQuantity((q) => Math.min(maxPurchase, q + 1))
                  }
                  disabled={quantity >= maxPurchase}
                >
                  <Plus size={16} />
                </button>
              </div>

              <button
                className="btn btn-primary btn-lg"
                onClick={handlePurchase}
                disabled={isPurchasing}
              >
                <ShoppingCart size={20} />
                {isPurchasing
                  ? "Purchasing..."
                  : `Purchase - ₹${(sweet.price * quantity).toFixed(2)}`}
              </button>
            </div>
          )}

          {isAdmin && (
            <div className="admin-actions">
              <h3>Admin Actions</h3>
              <div className="admin-buttons">
                <Link
                  to={`/edit-sweet/${sweet.id}`}
                  className="btn btn-outline"
                >
                  <Edit size={18} />
                  Edit
                </Link>
                <button
                  className="btn btn-success"
                  onClick={() => setShowRestockModal(true)}
                >
                  <RefreshCw size={18} />
                  Restock
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <Trash2 size={18} />
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showRestockModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowRestockModal(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Restock {sweet.name}</h3>
            <p>Current stock: {sweet.quantity}</p>
            <div className="form-group">
              <label className="form-label">Add quantity:</label>
              <input
                type="number"
                min="1"
                value={restockAmount}
                onChange={(e) =>
                  setRestockAmount(parseInt(e.target.value) || 0)
                }
                className="form-input"
              />
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowRestockModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-success"
                onClick={handleRestock}
                disabled={isRestocking || restockAmount < 1}
              >
                {isRestocking ? "Restocking..." : `Add ${restockAmount} units`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SweetDetails;
