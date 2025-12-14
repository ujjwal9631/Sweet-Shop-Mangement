import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogIn, Mail, Lock, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import "./Auth.css";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

 const handleSubmit = async (e: React.FormEvent) => {
   e.preventDefault();
   setError("");
   setIsLoading(true);

   try {
     await login(email, password);

     const api = (await import("../services/api")).default;
     const profile = await api.getProfile();

     // ❌ Block admin users
     if (profile.user.role === "admin") {
       const msg = "Admin login is not allowed on this portal.";
       setError(msg);
       toast.error(msg);
       setIsLoading(false);
       return; // stop here
     }

     // ✅ Normal user login
     toast.success("Sign In!");
     toast.success("Welcome back!");
     navigate("/dashboard");
   } catch (err: any) {
     const message =
       err.response?.data?.message || "Login failed. Please try again.";
     setError(message);
     toast.error(message);
   } finally {
     setIsLoading(false);
   }
 };


  // Handler for admin login
  const handleAdminLogin = async () => {
    // const adminEmail = ;
    // const adminPassword = "Admin123@";
    // setEmail(adminEmail);
    // setPassword(adminPassword);
    setError("");
    setIsLoading(true);
    try {
      await login(email, password);
      // Fetch profile to check role
      const api = (await import("../services/api")).default;
      const profile = await api.getProfile();
      if (profile.user.role === "admin") {
        toast.success("Logged in as Admin!");
        navigate("/dashboard");
      } else {
        setError("You are not an admin.");
        toast.error("You are not an admin.");
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Admin login failed. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">
            <LogIn size={32} />
          </div>
          <h1>Welcome Back!</h1>
          <p>Sign in to continue to Sweet Shop</p>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">
              <Mail size={16} />
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="you@example.com"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Lock size={16} />
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            onClick={handleSubmit}
            className="btn btn-primary btn-block"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-block"
            style={{ marginTop: "10px" }}
            onClick={handleAdminLogin}
            disabled={isLoading}
          >
            Login as Admin
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
