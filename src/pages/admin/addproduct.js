
import React, { useState, useMemo } from "react";
import "../../style/add_product.css";

function AddProduct({
    onAddProduct,
    onCancel,
    categories = []
}) {

    // =====================================
    // FORM DATA
    // =====================================

    const [formData, setFormData] = useState({
        name: "",
        category: "",
        description: "",
        price: "",
        rating: "4.5",
        image: ""
    });

    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    const [selectedSubcategoryId, setSelectedSubcategoryId] = useState("");

    const [error, setError] = useState("");

    // =====================================
    // CATEGORY HELPERS
    // =====================================

    const getCategoryId = (category) => {
        if (typeof category === "string") {
            return category;
        }

        return String(
            category?.id ??
            category?._id ??
            category?.categoryId ??
            ""
        );
    };

    const getCategoryName = (category) => {
        if (typeof category === "string") {
            return category;
        }

        return category?.name || category?.categoryName || "";
    };

    const getSubcategoryId = (subcategory) => {
        if (typeof subcategory === "string") {
            return subcategory;
        }

        return String(
            subcategory?.id ??
            subcategory?._id ??
            subcategory?.subcategoryId ??
            ""
        );
    };

    const getSubcategoryName = (subcategory) => {
        if (typeof subcategory === "string") {
            return subcategory;
        }

        return (
            subcategory?.name ||
            subcategory?.subcategoryName ||
            ""
        );
    };

    // =====================================
    // NORMALIZE CATEGORY DATA
    // Supports strings and objects
    // =====================================

    const availableCategories = useMemo(() => {
        return categories
            .map((category) => ({
                id: getCategoryId(category),
                name: getCategoryName(category),
                original: category
            }))
            .filter((category) => category.id && category.name.trim());
    }, [categories]);

    // =====================================
    // SELECTED CATEGORY
    // =====================================

    const selectedCategory = availableCategories.find(
        (category) => category.id === selectedCategoryId
    );

    // =====================================
    // GET SUBCATEGORIES OF SELECTED CATEGORY
    // =====================================

    const availableSubcategories = useMemo(() => {
        if (!selectedCategory) {
            return [];
        }

        const category = selectedCategory.original;

        if (typeof category === "string") {
            return [];
        }

        return (category.subcategories || [])
            .map((subcategory) => ({
                id: getSubcategoryId(subcategory),
                name: getSubcategoryName(subcategory)
            }))
            .filter((subcategory) => subcategory.id && subcategory.name.trim());
    }, [selectedCategory]);

    // =====================================
    // SELECTED SUBCATEGORY
    // =====================================

    const selectedSubcategory = availableSubcategories.find(
        (subcategory) => subcategory.id === selectedSubcategoryId
    );

    // =====================================
    // HANDLE FORM CHANGES
    // =====================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        setError("");
    };

    // =====================================
    // HANDLE CATEGORY CHANGE
    // =====================================

    const handleCategoryChange = (e) => {
        const categoryId = e.target.value;

        const category = availableCategories.find(
            (item) => item.id === categoryId
        );

        setSelectedCategoryId(categoryId);
        setSelectedSubcategoryId("");

        setFormData((prev) => ({
            ...prev,
            category: category?.name || ""
        }));

        setError("");
    };

    // =====================================
    // HANDLE SUBCATEGORY CHANGE
    // =====================================

    const handleSubcategoryChange = (e) => {
        setSelectedSubcategoryId(e.target.value);
        setError("");
    };

    // =====================================
    // WEIGHT CONFIGURATION
    // =====================================

    const [weightUnit, setWeightUnit] = useState("ml");

    const [weightOptions, setWeightOptions] = useState([
        100, 250, 500, 1000
    ]);

    const [customWeight, setCustomWeight] = useState("");

    // =====================================
    // ADD-ONS CONFIGURATION
    // =====================================

    const [addons, setAddons] = useState([]);
    const [addonName, setAddonName] = useState("");
    const [addonPrice, setAddonPrice] = useState("");

    // =====================================
    // ADD CUSTOM WEIGHT
    // =====================================

    const handleAddWeight = () => {
        const weight = Number(customWeight);

        if (!weight || weight <= 0) {
            setError("Enter a valid weight.");
            return;
        }

        if (weightOptions.includes(weight)) {
            setError("This weight already exists.");
            return;
        }

        setWeightOptions((prev) =>
            [...prev, weight].sort((a, b) => a - b)
        );

        setCustomWeight("");
        setError("");
    };

    // =====================================
    // REMOVE WEIGHT OPTION
    // =====================================

    const handleRemoveWeight = (weight) => {
        if (weightOptions.length === 1) {
            setError("At least one weight option is required.");
            return;
        }

        setWeightOptions((prev) =>
            prev.filter((item) => item !== weight)
        );

        setError("");
    };

    // =====================================
    // ADD ADD-ON
    // =====================================

    const handleAddAddon = () => {
        if (!addonName.trim() || addonPrice === "") {
            setError("Enter add-on name and price.");
            return;
        }

        if (
            !Number.isFinite(Number(addonPrice)) ||
            Number(addonPrice) < 0
        ) {
            setError("Enter a valid add-on price.");
            return;
        }

        const alreadyExists = addons.some(
            (addon) =>
                addon.name.toLowerCase() ===
                addonName.trim().toLowerCase()
        );

        if (alreadyExists) {
            setError("This add-on already exists.");
            return;
        }

        setAddons((prev) => [
            ...prev,
            {
                id: `ADD-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                name: addonName.trim(),
                price: Number(addonPrice)
            }
        ]);

        setAddonName("");
        setAddonPrice("");
        setError("");
    };

    // =====================================
    // REMOVE ADD-ON
    // =====================================

    const handleRemoveAddon = (id) => {
        setAddons((prev) =>
            prev.filter((item) => item.id !== id)
        );
    };

    // =====================================
    // CALCULATE PRICE BASED ON WEIGHT
    // Price per 100 ml or 100 gm
    // =====================================

    const calculateWeightPrice = (weight) => {
        return (
            (Number(formData.price || 0) * weight) / 100
        );
    };

    // =====================================
    // CALCULATE TOTAL INCLUDING ADD-ONS
    // =====================================

    const calculateTotalPrice = (
        weight,
        selectedAddons = []
    ) => {
        const basePrice = calculateWeightPrice(weight);

        const extraPrice = addons
            .filter((addon) =>
                selectedAddons.includes(addon.id)
            )
            .reduce(
                (total, addon) => total + addon.price,
                0
            );

        return basePrice + extraPrice;
    };

    // =====================================
    // IMAGE UPLOAD
    // =====================================

    const handleImageChange = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setError("Please select a valid image.");
            e.target.value = "";
            return;
        }

        const reader = new FileReader();

        reader.onloadend = () => {
            setFormData((prev) => ({
                ...prev,
                image: reader.result
            }));

            setError("");
        };

        reader.onerror = () => {
            setError("Unable to read the selected image.");
        };

        reader.readAsDataURL(file);
    };

    // =====================================
    // RESET FORM
    // =====================================

    const resetForm = () => {
        setFormData({
            name: "",
            category: "",
            description: "",
            price: "",
            rating: "4.5",
            image: ""
        });

        setSelectedCategoryId("");
        setSelectedSubcategoryId("");

        setWeightUnit("ml");
        setWeightOptions([100, 250, 500, 1000]);
        setCustomWeight("");

        setAddons([]);
        setAddonName("");
        setAddonPrice("");

        setError("");
    };

    // =====================================
    // SUBMIT PRODUCT
    // =====================================

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            setError("Please enter product name.");
            return;
        }

        if (!selectedCategoryId || !selectedCategory) {
            setError("Please select a valid product category.");
            return;
        }

        if (!selectedSubcategoryId || !selectedSubcategory) {
            setError("Please select a product subcategory.");
            return;
        }

        if (!formData.description.trim()) {
            setError("Please enter product description.");
            return;
        }

        if (
            !formData.price ||
            !Number.isFinite(Number(formData.price)) ||
            Number(formData.price) <= 0
        ) {
            setError("Please enter a valid product price.");
            return;
        }

        if (!formData.image) {
            setError("Please upload a product image.");
            return;
        }

        if (
            !Number.isFinite(Number(formData.rating)) ||
            Number(formData.rating) < 0 ||
            Number(formData.rating) > 5
        ) {
            setError("Enter a rating between 0 and 5.");
            return;
        }

        if (weightOptions.length === 0) {
            setError("Please select at least one weight option.");
            return;
        }

        // Verify selected category still exists
        const categoryStillExists = availableCategories.some(
            (category) => category.id === selectedCategoryId
        );

        if (!categoryStillExists) {
            setError("Selected category is no longer available.");
            return;
        }

        // Verify selected subcategory still exists
        const subcategoryStillExists = availableSubcategories.some(
            (subcategory) => subcategory.id === selectedSubcategoryId
        );

        if (!subcategoryStillExists) {
            setError("Selected subcategory is no longer available.");
            return;
        }

        if (typeof onAddProduct !== "function") {
            setError("Product save function is not available.");
            return;
        }

        const newProduct = {
            id: `KON-PROD-${Date.now()}`,

            name: formData.name.trim(),

            // Main category information
            categoryId: selectedCategoryId,
            category: selectedCategory.name,

            // Subcategory information
            subcategoryId: selectedSubcategoryId,
            subcategory: selectedSubcategory.name,
            subcategoryName: selectedSubcategory.name,

            description: formData.description.trim(),

            // Price per 100 ml or 100 gm
            price: Number(formData.price),

            rating: Number(formData.rating),

            image: formData.image,

            stock: 0,

            // Weight pricing information
            pricing: {
                unit: weightUnit,
                baseQuantity: 100,
                pricePerBaseUnit: Number(formData.price),
                weightOptions: [...weightOptions]
            },

            // Available add-ons
            addons: addons.map((addon) => ({
                id: addon.id,
                name: addon.name,
                price: addon.price
            }))
        };

        try {
            onAddProduct(newProduct);
            resetForm();
        } catch (saveError) {
            console.error("Product save error:", saveError);
            setError("Unable to save product. Please try again.");
        }
    };

    // =====================================
    // UI
    // =====================================

    return (
        <div className="add-product-page">

            <div className="add-product-heading">
                <div>
                    <h2>Add New Product</h2>
                    <p>
                        Add a new product to your KONFIZ store.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onCancel}
                    className="secondary-btn"
                >
                    Cancel
                </button>
            </div>

            <form
                className="product-form"
                onSubmit={handleSubmit}
            >

                {/* PRODUCT IMAGE */}

                <div className="form-group full-width">
                    <label>
                        Upload Product Image (PNG/JPG) *
                    </label>

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

                    {/* PRODUCT NAME */}

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

                    {/* MAIN CATEGORY */}

                    <div className="form-group">
                        <label>Main Category *</label>

                        <select
                            value={selectedCategoryId}
                            onChange={handleCategoryChange}
                            required
                        >
                            <option value="">
                                -- Select Main Category --
                            </option>

                            {availableCategories.map((category) => (
                                <option
                                    key={category.id}
                                    value={category.id}
                                >
                                    {category.name}
                                </option>
                            ))}
                        </select>

                        {availableCategories.length === 0 && (
                            <small>
                                No categories available. Please add a category
                                from Dashboard → Categories.
                            </small>
                        )}
                    </div>

                    {/* SUBCATEGORY */}

                    <div className="form-group">
                        <label>Subcategory *</label>

                        <select
                            value={selectedSubcategoryId}
                            onChange={handleSubcategoryChange}
                            disabled={
                                !selectedCategoryId ||
                                availableSubcategories.length === 0
                            }
                            required
                        >
                            <option value="">
                                {!selectedCategoryId
                                    ? "Select main category first"
                                    : availableSubcategories.length === 0
                                        ? "No subcategories available"
                                        : "-- Select Subcategory --"}
                            </option>

                            {availableSubcategories.map((subcategory) => (
                                <option
                                    key={subcategory.id}
                                    value={subcategory.id}
                                >
                                    {subcategory.name}
                                </option>
                            ))}
                        </select>

                        {selectedCategoryId &&
                            availableSubcategories.length === 0 && (
                                <small>
                                    No subcategories found. Please add one
                                    from Dashboard → Categories.
                                </small>
                            )}
                    </div>

                    {/* DESCRIPTION */}

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

                    {/* WEIGHT PRICING */}

                    <div className="form-group full-width">
                        <h3>Weight & Pricing</h3>

                        <label>Measurement Unit</label>

                        <select
                            value={weightUnit}
                            onChange={(e) => {
                                setWeightUnit(e.target.value);
                                setCustomWeight("");
                            }}
                        >
                            <option value="ml">
                                Millilitre (ML)
                            </option>

                            <option value="g">
                                Gram (GM)
                            </option>
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

                        <label>
                            Available Weight Options
                        </label>

                        <div className="weight-options">
                            {weightOptions.map((weight) => (
                                <div
                                    className="weight-option"
                                    key={weight}
                                >
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
                                onChange={(e) =>
                                    setCustomWeight(e.target.value)
                                }
                            />

                            <button
                                type="button"
                                onClick={handleAddWeight}
                            >
                                + Add Weight
                            </button>
                        </div>
                    </div>

                    {/* RATING */}

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

                    {/* ADD-ONS */}

                    <div className="form-group full-width">
                        <h3>Product Add-ons</h3>

                        <p>
                            Add optional extras for customers.
                        </p>

                        <div className="addon-input-row">
                            <input
                                type="text"
                                placeholder="Add-on name (e.g. Sprinkles)"
                                value={addonName}
                                onChange={(e) =>
                                    setAddonName(e.target.value)
                                }
                            />

                            <input
                                type="number"
                                placeholder="Price ₹"
                                min="0"
                                step="0.01"
                                value={addonPrice}
                                onChange={(e) =>
                                    setAddonPrice(e.target.value)
                                }
                            />

                            <button
                                type="button"
                                onClick={handleAddAddon}
                            >
                                + Add
                            </button>
                        </div>

                        <div className="addon-list">
                            {addons.map((addon) => (
                                <div
                                    className="addon-item"
                                    key={addon.id}
                                >
                                    <span>{addon.name}</span>

                                    <strong>
                                        ₹{addon.price.toFixed(2)}
                                    </strong>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleRemoveAddon(addon.id)
                                        }
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

                    {/* PRICE PREVIEW */}

                    <div className="form-group full-width">
                        <h3>Weight Price Preview</h3>

                        {weightOptions.map((weight) => (
                            <div
                                className="price-preview-row"
                                key={weight}
                            >
                                <span>
                                    {weight} {weightUnit}
                                </span>

                                <strong>
                                    ₹{calculateTotalPrice(weight).toFixed(2)}
                                </strong>
                            </div>
                        ))}

                        <small>
                            Add-on prices will be added when customers
                            select them.
                        </small>
                    </div>

                </div>

                {/* ERROR MESSAGE */}

                {error && (
                    <p className="form-error">
                        {error}
                    </p>
                )}

                {/* SAVE BUTTON */}

                <div className="form-actions">
                    <button
                        type="submit"
                        className="primary-btn"
                    >
                        + Save Product
                    </button>
                </div>

            </form>

            {/* IMAGE PREVIEW */}

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
