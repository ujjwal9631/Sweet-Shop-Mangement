import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CATEGORIES, UpdateSweetData } from "../types";
import apiService from "../services/api";
import { Edit, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import "./SweetForm.css";

const EditSweet: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<UpdateSweetData>({
    name: "",
    category: "Chocolate",
    price: 0,
    quantity: 0,
    description: "",
    imageUrl: "",
  });

  useEffect(() => {
    const fetchSweet = async () => {
      if (!id) return;
      try {
        const response = await apiService.getSweetById(parseInt(id));
        const sweet = response.sweet;
        setFormData({
          name: sweet.name,
          category: sweet.category,
          price: sweet.price,
          quantity: sweet.quantity,
          description: sweet.description || "",
          imageUrl: sweet.imageUrl || "",
        });
      } catch (error) {
        toast.error("Failed to load sweet");
        navigate("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSweet();
  }, [id, navigate]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "price" || name === "quantity" ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setIsSubmitting(true);

    try {
      await apiService.updateSweet(parseInt(id), formData);
      toast.success("Sweet updated successfully!");
      navigate(`/sweets/${id}`);
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to update sweet";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading sweet details...</p>
      </div>
    );
  }

  return (
    <div className="sweet-form-container">
      <button onClick={() => navigate(-1)} className="back-button">
        <ArrowLeft size={20} />
        Back
      </button>

      <div className="sweet-form-card">
        <div className="form-header">
          <Edit size={32} />
          <h1>Edit Sweet</h1>
          <p>Update the sweet details</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Sweet Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g., Chocolate Truffle"
              required
              minLength={2}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="form-select"
                required
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Price (₹) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="form-input"
                placeholder="0"
                min="0"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Quantity</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="form-input"
              placeholder="0"
              min="0"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-input form-textarea"
              placeholder="Describe this delicious sweet..."
              rows={4}
              maxLength={500}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Image URL</label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              className="form-input"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSweet;
