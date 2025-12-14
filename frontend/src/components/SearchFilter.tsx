import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { CATEGORIES } from '../types';
import './SearchFilter.css';

interface SearchFilterProps {
  onSearch: (params: {
    name?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
  }) => void;
}

const SearchFilter: React.FC<SearchFilterProps> = ({ onSearch }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      name: name || undefined,
      category: category || undefined,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined
    });
  };

  const handleClear = () => {
    setName('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    onSearch({});
  };

  const hasFilters = name || category || minPrice || maxPrice;

  return (
    <div className="search-filter">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search sweets..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="search-input"
          />
        </div>

        <button
          type="button"
          className={`btn btn-outline filter-toggle ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={18} />
          Filters
        </button>

        <button type="submit" className="btn btn-primary">
          Search
        </button>

        {hasFilters && (
          <button type="button" className="btn btn-secondary" onClick={handleClear}>
            <X size={18} />
            Clear
          </button>
        )}
      </form>

      {showFilters && (
        <div className="filter-panel">
          <div className="filter-group">
            <label className="form-label">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="form-select"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="form-label">Min Price ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="form-input"
              placeholder="0.00"
            />
          </div>

          <div className="filter-group">
            <label className="form-label">Max Price ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="form-input"
              placeholder="100.00"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilter;
