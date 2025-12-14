import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Candy,
  LogOut,
  User,
  LayoutDashboard,
  Shield,
  Plus,
} from "lucide-react";
import "./Navbar.css";

const Navbar: React.FC = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          {/* <IconCake /> */}
          {/* <Candy className="brand-icon" /> */}
          <span>Sweet Shop</span>
        </Link>

        <div className="navbar-menu">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="nav-link">
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </Link>

              {isAdmin && (
                <Link to="/admin" className="nav-link admin-link">
                  <Shield size={18} />
                  <span>Admin</span>
                </Link>
              )}

              <div className="user-menu">
                <div className="user-info">
                  <User size={18} />
                  <span>{user?.name}</span>
                  {isAdmin && <span className="badge badge-info">Admin</span>}
                </div>
                <button onClick={handleLogout} className="btn-logout">
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
