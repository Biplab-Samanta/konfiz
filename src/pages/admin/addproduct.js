
import React, { useState } from "react";

function AddProduct({ onAddProduct, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    rating: "4.5",
    image: ""
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.category.trim() ||
      !formData.description.trim() ||
      !formData.price ||
      !formData.image.trim()
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (Number(formData.price) <= 0 || Number(formData.rating) < 0 || Number(formData.rating) > 5) {
      setError("Enter a valid price and a rating between 0 and 5.");
      return;
    }

    const newProduct = {
      id: Date.now(),
      name: formData.name.trim(),
      category: formData.category.trim(),
      description: formData.description.trim(),
      price: Number(formData.price),
      rating: Number(formData.rating),
      image: formData.image.trim()
    };

    onAddProduct(newProduct);

    setFormData({
      name: "",
      category: "",
      description: "",
      price: "",
      rating: "4.5",
      image: ""
    });

    setError("");
  };

  return (
    <div className="add-product-page">

      <div className="add-product-heading">
        <div>
          <h2>Add New Product</h2>
          <p>Add a new product to your KONFIZ store.</p>
        </div>

        <button type="button" onClick={onCancel} className="secondary-btn">
          Cancel
        </button>
      </div>

      <form className="product-form" onSubmit={handleSubmit}>

        <div className="form-grid">

          <div className="form-group">
            <label>Product Name *</label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Belgian Chocolate"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Category *</label>
            <input
              type="text"
              name="category"
              placeholder="e.g. Chocolate"
              value={formData.category}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group full-width">
            <label>Description *</label>
            <textarea
              name="description"
              placeholder="Enter product description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              required
            />
          </div>

          <div className="form-group">
            <label>Price (₹) *</label>
            <input
              type="number"
              name="price"
              placeholder="250"
              min="0.01"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Rating (0–5)</label>
            <input
              type="number"
              name="rating"
              min="0"
              max="5"
              step="0.1"
              value={formData.rating}
              onChange={handleChange}
            />
          </div>

          <div className="form-group full-width">
            <label>Product Image URL *</label>
            <input
              type="url"
              name="image"
              placeholder="https://example.com/product.jpg"
              value={formData.image}
              onChange={handleChange}
              required
            />
          </div>

        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button type="submit" className="primary-btn">
            + Save Product
          </button>
        </div>

      </form>

      {formData.image && (
        <div className="product-preview">
          <h3>Image Preview</h3>
          <img
            src={formData.image}
            alt="Product preview"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
            onLoad={(e) => {
              e.currentTarget.style.display = "block";
            }}
          />
        </div>
      )}

    </div>
  );
}

export default AddProduct;
