
import React, { useState } from "react";
import "../../style/add_product.css";

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

  // NEW: Weight configuration
  const [weightUnit, setWeightUnit] = useState("ml");
  const [weightOptions, setWeightOptions] = useState([
    100, 250, 500, 1000
  ]);
  const [customWeight, setCustomWeight] = useState("");

  // NEW: Add-ons configuration
  const [addons, setAddons] = useState([]);
  const [addonName, setAddonName] = useState("");
  const [addonPrice, setAddonPrice] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // NEW: Add custom weight
  const handleAddWeight = () => {
    const weight = Number(customWeight);

    if (!weight || weight <= 0) return;

    if (weightOptions.includes(weight)) {
      setError("This weight already exists.");
      return;
    }

    setWeightOptions((prev) => [...prev, weight].sort((a, b) => a - b));
    setCustomWeight("");
    setError("");
  };

  // NEW: Remove weight option
  const handleRemoveWeight = (weight) => {
    setWeightOptions((prev) => prev.filter((item) => item !== weight));
  };

  // NEW: Add addon
  const handleAddAddon = () => {
    if (!addonName.trim() || addonPrice === "") {
      setError("Enter add-on name and price.");
      return;
    }

    if (!Number.isFinite(Number(addonPrice)) || Number(addonPrice) < 0) {
      setError("Enter a valid add-on price.");
      return;
    }

    setAddons((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        name: addonName.trim(),
        price: Number(addonPrice)
      }
    ]);

    setAddonName("");
    setAddonPrice("");
    setError("");
  };

  // NEW: Remove addon
  const handleRemoveAddon = (id) => {
    setAddons((prev) => prev.filter((item) => item.id !== id));
  };

  // NEW: Calculate price based on weight
  const calculateWeightPrice = (weight) => {
    return (Number(formData.price || 0) * weight) / 100;
  };

  // NEW: Calculate total including addons
  const calculateTotalPrice = (weight, selectedAddons = []) => {
    const basePrice = calculateWeightPrice(weight);

    const extraPrice = addons
      .filter((addon) => selectedAddons.includes(addon.id))
      .reduce((total, addon) => total + addon.price, 0);

    return basePrice + extraPrice;
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

    if (
      !Number.isFinite(Number(formData.price)) ||
      Number(formData.price) <= 0 ||
      !Number.isFinite(Number(formData.rating)) ||
      Number(formData.rating) < 0 ||
      Number(formData.rating) > 5
    ) {
      setError("Enter a valid price and a rating between 0 and 5.");
      return;
    }

    if (weightOptions.length === 0) {
      setError("Please select at least one weight option.");
      return;
    }

    const newProduct = {
      id: Date.now(),
      name: formData.name.trim(),
      category: formData.category.trim(),
      description: formData.description.trim(),

      // Keep existing price field for compatibility.
      // This is the price per 100 ml or 100 gm.
      price: Number(formData.price),

      rating: Number(formData.rating),
      image: formData.image,

      // NEW: Weight pricing information
      pricing: {
        unit: weightUnit,
        baseQuantity: 100,
        pricePerBaseUnit: Number(formData.price),
        weightOptions: weightOptions
      },

      // NEW: Available add-ons
      addons: addons.map((addon) => ({
        id: addon.id,
        name: addon.name,
        price: addon.price
      }))
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

    setWeightUnit("ml");
    setWeightOptions([100, 250, 500, 1000]);
    setCustomWeight("");
    setAddons([]);
    setAddonName("");
    setAddonPrice("");
    setError("");
  };

  // Existing image upload function
  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image.");
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        image: reader.result
      }));
    };

    reader.readAsDataURL(file);
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

        {/* PRODUCT IMAGE */}
        <div className="form-group full-width">
          <label>Upload Product Image (PNG/JPG) *</label>

          <input
            type="file"
            accept="image/png, image/jpeg, image/webp"
            onChange={handleImageChange}
            required={!formData.image}
          />

          {formData.image && (
            <div className="image-preview">
              <img
                src={formData.image}
                alt="Product Preview"
                style={{
                  width: "180px",
                  height: "150px",
                  objectFit: "contain",
                  marginTop: "10px"
                }}
              />
            </div>
          )}
        </div>

        <div className="form-grid">

          {/* EXISTING PRODUCT FIELDS */}
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

          {/* NEW: WEIGHT PRICING */}
          <div className="form-group full-width">
            <h3>Weight & Pricing</h3>

            <label>Measurement Unit</label>

            <select
              value={weightUnit}
              onChange={(e) => setWeightUnit(e.target.value)}
            >
              <option value="ml">Millilitre (ML)</option>
              <option value="g">Gram (GM)</option>
            </select>

            <label>
              Price per 100 {weightUnit} (₹) *
            </label>

            <input
              type="number"
              name="price"
              placeholder="e.g. 60"
              min="0.01"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              required
            />

            <label>Available Weight Options</label>

            <div className="weight-options">
              {weightOptions.map((weight) => (
                <div className="weight-option" key={weight}>
                  <span>
                    {weight} {weightUnit}
                  </span>

                  <span>
                    ₹{calculateWeightPrice(weight).toFixed(2)}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleRemoveWeight(weight)}
                    aria-label={`Remove ${weight} ${weightUnit}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="add-weight-row">
              <input
                type="number"
                placeholder={`Enter weight in ${weightUnit}`}
                min="1"
                value={customWeight}
                onChange={(e) => setCustomWeight(e.target.value)}
              />

              <button type="button" onClick={handleAddWeight}>
                + Add Weight
              </button>
            </div>
          </div>

          {/* EXISTING RATING */}
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

          {/* NEW: ADDONS PANEL */}
          <div className="form-group full-width">
            <h3>Product Add-ons</h3>
            <p>Add optional extras for customers.</p>

            <div className="addon-input-row">
              <input
                type="text"
                placeholder="Add-on name (e.g. Sprinkles)"
                value={addonName}
                onChange={(e) => setAddonName(e.target.value)}
              />

              <input
                type="number"
                placeholder="Price ₹"
                min="0"
                step="0.01"
                value={addonPrice}
                onChange={(e) => setAddonPrice(e.target.value)}
              />

              <button type="button" onClick={handleAddAddon}>
                + Add
              </button>
            </div>

            <div className="addon-list">
              {addons.map((addon) => (
                <div className="addon-item" key={addon.id}>
                  <span>{addon.name}</span>
                  <strong>₹{addon.price.toFixed(2)}</strong>

                  <button
                    type="button"
                    onClick={() => handleRemoveAddon(addon.id)}
                    aria-label={`Remove ${addon.name}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {addons.length === 0 && (
              <p>No add-ons added yet.</p>
            )}
          </div>

          {/* NEW: PRICE PREVIEW */}
          <div className="form-group full-width">
            <h3>Weight Price Preview</h3>

            {weightOptions.map((weight) => (
              <div className="price-preview-row" key={weight}>
                <span>{weight} {weightUnit}</span>
                <strong>
                  ₹{calculateTotalPrice(weight).toFixed(2)}
                </strong>
              </div>
            ))}

            <small>
              Add-on prices will be added when customers select them.
            </small>
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
