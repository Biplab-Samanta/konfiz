
import React, { useMemo, useState } from "react";
import "../../style/add_product.css";
import { addProduct } from "../../data/products/productStore";



const DEFAULT_WEIGHTS = [100, 250, 500, 1000];

const initialForm = {
    name: "",
    sku: "",
    category: "",
    description: "",
    shortDescription: "",
    price: "",
    rating: "4.5",
    flavour: "",
    ingredients: "",
    allergens: "",
    storageInstructions: "Keep frozen at -18°C or below.",
    shelfLife: "",
    servingSuggestion: "",
    stock: "0"
};

function AddProduct({ onAddProduct, onCancel, categories = [] }) {
    const [formData, setFormData] = useState(initialForm);

    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    const [selectedSubcategoryId, setSelectedSubcategoryId] = useState("");

    const [error, setError] = useState("");

    // PACK SIZE CONFIGURATION
    const [weightUnit, setWeightUnit] = useState("ml");
    const [weightOptions, setWeightOptions] = useState(DEFAULT_WEIGHTS);
    const [customWeight, setCustomWeight] = useState("");

    // OPTIONAL ADD-ONS
    const [enableAddons, setEnableAddons] = useState(false);
    const [addons, setAddons] = useState([]);
    const [addonName, setAddonName] = useState("");
    const [addonPrice, setAddonPrice] = useState("");

    // PRODUCT IMAGES
    const [mainImage, setMainImage] = useState("");
    const [galleryImages, setGalleryImages] = useState([]);

    // =====================================
    // CATEGORY HELPERS
    // =====================================

    const getCategoryId = (category) => {
        if (typeof category === "string") return category;

        return String(
            category?.id ??
            category?._id ??
            category?.categoryId ??
            ""
        );
    };

    const getCategoryName = (category) => {
        if (typeof category === "string") return category;

        return category?.name || category?.categoryName || "";
    };

    const getSubcategoryId = (subcategory) => {
        if (typeof subcategory === "string") return subcategory;

        return String(
            subcategory?.id ??
            subcategory?._id ??
            subcategory?.subcategoryId ??
            ""
        );
    };

    const getSubcategoryName = (subcategory) => {
        if (typeof subcategory === "string") return subcategory;

        return (
            subcategory?.name ||
            subcategory?.subcategoryName ||
            ""
        );
    };

    const availableCategories = useMemo(() => {
        return categories
            .map((category) => ({
                id: getCategoryId(category),
                name: getCategoryName(category),
                original: category
            }))
            .filter((category) => category.id && category.name.trim());
    }, [categories]);

    const selectedCategory = availableCategories.find(
        (category) => category.id === selectedCategoryId
    );

    const availableSubcategories = useMemo(() => {
        if (!selectedCategory || typeof selectedCategory.original === "string") {
            return [];
        }

        return (selectedCategory.original.subcategories || [])
            .map((subcategory) => ({
                id: getSubcategoryId(subcategory),
                name: getSubcategoryName(subcategory)
            }))
            .filter((subcategory) => subcategory.id && subcategory.name.trim());
    }, [selectedCategory]);

    const selectedSubcategory = availableSubcategories.find(
        (subcategory) => subcategory.id === selectedSubcategoryId
    );

    // =====================================
    // GENERAL FORM HANDLERS
    // =====================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        setError("");
    };

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

    const handleSubcategoryChange = (e) => {
        setSelectedSubcategoryId(e.target.value);
        setError("");
    };

    // =====================================
    // PACK SIZE HANDLERS
    // =====================================

    const handleAddWeight = () => {
        const weight = Number(customWeight);

        if (!Number.isFinite(weight) || weight <= 0) {
            setError("Enter a valid pack size.");
            return;
        }

        if (weightOptions.includes(weight)) {
            setError("This pack size already exists.");
            return;
        }

        setWeightOptions((prev) =>
            [...prev, weight].sort((a, b) => a - b)
        );

        setCustomWeight("");
        setError("");
    };

    const handleRemoveWeight = (weight) => {
        setWeightOptions((prev) =>
            prev.filter((item) => item !== weight)
        );

        setError("");
    };

    const calculateWeightPrice = (weight) => {
        return (
            (Number(formData.price || 0) * Number(weight)) / 100
        );
    };

    // =====================================
    // ADD-ON HANDLERS
    // =====================================

    const handleAddAddon = () => {
        if (!addonName.trim() || addonPrice === "") {
            setError("Enter the add-on name and price.");
            return;
        }

        if (!Number.isFinite(Number(addonPrice)) || Number(addonPrice) < 0) {
            setError("Enter a valid add-on price.");
            return;
        }

        const duplicate = addons.some(
            (addon) =>
                addon.name.toLowerCase() === addonName.trim().toLowerCase()
        );

        if (duplicate) {
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

    const handleRemoveAddon = (id) => {
        setAddons((prev) => prev.filter((addon) => addon.id !== id));
    };

    // =====================================
    // IMAGE HANDLERS
    // =====================================

    const readImage = (file) => {
        return new Promise((resolve, reject) => {
            if (!file || !file.type.startsWith("image/")) {
                reject(new Error("Please select a valid image."));
                return;
            }

            const reader = new FileReader();

            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(
                new Error("Unable to read the selected image.")
            );

            reader.readAsDataURL(file);
        });
    };

    const handleMainImageChange = async (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        try {
            const image = await readImage(file);
            setMainImage(image);
            setError("");
        } catch (imageError) {
            setError(imageError.message);
        }

        e.target.value = "";
    };

    const handleGalleryImagesChange = async (e) => {
        const files = Array.from(e.target.files || []);

        if (!files.length) return;

        const remaining = 4 - galleryImages.length;

        if (files.length > remaining) {
            setError(`You can add only ${remaining} more gallery image(s).`);
            e.target.value = "";
            return;
        }

        try {
            const images = await Promise.all(files.map(readImage));

            setGalleryImages((prev) => [...prev, ...images]);
            setError("");
        } catch (imageError) {
            setError(imageError.message);
        }

        e.target.value = "";
    };

    const removeGalleryImage = (index) => {
        setGalleryImages((prev) =>
            prev.filter((_, imageIndex) => imageIndex !== index)
        );
    };

    // =====================================
    // RESET FORM
    // =====================================

    const resetForm = () => {
        setFormData(initialForm);

        setSelectedCategoryId("");
        setSelectedSubcategoryId("");

        setWeightUnit("ml");
        setWeightOptions(DEFAULT_WEIGHTS);
        setCustomWeight("");

        setEnableAddons(false);
        setAddons([]);
        setAddonName("");
        setAddonPrice("");

        setMainImage("");
        setGalleryImages([]);

        setError("");
    };

    // =====================================
    // SUBMIT PRODUCT
    // =====================================


const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // BASIC VALIDATION
    if (!formData.name.trim()) {
        setError("Please enter the product name.");
        return;
    }

    if (!selectedCategory) {
        setError("Please select a valid main category.");
        return;
    }

    if (!selectedSubcategory) {
        setError("Please select a valid subcategory.");
        return;
    }

    if (!formData.description.trim()) {
        setError("Please enter the product description.");
        return;
    }

    if (!formData.flavour.trim()) {
        setError("Please enter the ice cream flavour.");
        return;
    }

    if (!formData.ingredients.trim()) {
        setError("Please enter the ingredients.");
        return;
    }

    if (!formData.price || Number(formData.price) <= 0) {
        setError("Enter a valid price per 100 units.");
        return;
    }

    if (!mainImage) {
        setError("Please upload the main product image.");
        return;
    }

    if (weightOptions.length === 0) {
        setError("Select at least one pack size.");
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

    if (
        !Number.isFinite(Number(formData.stock)) ||
        Number(formData.stock) < 0
    ) {
        setError("Enter a valid stock quantity.");
        return;
    }

    // =====================================
    // CREATE STRUCTURED PRODUCT OBJECT
    // =====================================

    const newProduct = {

        id: `KON-PROD-${Date.now()}`,

        // BASIC INFORMATION
        name: formData.name.trim(),
        sku: formData.sku.trim(),

        categoryId: selectedCategoryId,
        category: selectedCategory.name,

        subcategoryId: selectedSubcategoryId,
        subcategory: selectedSubcategory.name,
        subcategoryName: selectedSubcategory.name,

        // DESCRIPTION
        description: formData.description.trim(),
        shortDescription: formData.shortDescription.trim(),

        // ICE CREAM INFORMATION
        flavour: formData.flavour.trim(),
        ingredients: formData.ingredients.trim(),
        allergens: formData.allergens.trim(),
        storageInstructions: formData.storageInstructions.trim(),
        shelfLife: formData.shelfLife.trim(),
        servingSuggestion: formData.servingSuggestion.trim(),

        // PRICING
        price: Number(formData.price),
        unit: weightUnit,

        pricing: {
            unit: weightUnit,
            baseQuantity: 100,
            pricePerBaseUnit: Number(formData.price)
        },

        // CUSTOMER SELECTABLE SIZES
        weightOptions: [...weightOptions],

        sizes: weightOptions.map((weight, index) => ({
            id: index + 1,
            weight: weight,
            unit: weightUnit,
            price: Number(
                calculateWeightPrice(weight).toFixed(2)
            )
        })),

        // PRODUCT IMAGES
        image: mainImage,
        images: [
            mainImage,
            ...galleryImages
        ],

        // ADD-ONS
        hasAddons: enableAddons,

        addons: enableAddons
            ? addons.map(addon => ({
                ...addon,
                active: true
            }))
            : [],

        // INVENTORY
        stock: Number(formData.stock),
        inStock: Number(formData.stock) > 0,
        available: Number(formData.stock) > 0,

        // PRODUCT STATUS
        status: "active",
        featured: false,

        // RATINGS
        rating: Number(formData.rating),

        // DATES
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    // =====================================
    // SAVE TO CENTRAL PRODUCT STORE
    // =====================================

    try {

        const savedProduct = addProduct(newProduct);

        if (!savedProduct) {
            setError(
                "Unable to save product. Please check your storage."
            );
            return;
        }

        console.log(
            "KONFiZ Product Saved Successfully:",
            savedProduct
        );

        alert(
            `${savedProduct.name} added successfully!`
        );

        // OPTIONAL PARENT NOTIFICATION
        // Do not save the product again in the parent.
        if (typeof onAddProduct === "function") {
            onAddProduct(savedProduct);
        }

        resetForm();

    } catch (saveError) {

        console.error("Product saving error:", saveError);

        setError(
            "Something went wrong while saving the product."
        );
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
                    <p>Create a complete product listing for your KONFiZ store.</p>
                </div>

                <button type="button" onClick={onCancel} className="secondary-btn">
                    Cancel
                </button>
            </div>

            <form className="product-form" onSubmit={handleSubmit}>

                {/* BASIC INFORMATION */}

                <section className="product-form-section">
                    <h3>Basic Product Information</h3>
                    <p className="section-description">
                        Enter the basic information customers will see in your store.
                    </p>

                    <div className="form-grid">

                        <div className="form-group">
                            <label>Product Name *</label>
                            <input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g. Belgian Chocolate Ice Cream"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Product SKU</label>
                            <input
                                name="sku"
                                value={formData.sku}
                                onChange={handleChange}
                                placeholder="e.g. KON-CHO-001"
                            />
                        </div>

                        <div className="form-group">
                            <label>Main Category *</label>
                            <select
                                value={selectedCategoryId}
                                onChange={handleCategoryChange}
                                required
                            >
                                <option value="">-- Select Category --</option>
                                {availableCategories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Subcategory *</label>
                            <select
                                value={selectedSubcategoryId}
                                onChange={handleSubcategoryChange}
                                disabled={!selectedCategoryId || availableSubcategories.length === 0}
                                required
                            >
                                <option value="">-- Select Subcategory --</option>
                                {availableSubcategories.map((subcategory) => (
                                    <option key={subcategory.id} value={subcategory.id}>
                                        {subcategory.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Flavour *</label>
                            <input
                                name="flavour"
                                value={formData.flavour}
                                onChange={handleChange}
                                placeholder="e.g. Belgian Dark Chocolate"
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
                            <small>For a new product, 0 is also acceptable.</small>
                        </div>

                    </div>
                </section>

                {/* PRODUCT IMAGES */}

                <section className="product-form-section">
                    <h3>Product Images</h3>
                    <p className="section-description">
                        Upload one main image and up to four additional product images.
                    </p>

                    <div className="form-grid">

                        <div className="form-group full-width">
                            <label>Main Product Image *</label>
                            <input
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                onChange={handleMainImageChange}
                            />
                            <small>
                                This image will be used as the main product image in product cards.
                            </small>

                            {mainImage && (
                                <div className="product-image-preview main-image-preview">
                                    <img src={mainImage} alt="Main product" />
                                    <span>Main Image</span>
                                    <button
                                        type="button"
                                        onClick={() => setMainImage("")}
                                    >
                                        Remove
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="form-group full-width">
                            <label>Additional Images (Maximum 4)</label>
                            <input
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                multiple
                                disabled={galleryImages.length >= 4}
                                onChange={handleGalleryImagesChange}
                            />
                            <small>
                                Add product close-ups, texture, packaging, and serving images.
                                {` ${galleryImages.length}/4 uploaded.`}
                            </small>

                            <div className="product-gallery-preview">
                                {galleryImages.map((image, index) => (
                                    <div className="product-image-preview" key={index}>
                                        <img src={image} alt={`Product view ${index + 1}`} />
                                        <button
                                            type="button"
                                            onClick={() => removeGalleryImage(index)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </section>

                {/* PROFESSIONAL DESCRIPTION */}

                <section className="product-form-section">
                    <h3>Product Description & Ice Cream Details</h3>
                    <p className="section-description">
                        Provide accurate product information to help customers understand
                        the flavour, ingredients, and storage requirements.
                    </p>

                    <div className="form-grid">

                        <div className="form-group full-width">
                            <label>Short Description</label>
                            <textarea
                                name="shortDescription"
                                rows="2"
                                maxLength="180"
                                value={formData.shortDescription}
                                onChange={handleChange}
                                placeholder="A rich and creamy chocolate ice cream made for chocolate lovers."
                            />
                            <small>Short text for product cards. Maximum 180 characters.</small>
                        </div>

                        <div className="form-group full-width">
                            <label>Professional Product Description *</label>
                            <textarea
                                name="description"
                                rows="5"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe the ice cream's taste, texture, aroma, ingredients, and what makes it special..."
                                required
                            />
                        </div>

                        <div className="form-group full-width">
                            <label>Ingredients *</label>
                            <textarea
                                name="ingredients"
                                rows="3"
                                value={formData.ingredients}
                                onChange={handleChange}
                                placeholder="Enter ingredients in descending order of quantity, as applicable."
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Allergen Information</label>
                            <textarea
                                name="allergens"
                                rows="3"
                                value={formData.allergens}
                                onChange={handleChange}
                                placeholder="e.g. Contains milk. May contain nuts, soy..."
                            />
                        </div>

                        <div className="form-group">
                            <label>Storage Instructions</label>
                            <textarea
                                name="storageInstructions"
                                rows="3"
                                value={formData.storageInstructions}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Shelf Life</label>
                            <input
                                name="shelfLife"
                                value={formData.shelfLife}
                                onChange={handleChange}
                                placeholder="e.g. 6 months from manufacturing"
                            />
                        </div>

                        <div className="form-group">
                            <label>Serving Suggestion</label>
                            <input
                                name="servingSuggestion"
                                value={formData.servingSuggestion}
                                onChange={handleChange}
                                placeholder="e.g. Serve chilled at -18°C"
                            />
                        </div>

                    </div>
                </section>

                {/* PACK SIZE AND PRICING */}

                <section className="product-form-section">
                    <h3>Pack Size & Pricing</h3>
                    <p className="section-description">
                        Select only the pack sizes that customers are allowed to purchase.
                        Unselected sizes will not be available on the customer Product page.
                    </p>

                    <div className="form-grid">

                        <div className="form-group">
                            <label>Measurement Unit *</label>
                            <select
                                value={weightUnit}
                                onChange={(e) => {
                                    setWeightUnit(e.target.value);
                                    setCustomWeight("");
                                }}
                            >
                                <option value="ml">Millilitre (ml)</option>
                                <option value="g">Gram (g)</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Price per 100 {weightUnit} (₹) *</label>
                            <input
                                type="number"
                                name="price"
                                min="0.01"
                                step="0.01"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="e.g. 60"
                                required
                            />
                        </div>

                        <div className="form-group full-width">
                            <label>Available Pack Sizes *</label>

                            <div className="pack-size-admin-list">
                                {weightOptions.map((weight) => (
                                    <div className="pack-size-admin-item" key={weight}>
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked
                                                onChange={() => handleRemoveWeight(weight)}
                                            />
                                            <span>{weight} {weightUnit}</span>
                                        </label>

                                        <strong>
                                            ₹{calculateWeightPrice(weight).toFixed(2)}
                                        </strong>

                                        <button
                                            type="button"
                                            onClick={() => handleRemoveWeight(weight)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="add-weight-row">
                                <input
                                    type="number"
                                    min="1"
                                    value={customWeight}
                                    onChange={(e) => setCustomWeight(e.target.value)}
                                    placeholder={`Enter custom size in ${weightUnit}`}
                                />
                                <button type="button" onClick={handleAddWeight}>
                                    + Add Pack Size
                                </button>
                            </div>

                            {weightOptions.length === 0 && (
                                <small className="form-error">
                                    Select at least one pack size before saving.
                                </small>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Available Stock</label>
                            <input
                                type="number"
                                name="stock"
                                min="0"
                                step="1"
                                value={formData.stock}
                                onChange={handleChange}
                            />
                        </div>

                    </div>

                    <div className="pack-price-preview">
                        <h4>Customer Pack Price Preview</h4>
                        {weightOptions.map((weight) => (
                            <div key={weight}>
                                <span>{weight} {weightUnit}</span>
                                <strong>₹{calculateWeightPrice(weight).toFixed(2)}</strong>
                            </div>
                        ))}
                    </div>
                </section>

                {/* OPTIONAL ADD-ONS */}

                <section className="product-form-section">
                    <div className="addon-section-heading">
                        <div>
                            <h3>Optional Product Add-ons</h3>
                            <p className="section-description">
                                Add extras only when this product supports customization.
                            </p>
                        </div>

                        <label className="addon-toggle">
                            <input
                                type="checkbox"
                                checked={enableAddons}
                                onChange={(e) => {
                                    setEnableAddons(e.target.checked);
                                    if (!e.target.checked) setError("");
                                }}
                            />
                            <span>Enable add-ons</span>
                        </label>
                    </div>

                    {enableAddons ? (
                        <>
                            <div className="addon-input-row">
                                <input
                                    value={addonName}
                                    onChange={(e) => setAddonName(e.target.value)}
                                    placeholder="e.g. Chocolate chips"
                                />

                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={addonPrice}
                                    onChange={(e) => setAddonPrice(e.target.value)}
                                    placeholder="Price ₹"
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
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {addons.length === 0 && (
                                <small>
                                    Add-ons are enabled, but no extras have been added yet.
                                </small>
                            )}
                        </>
                    ) : (
                        <p className="addon-disabled-note">
                            Add-ons are disabled for this product. Customers will not see
                            an add-ons selection.
                        </p>
                    )}
                </section>

                {/* ERROR */}

                {error && (
                    <p className="form-error" role="alert">
                        {error}
                    </p>
                )}

                {/* ACTIONS */}

                <div className="form-actions">
                    <button type="button" className="secondary-btn" onClick={resetForm}>
                        Reset Form
                    </button>

                    <button type="submit" className="primary-btn">
                        + Save Product
                    </button>
                </div>

            </form>
        </div>
    );
}

export default AddProduct;
