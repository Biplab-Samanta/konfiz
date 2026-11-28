
import React, { useMemo, useState } from "react";
import "../../style/add_product.css";
// import { addProduct } from "../../data/products/productStore";

const DEFAULT_WEIGHTS = [100, 250, 500, 1000];

const initialForm = {
    name: "",
    sku: "",
    description: "",
    flavour: "",
    servingSuggestion: "",
    stock: "0",
    rating: "0"
};

function AddProduct({ onAddProduct, onCancel, categories = [] }) {
    const [formData, setFormData] = useState(initialForm);

    // CATEGORY AND SUBCATEGORY
    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState([]);

    // PACK SIZE
    const [weightUnit, setWeightUnit] = useState("ml");
    const [weightOptions, setWeightOptions] = useState(DEFAULT_WEIGHTS);
    const [customWeight, setCustomWeight] = useState("");

    // INDIVIDUAL PACK PRICING
    const [weightPrices, setWeightPrices] = useState(() =>
        DEFAULT_WEIGHTS.reduce((acc, weight) => {
            acc[weight] = {
                price: "",
                offerPrice: ""
            };
            return acc;
        }, {})
    );

    // PREMIUM
    const [isPremium, setIsPremium] = useState(false);

    // ADD-ONS
    const [enableAddons, setEnableAddons] = useState(false);
    const [addons, setAddons] = useState([]);
    const [addonName, setAddonName] = useState("");
    const [addonPrice, setAddonPrice] = useState("");

    // IMAGES
    const [mainImage, setMainImage] = useState("");
    const [galleryImages, setGalleryImages] = useState([]);

    const [error, setError] = useState("");

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
            .filter(
                (category) =>
                    category.id &&
                    category.name.trim()
            );
    }, [categories]);

    const selectedCategory = availableCategories.find(
        (category) => category.id === selectedCategoryId
    );

    const availableSubcategories = useMemo(() => {
        if (
            !selectedCategory ||
            typeof selectedCategory.original === "string"
        ) {
            return [];
        }

        return (
            selectedCategory.original.subcategories || []
        )
            .map((subcategory) => ({
                id: getSubcategoryId(subcategory),
                name: getSubcategoryName(subcategory)
            }))
            .filter(
                (subcategory) =>
                    subcategory.id &&
                    subcategory.name.trim()
            );
    }, [selectedCategory]);

    // const validSubcategories = availableSubcategories.filter(
    //     (subcategory) =>
    //         selectedSubcategoryIds.includes(subcategory.id)
    // );

    // =====================================
    // GENERAL HANDLERS
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

        setSelectedCategoryId(categoryId);
        setSelectedSubcategoryIds([]);
        setError("");
    };

    const handleSubcategoryChange = (subcategoryId) => {
        setSelectedSubcategoryIds((prev) => {
            if (prev.includes(subcategoryId)) {
                return prev.filter(
                    (id) => id !== subcategoryId
                );
            }

            if (prev.length >= 2) {
                return prev;
            }

            return [...prev, subcategoryId];
        });

        setError("");
    };

    // =====================================
    // RATING HANDLER
    // =====================================

    const handleRatingChange = (e) => {
        const value = e.target.value;

        if (value === "") {
            setFormData((prev) => ({
                ...prev,
                rating: ""
            }));
            return;
        }

        const rating = Number(value);

        if (
            Number.isFinite(rating) &&
            rating >= 0 &&
            rating <= 5
        ) {
            setFormData((prev) => ({
                ...prev,
                rating: value
            }));
        }

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

        setWeightPrices((prev) => ({
            ...prev,
            [weight]: {
                price: "",
                offerPrice: ""
            }
        }));

        setCustomWeight("");
        setError("");
    };

    const handleRemoveWeight = (weight) => {
        setWeightOptions((prev) =>
            prev.filter((item) => item !== weight)
        );

        setWeightPrices((prev) => {
            const updated = { ...prev };
            delete updated[weight];
            return updated;
        });

        setError("");
    };

    const handleWeightPriceChange = (weight, field, value) => {
        setWeightPrices((prev) => ({
            ...prev,
            [weight]: {
                ...prev[weight],
                [field]: value
            }
        }));

        setError("");
    };

    // =====================================
    // ADD-ON HANDLERS
    // =====================================

    const handleAddAddon = () => {
        if (!addonName.trim() || addonPrice === "") {
            setError("Enter the add-on name and price.");
            return;
        }

        const price = Number(addonPrice);

        if (!Number.isFinite(price) || price < 0) {
            setError("Enter a valid add-on price.");
            return;
        }

        const duplicate = addons.some(
            (addon) =>
                addon.name.toLowerCase() ===
                addonName.trim().toLowerCase()
        );

        if (duplicate) {
            setError("This add-on already exists.");
            return;
        }

        setAddons((prev) => [
            ...prev,
            {
                id: `ADD-${Date.now()}-${Math.random()
                    .toString(36)
                    .slice(2, 7)}`,
                name: addonName.trim(),
                price,
                active: true
            }
        ]);

        setAddonName("");
        setAddonPrice("");
        setError("");
    };

    const handleRemoveAddon = (id) => {
        setAddons((prev) =>
            prev.filter((addon) => addon.id !== id)
        );
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

            const image = new Image();
            const objectUrl = URL.createObjectURL(file);

            image.onload = () => {
                try {
                    const canvas = document.createElement("canvas");

                    const MAX_WIDTH = 1200;
                    const MAX_HEIGHT = 1200;

                    let width = image.width;
                    let height = image.height;

                    const scale = Math.min(
                        MAX_WIDTH / width,
                        MAX_HEIGHT / height,
                        1
                    );

                    width = Math.round(width * scale);
                    height = Math.round(height * scale);

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext("2d");

                    ctx.drawImage(image, 0, 0, width, height);

                    const compressedImage = canvas.toDataURL(
                        "image/webp",
                        0.75
                    );

                    URL.revokeObjectURL(objectUrl);

                    resolve(compressedImage);

                } catch (error) {
                    URL.revokeObjectURL(objectUrl);
                    reject(error);
                }
            };

            image.onerror = () => {
                URL.revokeObjectURL(objectUrl);
                reject(new Error("Unable to process image."));
            };

            image.src = objectUrl;
        });
    };


    const handleMainImageChange = async (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        try {
            const image = await readImage(file);
            setMainImage(image);
            setError("");
        } catch (err) {
            setError(err.message);
        }

        e.target.value = "";
    };

    const handleGalleryImagesChange = async (e) => {
        const files = Array.from(e.target.files || []);

        if (!files.length) return;

        const remaining = 4 - galleryImages.length;

        if (files.length > remaining) {
            setError(
                `You can add only ${remaining} more gallery image(s).`
            );

            e.target.value = "";
            return;
        }

        try {
            const images = await Promise.all(
                files.map(readImage)
            );

            setGalleryImages((prev) => [
                ...prev,
                ...images
            ]);

            setError("");
        } catch (err) {
            setError(err.message);
        }

        e.target.value = "";
    };

    const removeGalleryImage = (index) => {
        setGalleryImages((prev) =>
            prev.filter((_, i) => i !== index)
        );
    };

    // =====================================
    // RESET FORM
    // =====================================

    const resetForm = () => {
        setFormData({ ...initialForm });

        setSelectedCategoryId("");
        setSelectedSubcategoryIds([]);

        setWeightUnit("ml");
        setWeightOptions([...DEFAULT_WEIGHTS]);
        setCustomWeight("");

        setWeightPrices(
            DEFAULT_WEIGHTS.reduce((acc, weight) => {
                acc[weight] = {
                    price: "",
                    offerPrice: ""
                };
                return acc;
            }, {})
        );

        setIsPremium(false);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // BASIC VALIDATION

        if (!formData.name.trim()) {
            setError("Please enter the product name.");
            return;
        }

        if (!formData.description.trim()) {
            setError("Please enter the product description.");
            return;
        }

        if (!selectedCategory) {
            setError("Please select a category.");
            return;
        }

        if (!formData.flavour.trim()) {
            setError("Please enter at least one flavour.");
            return;
        }

        if (!mainImage) {
            setError("Please upload the main product image.");
            return;
        }
        if (!formData.sku.trim()) {
            setError("Please enter the product SKU.");
            return;
        }

        //     const duplicateSKU = (() => {
        //         const existing = JSON.parse(
        //             localStorage.getItem("konfizProducts") || "[]"
        //         );

        //         return existing.some(
        //             product =>
        //                 String(product.sku || "").toLowerCase() ===
        //                 formData.sku.trim().toLowerCase()
        //         );
        //     }
        // )();

        //     if (duplicateSKU) {
        //         setError("This SKU already exists.");
        //         return;
        //     }
        // RATING VALIDATION

        const rating = Number(formData.rating);

        if (
            formData.rating === "" ||
            !Number.isFinite(rating) ||
            rating < 0 ||
            rating > 5
        ) {
            setError(
                "Product rating must be between 0 and 5."
            );
            return;
        }

        if (weightOptions.length === 0) {
            setError("Add at least one pack size.");
            return;
        }

        // VALIDATE EVERY PACK SIZE

        for (const weight of weightOptions) {
            const pricing = weightPrices[weight];

            const price = Number(pricing?.price);
            const offerPrice = Number(pricing?.offerPrice);

            if (
                pricing?.price === "" ||
                !Number.isFinite(price) ||
                price <= 0
            ) {
                setError(
                    `Enter a valid regular price for ${weight} ${weightUnit}.`
                );
                return;
            }

            if (
                pricing?.offerPrice === "" ||
                !Number.isFinite(offerPrice) ||
                offerPrice <= 0
            ) {
                setError(
                    `Enter a valid offer price for ${weight} ${weightUnit}.`
                );
                return;
            }

            if (offerPrice > price) {
                setError(
                    `Offer price cannot exceed regular price for ${weight} ${weightUnit}.`
                );
                return;
            }
        }

        // STOCK VALIDATION

        const stock = Number(formData.stock);

        if (
            formData.stock === "" ||
            !Number.isInteger(stock) ||
            stock < 0
        ) {
            setError(
                "Enter a valid available stock quantity."
            );
            return;
        }

        // STRUCTURED PACK PRICING

        const sizes = weightOptions.map((weight, index) => ({
            id: index + 1,
            weight,
            unit: weightUnit,
            price: Number(weightPrices[weight].price),
            offerPrice: Number(
                weightPrices[weight].offerPrice
            )
        }));

        // FLAVOURS

        const flavours = formData.flavour
            .split(",")
            .map((flavour) => flavour.trim())
            .filter(Boolean);

        if (flavours.length === 0) {
            setError("Please enter valid flavours.");
            return;
        }

        // SUBCATEGORIES

        const validSubcategories = availableSubcategories.filter(
            (subcategory) =>
                selectedSubcategoryIds.includes(subcategory.id)
        );

        // PRODUCT OBJECT

        const newProduct = {
            id: `KON-PROD-${Date.now()}`,

            // BASIC INFORMATION
            name: formData.name.trim(),
            sku: formData.sku.trim().toUpperCase(),
            description: formData.description.trim(),

            rating: Number(formData.rating),

            categoryId: selectedCategoryId,
            category: selectedCategory.name,

            // MULTIPLE SUBCATEGORIES
            subcategoryIds: validSubcategories.map(
                (subcategory) => subcategory.id
            ),

            subcategories: validSubcategories.map(
                (subcategory) => subcategory.name
            ),

            // BACKWARD COMPATIBILITY
            subcategoryId:
                validSubcategories[0]?.id || "",

            subcategory:
                validSubcategories[0]?.name || "",

            subcategoryName:
                validSubcategories[0]?.name || "",

            // FLAVOURS
            flavour: flavours.join(", "),
            flavours,

            // PREMIUM TAG
            isPremium,
            premium: isPremium,
            featured: isPremium,

            // UNIT AND PRICING
            unit: weightUnit,
            weightOptions: [...weightOptions],
            sizes,

            // LEGACY BASE PRICE FIELDS
            price: sizes[0].price,
            offerPrice: sizes[0].offerPrice,

            pricing: {
                unit: weightUnit,
                sizes
            },

            // IMAGES
            image: mainImage,

            images: [
                mainImage,
                ...galleryImages
            ],

            // ADD-ONS
            hasAddons: enableAddons,

            addons: enableAddons
                ? addons.map((addon) => ({
                    ...addon,
                    active: true
                }))
                : [],

            // INVENTORY
            stock,
            inStock: stock > 0,
            available: stock > 0,

            // SERVING SUGGESTION
            servingSuggestion:
                formData.servingSuggestion.trim(),

            // STATUS
            status: "active",

            // DATES
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // SAVE PRODUCT

        //     try {
        //         const savedProduct = addProduct(newProduct);

        //         if (!savedProduct) {
        //             setError(
        //                 "Product could not be saved. Storage may be full. Please check the browser console."
        //             );
        //             return;
        //         }

        //         alert(
        //             `${savedProduct.name} added successfully!`
        //         );

        //         if (typeof onAddProduct === "function") {
        //             onAddProduct(savedProduct);
        //         }

        //         resetForm();

        //     } catch (saveError) {
        //         console.error(
        //             "Product saving error:",
        //             saveError
        //         );

        //         setError(
        //             "Something went wrong while saving the product."
        //         );
        //     }
        // };


        // SAVE PRODUCT TO MONGODB

        try {
            const response = await fetch(
                "http://localhost:5000/api/products",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(newProduct)
                }
            );

            const result = await response.json();

            if (!response.ok) {
                setError(result.message || "Unable to save product.");
                return;
            }

            const savedProduct = result.product;

            alert(`${savedProduct.name} added successfully!`);

            if (typeof onAddProduct === "function") {
                onAddProduct(savedProduct);
            }

            resetForm();

        } catch (saveError) {
            console.error("Product saving error:", saveError);

            setError(
                "Unable to connect to the server. Please check your backend."
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
                    <p>
                        Create a complete product listing for your KONFiZ store.
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

                {/* BASIC INFORMATION */}

                <section className="product-form-section">
                    <h3>Basic Product Information</h3>

                    <div className="form-grid">

                        <div className="form-group full-width">
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
                            <label>Product SKU *</label>
                            <input
                                name="sku"
                                value={formData.sku}
                                onChange={handleChange}
                                placeholder="e.g. KON-BIS-001"
                                required
                            />
                            <small>Enter a unique product SKU.</small>
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
                                    -- Select Category --
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
                        </div>

                        {/* MULTIPLE SUBCATEGORIES */}

                        <div className="form-group">
                            <label>
                                Subcategories (Optional – Select up to 2)
                            </label>

                            <div className="subcategory-checkbox-list">

                                {availableSubcategories.length > 0 ? (
                                    availableSubcategories.map(
                                        (subcategory) => (
                                            <label
                                                key={subcategory.id}
                                                className="subcategory-checkbox-item"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedSubcategoryIds.includes(
                                                        subcategory.id
                                                    )}
                                                    disabled={
                                                        !selectedSubcategoryIds.includes(
                                                            subcategory.id
                                                        ) &&
                                                        selectedSubcategoryIds.length >= 2
                                                    }
                                                    onChange={() =>
                                                        handleSubcategoryChange(
                                                            subcategory.id
                                                        )
                                                    }
                                                />

                                                <span>
                                                    {subcategory.name}
                                                </span>
                                            </label>
                                        )
                                    )
                                ) : (
                                    <small>
                                        Select a category first to see subcategories.
                                    </small>
                                )}

                            </div>

                            <small>
                                Selected: {selectedSubcategoryIds.length}/2
                            </small>
                        </div>

                        {/* FLAVOURS */}

                        <div className="form-group full-width">
                            <label>Flavours *</label>

                            <input
                                name="flavour"
                                value={formData.flavour}
                                onChange={handleChange}
                                placeholder="Belgian Chocolate, Dark Chocolate, Vanilla"
                                required
                            />

                            <small>
                                Enter multiple flavours separated by commas.
                            </small>
                        </div>

                        {/* PREMIUM */}

                        <div className="form-group full-width">
                            <label className="addon-toggle">
                                <input
                                    type="checkbox"
                                    checked={isPremium}
                                    onChange={(e) =>
                                        setIsPremium(e.target.checked)
                                    }
                                />

                                <span>Premium Product</span>
                            </label>

                            <small>
                                Premium products will have a premium tag.
                            </small>
                        </div>

                    </div>
                </section>

                {/* DESCRIPTION */}

                <section className="product-form-section">
                    <h3>Product Description</h3>

                    <p className="section-description">
                        Add all product information in one description area,
                        including ingredients, allergens, storage instructions
                        and shelf life.
                    </p>

                    <div className="form-grid">

                        <div className="form-group full-width">
                            <label>Complete Product Description *</label>

                            <textarea
                                name="description"
                                rows="9"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder={`Enter complete product information.

Short Description:
A rich and creamy Belgian chocolate ice cream.

Ingredients:
Milk, cream, sugar and cocoa powder.

Allergen Information:
Contains milk. May contain nuts.

Storage Instructions:
Keep frozen at -18°C or below.

Shelf Life:
6 months from manufacturing.`}
                                required
                            />
                        </div>

                        {/* RATING */}

                        <div className="form-group">
                            <label htmlFor="rating">
                                Product Rating (0–5)
                            </label>

                            <input
                                id="rating"
                                type="number"
                                name="rating"
                                min="0"
                                max="5"
                                step="0.1"
                                value={formData.rating}
                                onChange={handleRatingChange}
                                placeholder="e.g. 4.5"
                            />

                            <small>
                                Enter a numeric rating between 0 and 5.
                            </small>
                        </div>

                        {/* SERVING SUGGESTION */}

                        <div className="form-group full-width">
                            <label>Serving Suggestion</label>

                            <textarea
                                name="servingSuggestion"
                                rows="3"
                                value={formData.servingSuggestion}
                                onChange={handleChange}
                                placeholder="e.g. Allow to soften for 2-3 minutes before serving."
                            />

                            <small>
                                This can be displayed separately on the
                                customer Product Details page.
                            </small>
                        </div>

                    </div>
                </section>

                {/* PRODUCT IMAGES */}

                <section className="product-form-section">
                    <h3>Product Images</h3>

                    <p className="section-description">
                        Upload one main image and up to four additional images.
                    </p>

                    <div className="form-grid">

                        <div className="form-group full-width">
                            <label>Main Product Image *</label>

                            <input
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                onChange={handleMainImageChange}
                            />

                            {mainImage && (
                                <div className="product-image-preview main-image-preview">
                                    <img
                                        src={mainImage}
                                        alt="Main product"
                                    />

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
                            <label>
                                Additional Images (Maximum 4)
                            </label>

                            <input
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                multiple
                                disabled={galleryImages.length >= 4}
                                onChange={handleGalleryImagesChange}
                            />

                            <small>
                                {galleryImages.length}/4 images uploaded.
                            </small>

                            <div className="product-gallery-preview">

                                {galleryImages.map((image, index) => (
                                    <div
                                        className="product-image-preview"
                                        key={index}
                                    >
                                        <img
                                            src={image}
                                            alt={`Product view ${index + 1}`}
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeGalleryImage(index)
                                            }
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}

                            </div>
                        </div>

                    </div>
                </section>

                {/* PACK SIZE AND PRICING */}

                <section className="product-form-section">
                    <h3>Unit, Pack Size & Pricing</h3>

                    <p className="section-description">
                        Enter an individual regular price and offer price
                        for every available pack size.
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
                                <option value="ml">
                                    Millilitre (ml)
                                </option>

                                <option value="g">
                                    Gram (g)
                                </option>
                            </select>
                        </div>

                        <div className="form-group full-width">
                            <label>Available Pack Sizes *</label>

                            <div className="pack-size-admin-list">

                                {weightOptions.map((weight) => (
                                    <div
                                        className="pack-size-admin-item"
                                        key={weight}
                                    >
                                        <strong>
                                            {weight} {weightUnit}
                                        </strong>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleRemoveWeight(weight)
                                            }
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
                                    onChange={(e) =>
                                        setCustomWeight(e.target.value)
                                    }
                                    placeholder={`Enter size in ${weightUnit}`}
                                />

                                <button
                                    type="button"
                                    onClick={handleAddWeight}
                                >
                                    + Add Pack Size
                                </button>

                            </div>
                        </div>

                    </div>

                    {/* INDIVIDUAL PRICING */}

                    <div className="form-group full-width">
                        <h4>Price Configuration</h4>

                        <div className="pack-price-preview">

                            <div className="price-config-header">
                                <strong>Pack Size</strong>
                                <strong>Regular Price (₹)</strong>
                                <strong>Offer Price (₹)</strong>
                            </div>

                            {weightOptions.map((weight) => (
                                <div
                                    className="price-config-row"
                                    key={weight}
                                >
                                    <strong>
                                        {weight} {weightUnit}
                                    </strong>

                                    <input
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        value={
                                            weightPrices[weight]?.price ?? ""
                                        }
                                        onChange={(e) =>
                                            handleWeightPriceChange(
                                                weight,
                                                "price",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Regular price"
                                        aria-label={`Regular price for ${weight} ${weightUnit}`}
                                    />

                                    <input
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        value={
                                            weightPrices[weight]?.offerPrice ?? ""
                                        }
                                        onChange={(e) =>
                                            handleWeightPriceChange(
                                                weight,
                                                "offerPrice",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Offer price"
                                        aria-label={`Offer price for ${weight} ${weightUnit}`}
                                    />
                                </div>
                            ))}

                        </div>
                    </div>

                    {/* STOCK */}

                    <div className="form-group">
                        <label>Available Stock *</label>

                        <input
                            type="number"
                            name="stock"
                            min="0"
                            step="1"
                            value={formData.stock}
                            onChange={handleChange}
                            required
                        />
                    </div>

                </section>

                {/* OPTIONAL ADD-ONS */}

                <section className="product-form-section">

                    <div className="addon-section-heading">
                        <div>
                            <h3>Optional Product Add-ons</h3>

                            <p className="section-description">
                                Add extras customers can select when ordering.
                            </p>
                        </div>

                        <label className="addon-toggle">
                            <input
                                type="checkbox"
                                checked={enableAddons}
                                onChange={(e) => {
                                    setEnableAddons(e.target.checked);

                                    if (!e.target.checked) {
                                        setError("");
                                    }
                                }}
                            />

                            <span>Enable Add-ons</span>
                        </label>
                    </div>

                    {enableAddons ? (
                        <>
                            <div className="addon-input-row">

                                <input
                                    value={addonName}
                                    onChange={(e) =>
                                        setAddonName(e.target.value)
                                    }
                                    placeholder="e.g. Chocolate chips"
                                />

                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={addonPrice}
                                    onChange={(e) =>
                                        setAddonPrice(e.target.value)
                                    }
                                    placeholder="Price ₹"
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
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}

                            </div>

                            {addons.length === 0 && (
                                <small>
                                    No add-ons added yet.
                                </small>
                            )}
                        </>
                    ) : (
                        <p className="addon-disabled-note">
                            Add-ons are disabled for this product.
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

                    <button
                        type="button"
                        className="secondary-btn"
                        onClick={resetForm}
                    >
                        Reset Form
                    </button>

                    <button
                        type="submit"
                        className="primary-btn"
                    >
                        + Save Product
                    </button>

                </div>

            </form>
        </div>
    );
}

export default AddProduct;
