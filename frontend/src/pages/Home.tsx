import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Candy, ShoppingBag, Shield, Sparkles, ChevronRight } from 'lucide-react';
import './Home.css';

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="hero-emoji">🍬</span>
            Welcome to <span className="gradient-text">Sweet Shop</span>
          </h1>
          <p className="hero-subtitle">
            Discover the sweetest treats! From rich chocolates to delightful candies,
            find everything to satisfy your sweet tooth.
          </p>
          <div className="hero-actions">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-primary btn-lg">
                <ShoppingBag size={20} />
                Browse Sweets
                <ChevronRight size={20} />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">
                  <Sparkles size={20} />
                  Get Started
                  <ChevronRight size={20} />
                </Link>
                <Link to="/login" className="btn btn-outline btn-lg">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="hero-decoration">
          <div className="floating-emoji emoji-1">🍫</div>
          <div className="floating-emoji emoji-2">🍰</div>
          <div className="floating-emoji emoji-3">🍪</div>
          <div className="floating-emoji emoji-4">🍦</div>
          <div className="floating-emoji emoji-5">🧁</div>
        </div>
      </section>

      <section className="features">
        <h2 className="section-title">Why Choose Sweet Shop?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <Candy size={32} />
            </div>
            <h3>Wide Variety</h3>
            <p>From chocolates to pastries, we have all your favorite sweets in one place.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <ShoppingBag size={32} />
            </div>
            <h3>Easy Shopping</h3>
            <p>Browse, search, and purchase your favorite treats with just a few clicks.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Shield size={32} />
            </div>
            <h3>Secure & Reliable</h3>
            <p>Your account and transactions are protected with enterprise-grade security.</p>
          </div>
        </div>
      </section>

      <section className="categories-preview">
        <h2 className="section-title">Our Sweet Categories</h2>
        <div className="category-cards">
          <div className="category-card">
            <span className="category-card-emoji">🍫</span>
            <span>Chocolate</span>
          </div>
          <div className="category-card">
            <span className="category-card-emoji">🍬</span>
            <span>Candy</span>
          </div>
          <div className="category-card">
            <span className="category-card-emoji">🎂</span>
            <span>Cake</span>
          </div>
          <div className="category-card">
            <span className="category-card-emoji">🍪</span>
            <span>Cookie</span>
          </div>
          <div className="category-card">
            <span className="category-card-emoji">🥐</span>
            <span>Pastry</span>
          </div>
          <div className="category-card">
            <span className="category-card-emoji">🍦</span>
            <span>Ice Cream</span>
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <p>🍬 Sweet Shop Management System - TDD Kata Project</p>
        <p>Built with React, Node.js, Express, and MongoDB</p>
      </footer>
    </div>
  );
};

export default Home;
