import React, { useState, useEffect } from 'react';
import { Sweet } from '../types';
import apiService from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, 
  Package, 
  Trash2, 
  RefreshCw,
  AlertTriangle,
  Check,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import './AdminPanel.css';

const AdminPanel: React.FC = () => {
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSweet, setSelectedSweet] = useState<Sweet | null>(null);
  const [restockAmount, setRestockAmount] = useState(10);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    fetchAllSweets();
  }, []);

  const fetchAllSweets = async () => {
    try {
      const response = await apiService.getAllSweets(1, 100);
      setSweets(response.sweets);
    } catch (error) {
      toast.error('Failed to load sweets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestock = async () => {
    if (!selectedSweet) return;
    setIsProcessing(true);
    try {
      await apiService.restockSweet(selectedSweet._id, restockAmount);
      toast.success(`Added ${restockAmount} units to ${selectedSweet.name}`);
      setShowRestockModal(false);
      fetchAllSweets();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Restock failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSweet) return;
    setIsProcessing(true);
    try {
      await apiService.deleteSweet(selectedSweet._id);
      toast.success(`${selectedSweet.name} deleted`);
      setShowDeleteModal(false);
      fetchAllSweets();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Delete failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const openRestockModal = (sweet: Sweet) => {
    setSelectedSweet(sweet);
    setRestockAmount(10);
    setShowRestockModal(true);
  };

  const openDeleteModal = (sweet: Sweet) => {
    setSelectedSweet(sweet);
    setShowDeleteModal(true);
  };

  // Stats
  const totalSweets = sweets.length;
  const outOfStock = sweets.filter(s => s.quantity === 0).length;
  const lowStock = sweets.filter(s => s.quantity > 0 && s.quantity <= 5).length;
  const totalValue = sweets.reduce((sum, s) => sum + (s.price * s.quantity), 0);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading admin panel...</p>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <div className="admin-title">
          <Shield size={32} />
          <div>
            <h1>Admin Panel</h1>
            <p>Manage sweets inventory and stock levels</p>
          </div>
        </div>
        <div className="admin-user">
          Logged in as <strong>{user?.name}</strong>
        </div>
      </div>

      <div className="admin-stats">
        <div className="admin-stat">
          <Package size={24} />
          <div>
            <span className="stat-number">{totalSweets}</span>
            <span className="stat-text">Total Products</span>
          </div>
        </div>
        <div className="admin-stat warning">
          <AlertTriangle size={24} />
          <div>
            <span className="stat-number">{lowStock}</span>
            <span className="stat-text">Low Stock</span>
          </div>
        </div>
        <div className="admin-stat danger">
          <X size={24} />
          <div>
            <span className="stat-number">{outOfStock}</span>
            <span className="stat-text">Out of Stock</span>
          </div>
        </div>
        <div className="admin-stat success">
          <Check size={24} />
          <div>
            <span className="stat-number">${totalValue.toFixed(2)}</span>
            <span className="stat-text">Inventory Value</span>
          </div>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sweets.map(sweet => {
              const isOut = sweet.quantity === 0;
              const isLow = sweet.quantity > 0 && sweet.quantity <= 5;
              
              return (
                <tr key={sweet._id} className={isOut ? 'out-of-stock' : ''}>
                  <td className="cell-name">{sweet.name}</td>
                  <td>{sweet.category}</td>
                  <td>${sweet.price.toFixed(2)}</td>
                  <td className={isOut ? 'text-danger' : isLow ? 'text-warning' : ''}>
                    {sweet.quantity}
                  </td>
                  <td>
                    {isOut ? (
                      <span className="badge badge-danger">Out of Stock</span>
                    ) : isLow ? (
                      <span className="badge badge-warning">Low Stock</span>
                    ) : (
                      <span className="badge badge-success">In Stock</span>
                    )}
                  </td>
                  <td className="cell-actions">
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => openRestockModal(sweet)}
                      title="Restock"
                    >
                      <RefreshCw size={16} />
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => openDeleteModal(sweet)}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Restock Modal */}
      {showRestockModal && selectedSweet && (
        <div className="modal-overlay" onClick={() => setShowRestockModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Restock {selectedSweet.name}</h3>
            <p>Current stock: <strong>{selectedSweet.quantity}</strong></p>
            <div className="form-group">
              <label className="form-label">Add quantity:</label>
              <input
                type="number"
                min="1"
                value={restockAmount}
                onChange={e => setRestockAmount(parseInt(e.target.value) || 0)}
                className="form-input"
              />
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowRestockModal(false)}
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                className="btn btn-success"
                onClick={handleRestock}
                disabled={isProcessing || restockAmount < 1}
              >
                {isProcessing ? 'Processing...' : `Add ${restockAmount} units`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedSweet && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Delete {selectedSweet.name}?</h3>
            <p>This action cannot be undone. The sweet will be permanently removed.</p>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={isProcessing}
              >
                {isProcessing ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
