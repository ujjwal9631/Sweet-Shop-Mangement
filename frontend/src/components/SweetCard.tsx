import React from 'react';
import { Link } from 'react-router-dom';
import { Sweet } from '../types';
import { ShoppingCart, Package, Edit } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './SweetCard.css';

interface SweetCardProps {
  sweet: Sweet;
  onPurchase?: (id: string) => void;
  isPurchasing?: boolean;
}

const SweetCard: React.FC<SweetCardProps> = ({ sweet, onPurchase, isPurchasing }) => {
  const { isAdmin } = useAuth();
  const isOutOfStock = sweet.quantity === 0;
  const isLowStock = sweet.quantity > 0 && sweet.quantity <= 5;

  const getCategoryEmoji = (category: string): string => {
    const emojis: { [key: string]: string } = {
      'Chocolate': '🍫',
      'Candy': '🍬',
      'Cake': '🎂',
      'Cookie': '🍪',
      'Pastry': '🥐',
      'Ice Cream': '🍦',
      'Other': '🍭'
    };
    return emojis[category] || '🍭';
  };

  return (
    <div className={`sweet-card ${isOutOfStock ? 'out-of-stock' : ''}`}>
      <div className="sweet-card-image">
        {sweet.imageUrl ? (
          <img src={sweet.imageUrl} alt={sweet.name} />
        ) : (
          <div className="sweet-card-placeholder">
            <span className="category-emoji">{getCategoryEmoji(sweet.category)}</span>
          </div>
        )}
        <span className="category-badge">{sweet.category}</span>
      </div>

      <div className="sweet-card-content">
        <Link to={`/sweets/${sweet._id}`} className="sweet-card-title">
          {sweet.name}
        </Link>
        
        {sweet.description && (
          <p className="sweet-card-description">{sweet.description}</p>
        )}

        <div className="sweet-card-footer">
          <div className="sweet-card-price">
            ${sweet.price.toFixed(2)}
          </div>

          <div className="sweet-card-stock">
            <Package size={16} />
            <span className={isOutOfStock ? 'text-danger' : isLowStock ? 'text-warning' : ''}>
              {isOutOfStock ? 'Out of Stock' : `${sweet.quantity} in stock`}
            </span>
          </div>
        </div>

        <div className="sweet-card-actions">
          {onPurchase && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onPurchase(sweet._id)}
              disabled={isOutOfStock || isPurchasing}
            >
              <ShoppingCart size={16} />
              {isPurchasing ? 'Purchasing...' : 'Purchase'}
            </button>
          )}
          
          {isAdmin && (
            <Link to={`/edit-sweet/${sweet._id}`} className="btn btn-outline btn-sm">
              <Edit size={16} />
              Edit
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default SweetCard;
