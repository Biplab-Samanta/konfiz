
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import "../../style/dashboard.css";
import AddProduct from "./addproduct";
import Blog from "./blog";

// =====================================
// STORAGE HELPERS
// =====================================
const API_URL = "http://localhost:5000/api";
const readStorage = (key, fallback = []) => {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : fallback;
    } catch {
        return fallback;
    }
};

const saveStorage = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
};

const formatCurrency = (amount) =>
    Number(amount || 0).toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2
    });

const getOrderAmount = (order) =>
    Number(
        order.grandTotal ??
        order.totalAmount ??
        order.total ??
        order.amount ??
        0
    );

const getOrderCustomer = (order) =>
    order.customerName ||
    order.customer?.name ||
    order.name ||
    order.customerEmail ||
    order.email ||
    "Customer";

// =====================================
// DASHBOARD
// =====================================

function Dashboard({ onLogout }) {
    const { user, logout } = useAuth();


    // Dashboard states
    const [products, setProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [productsError, setProductsError] = useState("");

    const navigate = useNavigate();

    const isAdmin =
        user?.authenticated === true &&
        String(user?.role || "").toLowerCase() === "admin";

    useEffect(() => {
        if (!isAdmin) navigate("/", { replace: true });
    }, [isAdmin, navigate]);

    const adminEmail = user?.email || "admin@konfiz.com";

    // =====================================
    // FETCH PRODUCTS FROM MONGODB
    // =====================================

    useEffect(() => {
        if (!isAdmin) return;

        const fetchProducts = async () => {
            try {
                setProductsLoading(true);
                setProductsError("");

                const response = await fetch(`${API_URL}/products`);

                if (!response.ok) {
                    throw new Error(
                        `Unable to fetch products. Server returned ${response.status}`
                    );
                }

                const result = await response.json();

                // Support different API response formats
                const productList = Array.isArray(result)
                    ? result
                    : Array.isArray(result.products)
                        ? result.products
                        : Array.isArray(result.data)
                            ? result.data
                            : Array.isArray(result.data?.products)
                                ? result.data.products
                                : [];

                // Normalize MongoDB IDs for your existing dashboard
                const normalizedProducts = productList.map(product => ({
                    ...product,
                    id: String(product._id || product.id || product.productId),
                    stock: Number(
                        product.stock ?? product.quantity ?? 0
                    ),
                    price: Number(
                        product.price ??
                        product.sizes?.[0]?.price ??
                        product.pricing?.sizes?.[0]?.price ??
                        0
                    ),
                    image:
                        product.image ||
                        product.images?.[0] ||
                        ""
                }));

                setProducts(normalizedProducts);

            } catch (error) {
                console.error("Dashboard product fetching error:", error);
                setProductsError(error.message);
            } finally {
                setProductsLoading(false);
            }
        };

        fetchProducts();
    }, [isAdmin]);
    // =====================================
    // GENERAL NAVIGATION
    // =====================================

    const [activePage, setActivePage] = useState("Dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navigation = [
        { name: "Dashboard", icon: "▦" },
        { name: "Add Product", icon: "＋" },
        { name: "Manage Products", icon: "▤" },
        { name: "Categories", icon: "▧" },
        { name: "Inventory", icon: "▣" },
        { name: "Orders", icon: "🛒" },
        { name: "Blog", icon: "✎" },
        { name: "Customers", icon: "♙" },
        { name: "Settings", icon: "⚙" }
    ];

    const selectPage = (page) => {
        setActivePage(page);
        setSidebarOpen(false);
    };

    const pageHeader = (title, description) => (
        <div className="welcome-section">
            <div>
                <h2>{title}</h2>
                <p>{description}</p>
            </div>
        </div>
    );

    // =====================================
    // PRODUCTS
    // =====================================

    const handleAddProduct = (newProduct) => {
        const product = {
            ...newProduct,
            id: newProduct.id || `KON-PROD-${Date.now()}`,
            stock: Number(newProduct.stock ?? newProduct.quantity ?? 0)
        };

        setProducts(previous => [...previous, product]);
        selectPage("Manage Products");
    };


    const handleDeleteProduct = (id) => {
        if (!window.confirm("Are you sure you want to delete this product?")) {
            return;
        }

        setProducts(previous =>
            previous.filter(product => String(product.id) !== String(id))
        );
    };

    // =====================================
    // CATEGORIES
    // =====================================

    const [categories, setCategories] = useState(() =>
        readStorage("konfizCategories", [])
    );

    const [newCategory, setNewCategory] = useState("");
    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    const [newSubcategory, setNewSubcategory] = useState("");

    useEffect(() => {
        saveStorage("konfizCategories", categories);
    }, [categories]);

    const getCatId = (category) =>
        typeof category === "string"
            ? category
            : String(category?.id || category?._id || category?.categoryId || category?.name || "");

    const getCatName = (category) =>
        typeof category === "string"
            ? category
            : category?.name || "";

    const getSubId = (subcategory) =>
        typeof subcategory === "string"
            ? subcategory
            : String(subcategory?.id || subcategory?._id || subcategory?.name || "");

    const getSubName = (subcategory) =>
        typeof subcategory === "string"
            ? subcategory
            : subcategory?.name || "";

    const addCategory = () => {
        const name = newCategory.trim();

        if (!name) {
            alert("Enter a category name.");
            return;
        }

        const exists = categories.some(category =>
            getCatName(category).toLowerCase() === name.toLowerCase()
        );

        if (exists) {
            alert("This category already exists.");
            return;
        }

        const id = `CAT-${Date.now()}`;

        setCategories(previous => [
            ...previous,
            { id, name, subcategories: [] }
        ]);

        setSelectedCategoryId(id);
        setNewCategory("");
    };
  const deleteCategory = (id) => {
        const category = categories.find(item => getCatId(item) === id);
        if (!category) return;

        const categoryName = getCatName(category).toLowerCase();

        const used = products.some(product =>
            String(product.category || product.categoryName || "").toLowerCase() === categoryName ||
            String(product.categoryId || "") === String(id)
        );

        if (used) {
            alert("This category is currently used by a product.");
            return;
        }

        if (!window.confirm("Delete this category and all its subcategories?")) {
            return;
        }

        setCategories(previous =>
            previous.filter(item => getCatId(item) !== id)
        );

        if (selectedCategoryId === id) setSelectedCategoryId("");
    };
    const addSubcategory = () => {
        const name = newSubcategory.trim();

        if (!selectedCategoryId) {
            alert("Please select a main category.");
            return;
        }

        if (!name) {
            alert("Enter a subcategory name.");
            return;
        }

        const selected = categories.find(
            category => getCatId(category) === selectedCategoryId
        );

        if (!selected) {
            alert("Category not found.");
            return;
        }

        const existing = typeof selected === "string"
            ? []
            : selected.subcategories || [];

        if (existing.some(item =>
            getSubName(item).toLowerCase() === name.toLowerCase()
        )) {
            alert("This subcategory already exists.");
            return;
        }

        setCategories(previous =>
            previous.map(category => {
                if (getCatId(category) !== selectedCategoryId) return category;

                const normalized = typeof category === "string"
                    ? { id: category, name: category, subcategories: [] }
                    : category;

                return {
                    ...normalized,
                    subcategories: [
                        ...(normalized.subcategories || []),
                        { id: `SUB-${Date.now()}`, name }
                    ]
                };
            })
        );

        setNewSubcategory("");
    };

    const deleteSubcategory = (categoryId, subcategoryId) => {
        if (!window.confirm("Delete this subcategory?")) return;

        setCategories(previous =>
            previous.map(category => {
                if (getCatId(category) !== categoryId) return category;

                const normalized = typeof category === "string"
                    ? { id: category, name: category, subcategories: [] }
                    : category;

                return {
                    ...normalized,
                    subcategories: (normalized.subcategories || []).filter(
                        item => getSubId(item) !== subcategoryId
                    )
                };
            })
        );
    };  

    const renderCategories = () => (
        <div className="manage-products">
            {pageHeader(
                "Category Management",
                "Manage main categories and their subcategories."
            )}

            <div className="category-management-section">
                <h3>Add Main Category</h3>

                <div className="category-input-row">
                    <input
                        value={newCategory}
                        onChange={e => setNewCategory(e.target.value)}
                        placeholder="Enter category name"
                    />

                    <button type="button" onClick={addCategory}>
                        + Add Category
                    </button>
                </div>
            </div>

            <div className="category-management-section">
                <h3>Add Subcategory</h3>

                <div className="category-input-row">
                    <select
                        value={selectedCategoryId}
                        onChange={e => setSelectedCategoryId(e.target.value)}
                    >
                        <option value="">Select Main Category</option>
                        {categories.map(category => (
                            <option key={getCatId(category)} value={getCatId(category)}>
                                {getCatName(category)}
                            </option>
                        ))}
                    </select>

                    <input
                        value={newSubcategory}
                        onChange={e => setNewSubcategory(e.target.value)}
                        placeholder="Enter subcategory name"
                    />

                    <button type="button" onClick={addSubcategory}>
                        + Add Subcategory
                    </button>
                </div>
            </div>

            <div className="category-list">
                {categories.map(category => {
                    const categoryId = getCatId(category);
                    const subcategories = typeof category === "string"
                        ? []
                        : category.subcategories || [];

                    return (
                        <div className="category-item" key={categoryId}>
                            <div className="category-item-header">
                                <h3>{getCatName(category)}</h3>

                                <button
                                    type="button"
                                    className="delete-category-btn"
                                    onClick={() => deleteCategory(categoryId)}
                                >
                                    Delete
                                </button>
                            </div>

                            <div className="subcategory-list">
                                {subcategories.length ? (
                                    subcategories.map(subcategory => (
                                        <div
                                            className="subcategory-item"
                                            key={getSubId(subcategory)}
                                        >
                                            <span>{getSubName(subcategory)}</span>

                                            <button type="button" onClick={() => deleteSubcategory(categoryId, getSubId(subcategory))} > ×</button>
                                        </div>
                                    ))
                                ) : (
                                    <p>No subcategories added yet.</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    // =====================================
    // EDIT PRODUCT MODAL
    // =====================================

    const [showEditModal, setShowEditModal] = useState(false);
    const [editProduct, setEditProduct] = useState(null);
    const [editForm, setEditForm] = useState(null);

    const openEditProduct = (product) => {
        const matchingCategory = categories.find(
            category =>
                getCatName(category).toLowerCase() ===
                String(product.category || "").toLowerCase()
        );

        const categoryId = String(
            product.categoryId ||
            (matchingCategory ? getCatId(matchingCategory) : "")
        );

        const categoryObject = categories.find(
            category => getCatId(category) === categoryId
        );

        const categorySubcategories =
            categoryObject && typeof categoryObject !== "string"
                ? categoryObject.subcategories || []
                : [];

        const oldSubcategoryIds = Array.isArray(product.subcategoryIds)
            ? product.subcategoryIds.map(String)
            : product.subcategoryId
                ? [String(product.subcategoryId)]
                : [];

        const subcategoryIds = oldSubcategoryIds.length
            ? oldSubcategoryIds
            : categorySubcategories
                .filter(item =>
                    String(getSubName(item)).toLowerCase() ===
                    String(product.subcategory || product.subcategoryName || "").toLowerCase()
                )
                .map(getSubId);

        const unit = product.unit || product.pricing?.unit || "ml";

        const existingSizes = Array.isArray(product.sizes)
            ? product.sizes
            : Array.isArray(product.pricing?.sizes)
                ? product.pricing.sizes
                : (product.weightOptions || [100, 250, 500, 1000]).map(
                    weight => ({
                        weight,
                        unit,
                        price: product.price || 0,
                        offerPrice: product.offerPrice || product.price || 0
                    })
                );

        const sizes = existingSizes.map((size, index) => ({
            id: size.id || index + 1,
            weight: Number(size.weight),
            unit: size.unit || unit,
            price: String(size.price ?? ""),
            offerPrice: String(size.offerPrice ?? "")
        }));

        setEditProduct(product);

        setEditForm({
            ...product,
            name: product.name || "",
            sku: product.sku || "",
            description: product.description || "",
            flavour: product.flavour || product.flavor || "",
            servingSuggestion: product.servingSuggestion || "",
            categoryId,
            category: product.category || "",
            subcategoryIds,
            subcategoryId: subcategoryIds[0] || "",
            subcategories: product.subcategories || [],
            subcategory: product.subcategory || "",
            subcategoryName: product.subcategoryName || "",
            rating: String(product.rating ?? 0),
            stock: String(product.stock ?? 0),
            isPremium: Boolean(product.isPremium ?? product.premium),
            unit,
            weightOptions: sizes.map(size => size.weight),
            sizes,
            price: String(product.price ?? sizes[0]?.price ?? 0),
            offerPrice: String(
                product.offerPrice ?? sizes[0]?.offerPrice ?? 0
            ),

            image: product.image || "",
            images: Array.isArray(product.images)
                ? [...product.images]
                : product.image
                    ? [product.image]
                    : [],

            hasAddons: Boolean(
                product.hasAddons || product.addons?.length
            ),

            addons: Array.isArray(product.addons)
                ? product.addons.map(addon => ({
                    ...addon,
                    price: String(addon.price ?? 0),
                    active: addon.active !== false
                }))
                : [],

            status: product.status || "active"
        });

        setShowEditModal(true);
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setEditProduct(null);
        setEditForm(null);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;

        setEditForm(previous => ({
            ...previous,
            [name]: value
        }));
    };
    // =====================================
    // EDIT PRODUCT - SUBCATEGORIES
    // =====================================

    const handleEditSubcategoryToggle = (id) => {
        setEditForm(previous => {
            const current = previous.subcategoryIds || [];

            const updated = current.includes(id)
                ? current.filter(item => item !== id)
                : current.length < 2
                    ? [...current, id]
                    : current;

            const names = editSubcategories
                .filter(item => updated.includes(getSubId(item)))
                .map(getSubName);

            return {
                ...previous,
                subcategoryIds: updated,
                subcategoryId: updated[0] || "",
                subcategories: names,
                subcategory: names[0] || "",
                subcategoryName: names[0] || ""
            };
        });
    };

    // =====================================
    // EDIT PRODUCT - PACK SIZES
    // =====================================

    const addEditWeight = (weight) => {
        const value = Number(weight);

        if (!Number.isFinite(value) || value <= 0) {
            alert("Enter a valid pack size.");
            return;
        }

        if (editForm.weightOptions.includes(value)) {
            alert("This pack size already exists.");
            return;
        }

        setEditForm(previous => {
            const sizes = [
                ...previous.sizes,
                {
                    id: Date.now(),
                    weight: value,
                    unit: previous.unit,
                    price: "",
                    offerPrice: ""
                }
            ].sort((a, b) => a.weight - b.weight);

            return {
                ...previous,
                sizes,
                weightOptions: sizes.map(size => size.weight)
            };
        });
    };

    const removeEditWeight = (weight) => {
        setEditForm(previous => {
            const sizes = previous.sizes.filter(
                size => size.weight !== weight
            );

            return {
                ...previous,
                sizes,
                weightOptions: sizes.map(size => size.weight)
            };
        });
    };

    const handleEditSizePrice = (weight, field, value) => {
        setEditForm(previous => ({
            ...previous,
            sizes: previous.sizes.map(size =>
                size.weight === weight
                    ? { ...size, [field]: value }
                    : size
            )
        }));
    };

    // =====================================
    // EDIT PRODUCT - ADDONS
    // =====================================

    const updateAddon = (index, field, value) => {
        setEditForm(previous => ({
            ...previous,
            addons: previous.addons.map((addon, i) =>
                i === index
                    ? { ...addon, [field]: value }
                    : addon
            )
        }));
    };

    const addEditAddon = () => {
        setEditForm(previous => ({
            ...previous,
            hasAddons: true,
            addons: [
                ...previous.addons,
                {
                    id: `ADD-${Date.now()}`,
                    name: "",
                    price: "0",
                    active: true
                }
            ]
        }));
    };

    const removeEditAddon = (index) => {
        setEditForm(previous => ({
            ...previous,
            addons: previous.addons.filter(
                (_, i) => i !== index
            )
        }));
    };

    // =====================================
    // EDIT PRODUCT - IMAGE UPLOAD
    // =====================================

    const readEditImage = (file) => {
        return new Promise((resolve, reject) => {
            if (!file || !file.type.startsWith("image/")) {
                reject(new Error("Please select a valid image."));
                return;
            }

            const image = new Image();
            const url = URL.createObjectURL(file);

            image.onload = () => {
                const canvas = document.createElement("canvas");

                const scale = Math.min(
                    1200 / image.width,
                    1200 / image.height,
                    1
                );

                canvas.width = Math.round(image.width * scale);
                canvas.height = Math.round(image.height * scale);

                const context = canvas.getContext("2d");

                context.drawImage(
                    image,
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );

                const result = canvas.toDataURL("image/webp", 0.75);

                URL.revokeObjectURL(url);
                resolve(result);
            };

            image.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error("Unable to process image."));
            };

            image.src = url;
        });
    };

    const handleEditMainImage = async (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        try {
            const image = await readEditImage(file);

            setEditForm(previous => ({
                ...previous,
                image,
                images: [
                    image,
                    ...previous.images.filter(
                        item => item !== previous.image
                    )
                ]
            }));
        } catch (error) {
            alert(error.message);
        }

        e.target.value = "";
    };

    const handleEditGalleryImages = async (e) => {
        const files = Array.from(e.target.files || []);

        if (!files.length) return;

        const currentGallery = editForm.images.filter(
            image => image !== editForm.image
        );

        if (currentGallery.length + files.length > 4) {
            alert("You can upload a maximum of four additional images.");
            e.target.value = "";
            return;
        }

        try {
            const images = await Promise.all(
                files.map(readEditImage)
            );

            setEditForm(previous => ({
                ...previous,
                images: [
                    previous.image,
                    ...previous.images.filter(
                        item => item !== previous.image
                    ),
                    ...images
                ].filter(Boolean)
            }));
        } catch (error) {
            alert(error.message);
        }

        e.target.value = "";
    };

    const removeEditGalleryImage = (image) => {
        setEditForm(previous => ({
            ...previous,
            images: previous.images.filter(
                item => item !== image
            )
        }));
    };
    const handleEditCategoryChange = (e) => {
        const categoryId = e.target.value;
        const category = categories.find(
            item => getCatId(item) === categoryId
        );

        setEditForm(previous => ({
            ...previous,
            categoryId,
            category: category ? getCatName(category) : "",
            subcategoryId: "",
            subcategory: "",
            subcategoryName: ""
        }));
    };

    const saveEditedProduct = (e) => {
        e.preventDefault();

        if (!editProduct || !editForm) return;

        const requiredText = [
            ["name", "Product name is required."],
            ["sku", "Product SKU is required."],
            ["description", "Product description is required."],
            ["flavour", "Product flavour is required."]
        ];

        for (const [field, message] of requiredText) {
            if (!String(editForm[field] || "").trim()) {
                alert(message);
                return;
            }
        }

        // UNIQUE SKU VALIDATION
        const duplicateSKU = products.some(product =>
            String(product.id) !== String(editProduct.id) &&
            String(product.sku || "").toLowerCase() ===
            String(editForm.sku).trim().toLowerCase()
        );

        if (duplicateSKU) {
            alert("This SKU already belongs to another product.");
            return;
        }

        // CATEGORY VALIDATION
        const category = categories.find(
            item => getCatId(item) === editForm.categoryId
        );

        if (!category) {
            alert("Please select a valid category.");
            return;
        }

        // RATING VALIDATION
        const rating = Number(editForm.rating);

        if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
            alert("Rating must be between 0 and 5.");
            return;
        }

        // STOCK VALIDATION
        const stock = Number(editForm.stock);

        if (!Number.isInteger(stock) || stock < 0) {
            alert("Please enter valid available stock.");
            return;
        }

        // PACK VALIDATION
        if (!editForm.sizes?.length) {
            alert("Add at least one pack size.");
            return;
        }

        const sizes = editForm.sizes.map((size, index) => {
            const price = Number(size.price);
            const offerPrice = Number(size.offerPrice);

            if (
                !Number.isFinite(price) ||
                price <= 0 ||
                size.price === ""
            ) {
                throw new Error(
                    `Enter a valid regular price for ${size.weight} ${editForm.unit}.`
                );
            }

            if (
                !Number.isFinite(offerPrice) ||
                offerPrice <= 0 ||
                size.offerPrice === ""
            ) {
                throw new Error(
                    `Enter a valid offer price for ${size.weight} ${editForm.unit}.`
                );
            }

            if (offerPrice > price) {
                throw new Error(
                    `Offer price cannot exceed regular price for ${size.weight} ${editForm.unit}.`
                );
            }

            return {
                id: size.id || index + 1,
                weight: Number(size.weight),
                unit: editForm.unit,
                price,
                offerPrice
            };
        });

        // SUBCATEGORIES
        const categorySubcategories =
            typeof category === "string"
                ? []
                : category.subcategories || [];

        const validSubcategories = categorySubcategories.filter(
            item => editForm.subcategoryIds.includes(getSubId(item))
        );

        // ADDONS
        const addons = editForm.hasAddons
            ? editForm.addons.map(addon => {
                const price = Number(addon.price);

                if (!String(addon.name || "").trim()) {
                    throw new Error("Every add-on must have a name.");
                }

                if (!Number.isFinite(price) || price < 0) {
                    throw new Error(
                        `Invalid price for add-on ${addon.name}.`
                    );
                }

                return {
                    ...addon,
                    name: addon.name.trim(),
                    price,
                    active: addon.active !== false
                };
            })
            : [];

        // IMAGE VALIDATION
        if (!editForm.image) {
            alert("Please upload a main product image.");
            return;
        }

        const updatedProduct = {
            ...editProduct,
            ...editForm,

            id: editProduct.id,

            name: editForm.name.trim(),
            sku: editForm.sku.trim().toUpperCase(),

            description: editForm.description.trim(),
            flavour: editForm.flavour.trim(),

            rating,
            stock,

            categoryId: editForm.categoryId,
            category: getCatName(category),

            subcategoryIds: validSubcategories.map(getSubId),
            subcategories: validSubcategories.map(getSubName),

            subcategoryId: validSubcategories[0]
                ? getSubId(validSubcategories[0])
                : "",

            subcategory: validSubcategories[0]
                ? getSubName(validSubcategories[0])
                : "",

            subcategoryName: validSubcategories[0]
                ? getSubName(validSubcategories[0])
                : "",

            isPremium: Boolean(editForm.isPremium),
            premium: Boolean(editForm.isPremium),
            featured: Boolean(editForm.isPremium),

            unit: editForm.unit,
            weightOptions: sizes.map(size => size.weight),
            sizes,

            price: sizes[0].price,
            offerPrice: sizes[0].offerPrice,

            pricing: {
                unit: editForm.unit,
                sizes
            },

            image: editForm.image,
            images: [
                editForm.image,
                ...editForm.images.filter(
                    image => image !== editForm.image
                )
            ],

            hasAddons: Boolean(editForm.hasAddons),
            addons,

            servingSuggestion: editForm.servingSuggestion.trim(),

            inStock: stock > 0,
            available: stock > 0,

            status: editForm.status || "active",

            updatedAt: new Date().toISOString()
        };

        try {
            setProducts(previous =>
                previous.map(product =>
                    String(product.id) === String(editProduct.id)
                        ? updatedProduct
                        : product
                )
            );

            closeEditModal();

            alert("Product updated successfully!");

        } catch (error) {
            console.error("Product update error:", error);
            alert(error.message || "Unable to update product.");
        }
    };

    const editCategory = categories.find(
        category => getCatId(category) === String(editForm?.categoryId || "")
    );

    const editSubcategories = editCategory && typeof editCategory !== "string"
        ? editCategory.subcategories || []
        : [];

    // =====================================
    // MANAGE PRODUCTS------
    // =====================================

    const [productSearch, setProductSearch] = useState("");
    const [productCategoryFilter, setProductCategoryFilter] = useState("All");
    const [productStockFilter, setProductStockFilter] = useState("All");
    const [productSort, setProductSort] = useState("newest");

    const filteredProducts = useMemo(() => {
        return products
            .filter(product => {
                const search = productSearch.toLowerCase().trim();

                const matchesSearch =
                    String(product.name || "").toLowerCase().includes(search) ||
                    String(product.category || "").toLowerCase().includes(search) ||
                    String(product.id || "").toLowerCase().includes(search);

                const matchesCategory =
                    productCategoryFilter === "All" ||
                    product.category === productCategoryFilter;

                const stock = Number(product.stock ?? 0);

                const matchesStock =
                    productStockFilter === "All" ||
                    (productStockFilter === "In Stock" && stock > 5) ||
                    (productStockFilter === "Low Stock" && stock > 0 && stock <= 5) ||
                    (productStockFilter === "Out of Stock" && stock === 0);

                return matchesSearch && matchesCategory && matchesStock;
            })
            .sort((a, b) => {
                if (productSort === "price-low") {
                    return Number(a.price || 0) - Number(b.price || 0);
                }
                if (productSort === "price-high") {
                    return Number(b.price || 0) - Number(a.price || 0);
                }
                if (productSort === "name") {
                    return String(a.name || "").localeCompare(String(b.name || ""));
                }
                return 0;
            });
    }, [products, productSearch, productCategoryFilter, productStockFilter, productSort]);

    const renderManageProducts = () => {
        const inStock = products.filter(p => Number(p.stock || 0) > 5).length;
        const lowStock = products.filter(p => {
            const stock = Number(p.stock || 0);
            return stock > 0 && stock <= 5;
        }).length;
        const outOfStock = products.filter(p => Number(p.stock || 0) === 0).length;

        const categoriesList = [
            ...new Set(products.map(product => product.category).filter(Boolean))
        ];

        return (
            <div className="manage-products-page">
                <div className="manage-products-header">
                    <div>
                        <span className="manage-products-eyebrow">
                            KONFiZ STORE / CATALOGUE
                        </span>
                        <h2>Manage Products</h2>
                        <p>Organise your ice cream collection and update product details.</p>
                    </div>

                    <button type="button" className="manage-add-product-btn" onClick={() => selectPage("Add Product")} >
                        ＋ Add New Product
                    </button>
                </div>

                <div className="manage-product-stats">
                    <div className="manage-product-stat">
                        <div className="manage-stat-icon pink">🍦</div>
                        <div><span>Total Products</span><h3>{products.length}</h3></div>
                    </div>
                    <div className="manage-product-stat">
                        <div className="manage-stat-icon green">✓</div>
                        <div><span>In Stock</span><h3>{inStock}</h3></div>
                    </div>
                    <div className="manage-product-stat">
                        <div className="manage-stat-icon orange">⚠</div>
                        <div><span>Low Stock</span><h3>{lowStock}</h3></div>
                    </div>
                    <div className="manage-product-stat">
                        <div className="manage-stat-icon red">×</div>
                        <div><span>Out of Stock</span><h3>{outOfStock}</h3></div>
                    </div>
                </div>

                <div className="manage-catalogue-card">
                    <div className="manage-catalogue-heading">
                        <div>
                            <h3>Product Catalogue</h3>
                            <p>View and manage all products available in your store.</p>
                        </div>
                        <span className="manage-product-count">
                            {filteredProducts.length} Products
                        </span>
                    </div>

                    <div className="manage-product-toolbar">
                        <div className="manage-product-search">
                            <span>⌕</span>
                            <input
                                value={productSearch}
                                onChange={e => setProductSearch(e.target.value)}
                                placeholder="Search by product name or ID..."
                            />
                        </div>

                        <select
                            value={productCategoryFilter}
                            onChange={e => setProductCategoryFilter(e.target.value)}
                        >
                            <option value="All">All Categories</option>
                            {categoriesList.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>

                        <select
                            value={productStockFilter}
                            onChange={e => setProductStockFilter(e.target.value)}
                        >
                            <option value="All">All Stock Status</option>
                            <option value="In Stock">In Stock</option>
                            <option value="Low Stock">Low Stock</option>
                            <option value="Out of Stock">Out of Stock</option>
                        </select>

                        <select
                            value={productSort}
                            onChange={e => setProductSort(e.target.value)}
                        >
                            <option value="newest">Default Order</option>
                            <option value="name">Name: A to Z</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                        </select>
                    </div>

                    {productsLoading ? (
                        <div className="manage-products-empty">
                            <h3>Loading Products...</h3>
                            <p>Please wait while products are fetched from MongoDB.</p>
                        </div>
                    ) : productsError ? (
                        <div className="manage-products-empty">
                            <h3>Unable to Load Products</h3>
                            <p>{productsError}</p>
                            <button
                                type="button"
                                onClick={() => window.location.reload()}
                            >
                                Retry
                            </button>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="manage-products-empty">
                            <div className="manage-empty-icon">🔍</div>
                            <h3>No matching products</h3>
                            <p>Try changing your search or filters.</p>
                            <button onClick={() => {
                                setProductSearch("");
                                setProductCategoryFilter("All");
                                setProductStockFilter("All");
                                setProductSort("newest");
                            }}>
                                Clear Filters
                            </button>
                        </div>
                    ) : (
                        <div className="manage-products-grid">
                            {filteredProducts.map(product => {
                                const stock = Number(product.stock ?? 0);
                                const stockStatus = stock === 0
                                    ? "out"
                                    : stock <= 5
                                        ? "low"
                                        : "available";

                                return (
                                    <div className="manage-product-card" key={product.id}>
                                        <div className="manage-product-image">
                                            {product.image ? (
                                                <img src={product.image} alt={product.name} />
                                            ) : (
                                                <div className="manage-product-placeholder">🍦</div>
                                            )}

                                            <span className={`manage-stock-badge ${stockStatus}`}>
                                                {stockStatus === "out"
                                                    ? "Out of Stock"
                                                    : stockStatus === "low"
                                                        ? "Low Stock"
                                                        : "In Stock"}
                                            </span>

                                            <span className="manage-product-category">
                                                {product.category || "Uncategorized"}
                                            </span>
                                        </div>

                                        <div className="manage-product-details">
                                            <div className="manage-product-title-row">
                                                <h3>{product.name}</h3>
                                                <span className="manage-product-rating">
                                                    ⭐ {product.rating || "N/A"}
                                                </span>
                                            </div>

                                            <p className="manage-product-description">
                                                {product.description || "A delicious KONFiZ ice cream flavour."}
                                            </p>

                                            <div className="manage-product-meta">
                                                <span>Product ID<strong>{product.id}</strong></span>
                                                <span>Available Stock<strong>{stock} units</strong></span>
                                            </div>

                                            <div className="manage-product-card-footer">
                                                <div className="manage-product-price">
                                                    <small>Starting from</small>
                                                    <strong>{formatCurrency(product.price)}</strong>
                                                </div>

                                                <div className="manage-product-actions">
                                                    <button
                                                        type="button"
                                                        className="manage-edit-btn"
                                                        title="Edit product"
                                                        onClick={() => openEditProduct(product)}
                                                    >
                                                        ✎
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="manage-delete-btn"
                                                        title="Remove product"
                                                        onClick={() => handleDeleteProduct(product.id)}
                                                    >
                                                        🗑
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {products.length > 0 && (
                        <div className="manage-products-footer">
                            Showing {filteredProducts.length} of {products.length} products
                        </div>
                    )}
                </div>
            </div>
         
        );
    };

    // =====================================
    // ORDERS
    // =====================================

    const [orders, setOrders] = useState(() =>
        readStorage("konfizOrders", [])
    );
    const [orderSearch, setOrderSearch] = useState("");

    useEffect(() => {
        saveStorage("konfizOrders", orders);
    }, [orders]);

    const updateOrderStatus = (orderId, status) => {
        setOrders(previous =>
            previous.map(order =>
                String(order.id || order.orderId) === String(orderId)
                    ? { ...order, status }
                    : order
            )
        );
    };

    const renderOrders = () => {
        const filteredOrders = orders.filter(order =>
            String(order.orderId || order.id || "")
                .toLowerCase()
                .includes(orderSearch.toLowerCase().trim())
        );

        return (
            <div className="orders-section">
                <div className="orders-header">
                    <div>
                        <h2>Manage Orders</h2>
                        <p>Search and manage customer orders.</p>
                    </div>

                    <div className="order-search">
                        <span>🔍</span>
                        <input
                            value={orderSearch}
                            onChange={e => setOrderSearch(e.target.value)}
                            placeholder="Search by Order ID..."
                        />
                        {orderSearch && (
                            <button onClick={() => setOrderSearch("")}>✕</button>
                        )}
                    </div>
                </div>

                <div className="orders-table-wrapper">
                    <table className="orders-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer Name</th>
                                <th>Phone Number</th>
                                <th>Order Date</th>
                                <th>Bill / Delivery Address</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredOrders.length ? filteredOrders.map((order, index) => {
                                const customer = order.customer || {};
                                const orderId = order.orderId || order.id || `ORDER-${index}`;
                                const address = [
                                    customer.address || order.address || order.billingAddress,
                                    customer.city || order.city,
                                    customer.state || order.state,
                                    customer.pincode || order.pincode
                                ].filter(Boolean).join(", ");

                                return (
                                    <tr key={orderId}>
                                        <td>{orderId}</td>
                                        <td>{customer.name || order.customerName || "Guest"}</td>
                                        <td>{customer.mobile || customer.phone || order.mobile || order.phone || "N/A"}</td>
                                        <td>
                                            {order.orderDate
                                                ? new Date(order.orderDate).toLocaleDateString("en-IN")
                                                : "N/A"}
                                        </td>
                                        <td>{address || "N/A"}</td>
                                        <td>{formatCurrency(getOrderAmount(order))}</td>
                                        <td>
                                            <select
                                                value={order.status || "Pending"}
                                                onChange={e => updateOrderStatus(orderId, e.target.value)}
                                            >
                                                {[
                                                    "Pending", "Confirmed", "Processing",
                                                    "Shipped", "Delivered", "Completed", "Cancelled"
                                                ].map(status => (
                                                    <option key={status} value={status}>{status}</option>
                                                ))}
                                            </select>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="7" className="no-orders">
                                        {orderSearch ? "No matching orders found." : "No orders available."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    // =====================================
    // CUSTOMERS
    // =====================================

    const [customers, setCustomers] = useState(() =>
        readStorage("konfizRegisteredCustomers", [])
    );
    const [customerSearch, setCustomerSearch] = useState("");

    const renderCustomers = () => {
        const filteredCustomers = customers.filter(customer => {
            const search = customerSearch.toLowerCase().trim();

            return (
                String(customer.customerId || customer.id || "").toLowerCase().includes(search) ||
                String(customer.name || "").toLowerCase().includes(search) ||
                String(customer.mobile || customer.phone || "").toLowerCase().includes(search)
            );
        });

        return (
            <div className="manage-products customer-management">
                {pageHeader(
                    "Customer Management",
                    "Manage registered customers and their contact information."
                )}

                <div className="customer-summary">
                    <div className="customer-summary-info">
                        <span className="customer-summary-icon">♙</span>
                        <div>
                            <small>Total Registered Customers</small>
                            <h2>{customers.length}</h2>
                        </div>
                    </div>
                    <div className="customer-summary-note">Customer records</div>
                </div>

                <div className="dashboard-panel customer-panel">
                    <div className="customer-panel-header">
                        <div>
                            <h3>All Customers</h3>
                            <p>View customer details and contact information.</p>
                        </div>

                        <div className="customer-search">
                            <span>⌕</span>
                            <input
                                value={customerSearch}
                                onChange={e => setCustomerSearch(e.target.value)}
                                placeholder="Search ID, name or phone..."
                            />
                            {customerSearch && (
                                <button onClick={() => setCustomerSearch("")}>×</button>
                            )}
                        </div>
                    </div>

                    {filteredCustomers.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">♙</div>
                            <strong>No matching customers found.</strong>
                            <span>Customer records will appear here after registration.</span>
                        </div>
                    ) : (
                        <div className="admin-table-wrapper">
                            <table className="admin-table customer-table">
                                <thead>
                                    <tr>
                                        <th>Customer ID</th>
                                        <th>Customer Name</th>
                                        <th>Phone Number</th>
                                        <th>Email Address</th>
                                        <th>Registration Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCustomers.map((customer, index) => {
                                        const customerId = customer.customerId || customer.id || "N/A";
                                        const createdAt = customer.createdAt ||
                                            customer.registrationDate ||
                                            customer.registeredAt;

                                        return (
                                            <tr key={customerId === "N/A" ? index : customerId}>
                                                <td><span className="customer-id">{customerId}</span></td>
                                                <td>
                                                    <div className="customer-name-cell">
                                                        <div className="customer-avatar">
                                                            {(customer.name || "C").charAt(0).toUpperCase()}
                                                        </div>
                                                        <strong>{customer.name || "N/A"}</strong>
                                                    </div>
                                                </td>
                                                <td>{customer.mobile || customer.phone || "N/A"}</td>
                                                <td>{customer.email || "Not provided"}</td>
                                                <td>
                                                    {createdAt
                                                        ? new Date(createdAt).toLocaleDateString("en-IN")
                                                        : "N/A"}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="customer-table-footer">
                        Showing {filteredCustomers.length} of {customers.length} customers
                    </div>
                </div>
            </div>
        );
    };

    // =====================================
    // INVENTORY
    // =====================================

    const [inventorySearch, setInventorySearch] = useState("");
    const [inventoryCategory, setInventoryCategory] = useState("All");
    const [inventoryFilter, setInventoryFilter] = useState("All");

    const updateStock = (product, amount) => {
        const newStock = Number(amount);

        if (!Number.isFinite(newStock) || newStock < 0) {
            alert("Stock cannot be negative.");
            return;
        }

        setProducts(previous =>
            previous.map(item =>
                String(item.id) === String(product.id)
                    ? { ...item, stock: newStock }
                    : item
            )
        );
    };

    const renderInventory = () => {
        const totalStock = products.reduce(
            (total, product) => total + Number(product.stock || 0),
            0
        );

        const lowStockProducts = products.filter(product => {
            const stock = Number(product.stock || 0);
            return stock > 0 && stock <= 5;
        });

        const outOfStockProducts = products.filter(
            product => Number(product.stock || 0) === 0
        );

        const inventoryValue = products.reduce(
            (total, product) =>
                total + Number(product.price || 0) * Number(product.stock || 0),
            0
        );

        const filtered = products.filter(product => {
            const search = inventorySearch.toLowerCase().trim();
            const stock = Number(product.stock || 0);

            const matchesSearch =
                String(product.name || "").toLowerCase().includes(search) ||
                String(product.id || "").toLowerCase().includes(search);

            const matchesCategory =
                inventoryCategory === "All" ||
                String(product.category || "").toLowerCase() === inventoryCategory.toLowerCase();

            const matchesStatus =
                inventoryFilter === "All" ||
                (inventoryFilter === "In Stock" && stock > 5) ||
                (inventoryFilter === "Low Stock" && stock > 0 && stock <= 5) ||
                (inventoryFilter === "Out of Stock" && stock === 0);

            return matchesSearch && matchesCategory && matchesStatus;
        });

        const getStatus = stock => stock === 0
            ? { label: "Out of Stock", className: "out-stock" }
            : stock <= 5
                ? { label: "Low Stock", className: "low-stock" }
                : { label: "In Stock", className: "in-stock" };

        const categoryNames = [
            ...new Set(products.map(product => product.category).filter(Boolean))
        ];

        return (
            <div className="inventory-page">
                <div className="inventory-header">
                    <div>
                        <span className="inventory-eyebrow">KONFIZ STORE MANAGEMENT</span>
                        <h2>Inventory Overview</h2>
                        <p>Track products, monitor stock levels and manage inventory.</p>
                    </div>
                    <div className="inventory-header-icon">📦</div>
                </div>

                <div className="inventory-stats-grid">
                    <div className="inventory-stat-card">
                        <div className="inventory-stat-icon purple">📦</div>
                        <h3>{products.length}</h3>
                        <p>Total Products</p>
                    </div>
                    <div className="inventory-stat-card">
                        <div className="inventory-stat-icon blue">🏬</div>
                        <h3>{totalStock.toLocaleString("en-IN")}</h3>
                        <p>Total Stock Units</p>
                    </div>
                    <div className="inventory-stat-card">
                        <div className="inventory-stat-icon orange">⚠️</div>
                        <h3>{lowStockProducts.length}</h3>
                        <p>Low Stock Products</p>
                    </div>
                    <div className="inventory-stat-card">
                        <div className="inventory-stat-icon red">🚫</div>
                        <h3>{outOfStockProducts.length}</h3>
                        <p>Out of Stock</p>
                    </div>
                </div>

                <div className="inventory-value-card">
                    <div>
                        <span>Estimated Inventory Value</span>
                        <h2>{formatCurrency(inventoryValue)}</h2>
                        <p>Based on current product price × available stock.</p>
                    </div>
                    <div className="inventory-value-icon">₹</div>
                </div>

                <div className="inventory-table-card">
                    <div className="inventory-table-heading">
                        <div>
                            <h3>Product Inventory</h3>
                            <p>Manage product quantities and stock status.</p>
                        </div>
                        <span className="inventory-total-badge">{filtered.length} Products</span>
                    </div>

                    <div className="inventory-toolbar">
                        <div className="inventory-search">
                            <span>⌕</span>
                            <input
                                value={inventorySearch}
                                onChange={e => setInventorySearch(e.target.value)}
                                placeholder="Search products..."
                            />
                        </div>

                        <select
                            value={inventoryCategory}
                            onChange={e => setInventoryCategory(e.target.value)}
                        >
                            <option value="All">All Categories</option>
                            {categoryNames.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>

                        <select
                            value={inventoryFilter}
                            onChange={e => setInventoryFilter(e.target.value)}
                        >
                            <option value="All">All Status</option>
                            <option value="In Stock">In Stock</option>
                            <option value="Low Stock">Low Stock</option>
                            <option value="Out of Stock">Out of Stock</option>
                        </select>
                    </div>

                    <div className="inventory-status-filters">
                        {["All", "In Stock", "Low Stock", "Out of Stock"].map(status => (
                            <button
                                type="button"
                                key={status}
                                className={inventoryFilter === status
                                    ? "inventory-filter-btn active"
                                    : "inventory-filter-btn"}
                                onClick={() => setInventoryFilter(status)}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    <div className="inventory-table-wrapper">
                        <table className="inventory-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Category</th>
                                    <th>Unit Price</th>
                                    <th>Available Stock</th>
                                    <th>Stock Level</th>
                                    <th>Status</th>
                                    <th>Update Stock</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan="7">
                                            <div className="inventory-empty">
                                                <span>📦</span>
                                                <h3>No Products Found</h3>
                                                <p>Try changing your search or filters.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filtered.map(product => {
                                    const stock = Number(product.stock || 0);
                                    const status = getStatus(stock);
                                    const progress = Math.min(stock, 100);

                                    return (
                                        <tr key={product.id}>
                                            <td>
                                                <div className="inventory-product">
                                                    {product.image
                                                        ? <img src={product.image} alt={product.name} />
                                                        : <div className="inventory-product-placeholder">🍦</div>}
                                                    <div>
                                                        <strong>{product.name}</strong>
                                                        <small>{product.id}</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{product.category || "Uncategorized"}</td>
                                            <td className="inventory-price">{formatCurrency(product.price)}</td>
                                            <td>
                                                <strong className="inventory-stock-number">{stock}</strong>
                                                <small className="inventory-unit">units</small>
                                            </td>
                                            <td>
                                                <div className="inventory-progress">
                                                    <div className="inventory-progress-track">
                                                        <div
                                                            className={`inventory-progress-fill ${status.className}`}
                                                            style={{ width: `${progress}%` }}
                                                        />
                                                    </div>
                                                    <small>{stock} units</small>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`inventory-status ${status.className}`}>
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="inventory-update-control">
                                                    <input
                                                        key={`${product.id}-${stock}`}
                                                        type="number"
                                                        min="0"
                                                        defaultValue={stock}
                                                        onBlur={e => {
                                                            if (e.target.value === "") {
                                                                e.target.value = stock;
                                                                return;
                                                            }
                                                            updateStock(product, e.target.value);
                                                        }}
                                                        onKeyDown={e => {
                                                            if (e.key === "Enter") e.currentTarget.blur();
                                                        }}
                                                    />
                                                    <span>Units</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="inventory-table-footer">
                        Showing {filtered.length} of {products.length} products
                    </div>
                </div>
            </div>
        );
    };

    // =====================================
    // SETTINGS
    // =====================================

    const [settings, setSettings] = useState(() =>
        readStorage("konfizStoreSettings", {
            storeName: "KONFIZ",
            email: "admin@konfiz.com",
            mobile: "",
            address: ""
        })
    );

    useEffect(() => {
        saveStorage("konfizStoreSettings", settings);
    }, [settings]);

    const handleSettingsChange = (field, value) => {
        setSettings(previous => ({
            ...previous,
            [field]: value
        }));
    };

    const renderSettings = () => (
        <div className="manage-products">
            {pageHeader("Store Settings", "Manage your KONFIZ store information.")}

            <div className="dashboard-panel">
                <h3>Store Information</h3>

                <div className="login-group">
                    <label>Store Name</label>
                    <input
                        className="login-input"
                        value={settings.storeName || ""}
                        onChange={e => handleSettingsChange("storeName", e.target.value)}
                    />
                </div>

                <div className="login-group">
                    <label>Store Email</label>
                    <input
                        type="email"
                        className="login-input"
                        value={settings.email || ""}
                        onChange={e => handleSettingsChange("email", e.target.value)}
                    />
                </div>

                <div className="login-group">
                    <label>Mobile Number</label>
                    <input
                        type="tel"
                        className="login-input"
                        value={settings.mobile || ""}
                        onChange={e => handleSettingsChange("mobile", e.target.value)}
                    />
                </div>

                <div className="login-group">
                    <label>Store Address</label>
                    <textarea
                        className="login-input"
                        value={settings.address || ""}
                        onChange={e => handleSettingsChange("address", e.target.value)}
                    />
                </div>

                <button
                    className="primary-btn"
                    onClick={() => {
                        saveStorage("konfizStoreSettings", settings);
                        alert("Store settings saved successfully.");
                    }}
                >
                    Save Settings
                </button>
            </div>

            <div className="dashboard-panel" style={{ marginTop: 20 }}>
                <h3>Administrator Information</h3>
                <p>Name: {user?.name || "Master Admin"}</p>
                <p>Email: {adminEmail}</p>
                <p>Role: Administrator</p>
            </div>
        </div>
    );

    // =====================================
    // DASHBOARD HOME
    // =====================================

    const totalRevenue = orders
        .filter(order =>
            ["delivered", "completed"].includes(
                String(order.status || "").toLowerCase()
            )
        )
        .reduce((total, order) => total + getOrderAmount(order), 0);

    const recentOrders = useMemo(
        () => [...orders].slice(-5).reverse(),
        [orders]
    );

    const lowStockProducts = products.filter(
        product => Number(product.stock || 0) <= 5
    );

    const renderDashboard = () => {
        const stats = [
            { title: "Total Products", value: products.length, change: "Products in store", icon: "▤" },
            { title: "Total Orders", value: orders.length, change: "Orders received", icon: "🛒" },
            { title: "Total Customers", value: customers.length, change: "Registered customers", icon: "♙" },
            { title: "Total Revenue", value: formatCurrency(totalRevenue), change: "Completed orders", icon: "₹" }
        ];

        return (
            <>
                <div className="welcome-section">
                    <div>
                        <h2>Welcome to KONFIZ</h2>
                        <p>Here's what's happening with your store today.</p>
                    </div>
                    <button className="primary-btn" onClick={() => selectPage("Add Product")}>
                        + Add New Product
                    </button>
                </div>

                <div className="stats-grid">
                    {stats.map(stat => (
                        <div className="stat-card" key={stat.title}>
                            <div className="stat-top">
                                <span className="stat-title">{stat.title}</span>
                                <div className="stat-icon">{stat.icon}</div>
                            </div>
                            <div className="stat-value">{stat.value}</div>
                            <div className="stat-change">{stat.change}</div>
                        </div>
                    ))}
                </div>

                <div className="dashboard-grid">
                    <div className="dashboard-panel">
                        <div className="panel-heading">
                            <h3>Recent Orders</h3>
                            <button onClick={() => selectPage("Orders")}>View All</button>
                        </div>

                        {recentOrders.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">🛒</div>
                                <strong>No orders yet</strong>
                                <span>Customer orders will appear here.</span>
                            </div>
                        ) : (
                            <div className="admin-table-wrapper">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Order ID</th>
                                            <th>Customer</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentOrders.map((order, index) => (
                                            <tr key={order.id || order.orderId || index}>
                                                <td>{order.orderId || order.id || `Order ${index + 1}`}</td>
                                                <td>{getOrderCustomer(order)}</td>
                                                <td>{formatCurrency(getOrderAmount(order))}</td>
                                                <td>{order.status || "Pending"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div className="dashboard-panel">
                        <div className="panel-heading"><h3>Quick Actions</h3></div>
                        <div className="quick-actions">
                            {[
                                ["＋ Add Product", "Add a new store product", "Add Product"],
                                ["▤ Products", "Manage existing products", "Manage Products"],
                                ["🛒 Orders", "View customer orders", "Orders"],
                                ["▣ Inventory", "Check available stock", "Inventory"]
                            ].map(([title, description, page]) => (
                                <button
                                    className="quick-action"
                                    key={page}
                                    onClick={() => selectPage(page)}
                                >
                                    <strong>{title}</strong>
                                    <span>{description}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="dashboard-panel" style={{ marginTop: 20 }}>
                    <div className="panel-heading">
                        <h3>Low Stock Products</h3>
                        <button onClick={() => selectPage("Inventory")}>View Inventory</button>
                    </div>

                    {lowStockProducts.length === 0
                        ? <p>All products have sufficient stock.</p>
                        : lowStockProducts.map(product => (
                            <p key={product.id}>
                                {product.name} — {product.stock || 0} remaining
                            </p>
                        ))}
                </div>
            </>
        );
    };

    // =====================================
    // CROSS-TAB STORAGE REFRESH
    // =====================================

    useEffect(() => {
        const handleStorageChange = event => {
            if (event.key === null || event.key === "konfizProducts") {
                setProducts(readStorage("konfizProducts", []));
            }
            if (event.key === null || event.key === "konfizOrders") {
                setOrders(readStorage("konfizOrders", []));
            }
            if (event.key === null || event.key === "konfizRegisteredCustomers") {
                setCustomers(readStorage("konfizRegisteredCustomers", []));
            }
            if (event.key === null || event.key === "konfizCategories") {
                setCategories(readStorage("konfizCategories", []));
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    // =====================================
    // LOGOUT
    // =====================================

    const handleLogout = () => {
        logout();

        sessionStorage.removeItem("konfizAdminLoggedIn");
        sessionStorage.removeItem("konfizAdminEmail");
        sessionStorage.removeItem("konfizCustomer");

        if (onLogout) onLogout();

        navigate("/", { replace: true });
    };

    // =====================================
    // PAGE SWITCHER
    // =====================================

    const renderPage = () => {
        switch (activePage) {
            case "Dashboard":
                return renderDashboard();

            case "Add Product":
                return (
                    <AddProduct
                        onAddProduct={handleAddProduct}
                        onCancel={() => selectPage("Dashboard")}
                        categories={categories}
                    />
                );

            case "Manage Products":
                return renderManageProducts();

            case "Categories":
                return renderCategories();

            case "Inventory":
                return renderInventory();

            case "Orders":
                return renderOrders();

            case "Customers":
                return renderCustomers();
            case "Blog":
                return <Blog />;

            case "Settings":
                return renderSettings();

            default:
                return renderDashboard();
        }
    };

    if (!isAdmin) return null;

    // =====================================
    // MAIN UI
    // =====================================

    return (
        <div className="admin-layout">
            <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
                <Link to="/" className="admin-brand-link">
                    <div className="admin-brand">KONFIZ<span>.</span></div>
                </Link>

                <div className="admin-brand-sub">MASTER ADMIN PANEL</div>
                <div className="sidebar-label">MAIN MENU</div>

                <div className="sidebar-menu">
                    {navigation.map(item => (
                        <button
                            key={item.name}
                            type="button"
                            className={`sidebar-item ${activePage === item.name ? "active" : ""}`}
                            onClick={() => selectPage(item.name)}
                        >
                            <span className="sidebar-icon">{item.icon}</span>
                            {item.name}
                        </button>
                    ))}
                </div>

                <div className="sidebar-bottom">
                    <button className="admin-logout" type="button" onClick={handleLogout}>
                        ↪ &nbsp; Logout
                    </button>
                </div>
            </aside>

            <main className="admin-main">
                <header className="admin-topbar">
                    <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
                        <button
                            className="mobile-menu"
                            type="button"
                            onClick={() => setSidebarOpen(previous => !previous)}
                        >
                            ☰
                        </button>
                        <div className="topbar-title">{activePage}</div>
                    </div>

                    <div className="admin-profile">
                        <div className="profile-avatar">A</div>
                        <div className="profile-info">
                            <strong>{user?.name || "Master Admin"}</strong>
                            <span>{adminEmail}</span>
                        </div>
                    </div>
                </header>

                <div className="admin-content">
                    {renderPage()}
                </div>



            </main>


            {/* =====================================
                    EDIT PRODUCT MODAL
                ===================================== */}

            {showEditModal && editForm && (
                <div className="edit-modal-overlay">
                    <div className="edit-modal edit-modal-large">

                        {/* HEADER */}
                        <div className="edit-modal-header">
                            <div>
                                <h2>Edit Product</h2>
                                <p>Update your KONFiZ product information.</p>
                            </div>

                            <button type="button" onClick={closeEditModal}>
                                ✕
                            </button>
                        </div>

                        <form onSubmit={saveEditedProduct}>

                            {/* BASIC INFORMATION */}
                            <section className="edit-form-section">
                                <h3>Basic Product Information</h3>

                                <div className="form-grid">

                                    <div className="form-group">
                                        <label>Product Name *</label>
                                        <input
                                            name="name"
                                            value={editForm.name}
                                            onChange={handleEditChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Product SKU *</label>
                                        <input
                                            name="sku"
                                            value={editForm.sku}
                                            onChange={handleEditChange}
                                            placeholder="KON-BIS-001"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Main Category *</label>
                                        <select
                                            value={editForm.categoryId}
                                            onChange={handleEditCategoryChange}
                                            required
                                        >
                                            <option value="">Select Category</option>

                                            {categories.map(category => (
                                                <option
                                                    key={getCatId(category)}
                                                    value={getCatId(category)}
                                                >
                                                    {getCatName(category)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Subcategories (Maximum 2)</label>

                                        <div className="subcategory-checkbox-list">

                                            {editSubcategories.length ? (
                                                editSubcategories.map(subcategory => {
                                                    const id = getSubId(subcategory);

                                                    return (
                                                        <label
                                                            key={id}
                                                            className="subcategory-checkbox-item"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={(
                                                                    editForm.subcategoryIds || []
                                                                ).includes(id)}
                                                                disabled={
                                                                    !(editForm.subcategoryIds || []).includes(id) &&
                                                                    (editForm.subcategoryIds || []).length >= 2
                                                                }
                                                                onChange={() =>
                                                                    handleEditSubcategoryToggle(id)
                                                                }
                                                            />

                                                            <span>{getSubName(subcategory)}</span>
                                                        </label>
                                                    );
                                                })
                                            ) : (
                                                <small>
                                                    No subcategories available.
                                                </small>
                                            )}

                                        </div>
                                    </div>

                                    <div className="form-group full-width">
                                        <label>Flavours *</label>
                                        <input
                                            name="flavour"
                                            value={editForm.flavour}
                                            onChange={handleEditChange}
                                            placeholder="Belgian Chocolate, Vanilla, Strawberry"
                                            required
                                        />
                                        <small>Separate multiple flavours with commas.</small>
                                    </div>

                                    <div className="form-group full-width">
                                        <label className="addon-toggle">
                                            <input
                                                type="checkbox"
                                                checked={editForm.isPremium}
                                                onChange={e =>
                                                    setEditForm(previous => ({
                                                        ...previous,
                                                        isPremium: e.target.checked
                                                    }))
                                                }
                                            />
                                            <span>Premium Product</span>
                                        </label>
                                    </div>

                                </div>
                            </section>

                            {/* DESCRIPTION */}
                            <section className="edit-form-section">
                                <h3>Product Description</h3>

                                <div className="form-group">
                                    <label>Complete Product Description *</label>
                                    <textarea
                                        name="description"
                                        rows="8"
                                        value={editForm.description}
                                        onChange={handleEditChange}
                                        required
                                    />
                                </div>

                                <div className="form-grid">

                                    <div className="form-group">
                                        <label>Product Rating (0–5)</label>
                                        <input
                                            type="number"
                                            name="rating"
                                            min="0"
                                            max="5"
                                            step="0.1"
                                            value={editForm.rating}
                                            onChange={handleEditChange}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Available Stock</label>
                                        <input
                                            type="number"
                                            name="stock"
                                            min="0"
                                            step="1"
                                            value={editForm.stock}
                                            onChange={handleEditChange}
                                        />
                                    </div>

                                    <div className="form-group full-width">
                                        <label>Serving Suggestion</label>
                                        <textarea
                                            name="servingSuggestion"
                                            rows="3"
                                            value={editForm.servingSuggestion}
                                            onChange={handleEditChange}
                                            placeholder="Enter serving instructions..."
                                        />
                                    </div>

                                </div>
                            </section>

                            {/* PRODUCT IMAGES */}
                            <section className="edit-form-section">
                                <h3>Product Images</h3>

                                <div className="form-group">
                                    <label>Main Product Image *</label>

                                    <input
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        onChange={handleEditMainImage}
                                    />

                                    {editForm.image && (
                                        <div className="product-image-preview main-image-preview">
                                            <img
                                                src={editForm.image}
                                                alt="Main product"
                                            />

                                            <span>Main Image</span>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setEditForm(previous => ({
                                                        ...previous,
                                                        image: "",
                                                        images: previous.images.filter(
                                                            image => image !== previous.image
                                                        )
                                                    }))
                                                }
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>Additional Images (Maximum 4)</label>

                                    <input
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        multiple
                                        disabled={
                                            editForm.images.filter(
                                                image => image !== editForm.image
                                            ).length >= 4
                                        }
                                        onChange={handleEditGalleryImages}
                                    />

                                    <small>
                                        {editForm.images.filter(
                                            image => image !== editForm.image
                                        ).length}/4 additional images
                                    </small>

                                    <div className="product-gallery-preview">

                                        {editForm.images
                                            .filter(image => image !== editForm.image)
                                            .map((image, index) => (
                                                <div
                                                    className="product-image-preview"
                                                    key={index}
                                                >
                                                    <img
                                                        src={image}
                                                        alt={`Gallery ${index + 1}`}
                                                    />

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeEditGalleryImage(image)
                                                        }
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ))}

                                    </div>
                                </div>
                            </section>

                            {/* PACK SIZE AND PRICING */}
                            <section className="edit-form-section">
                                <h3>Unit, Pack Size & Pricing</h3>

                                <div className="form-group">
                                    <label>Measurement Unit *</label>

                                    <select
                                        value={editForm.unit}
                                        onChange={e =>
                                            setEditForm(previous => ({
                                                ...previous,
                                                unit: e.target.value,
                                                sizes: previous.sizes.map(size => ({
                                                    ...size,
                                                    unit: e.target.value
                                                }))
                                            }))
                                        }
                                    >
                                        <option value="ml">Millilitre (ml)</option>
                                        <option value="g">Gram (g)</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Available Pack Sizes</label>

                                    <div className="pack-size-admin-list">

                                        {editForm.sizes.map(size => (
                                            <div
                                                className="pack-size-admin-item"
                                                key={size.weight}
                                            >
                                                <strong>
                                                    {size.weight} {editForm.unit}
                                                </strong>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeEditWeight(size.weight)
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
                                            id="editCustomWeight"
                                            placeholder={`Enter size in ${editForm.unit}`}
                                        />

                                        <button
                                            type="button"
                                            onClick={() => {
                                                const input = document.getElementById(
                                                    "editCustomWeight"
                                                );

                                                addEditWeight(input.value);
                                                input.value = "";
                                            }}
                                        >
                                            + Add Pack Size
                                        </button>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <h4>Individual Price Configuration</h4>

                                    <div className="pack-price-preview">

                                        <div className="price-config-header">
                                            <strong>Pack Size</strong>
                                            <strong>Regular Price (₹)</strong>
                                            <strong>Offer Price (₹)</strong>
                                        </div>

                                        {editForm.sizes.map(size => (
                                            <div
                                                className="price-config-row"
                                                key={size.weight}
                                            >
                                                <strong>
                                                    {size.weight} {editForm.unit}
                                                </strong>

                                                <input
                                                    type="number"
                                                    min="0.01"
                                                    step="0.01"
                                                    value={size.price}
                                                    placeholder="Regular price"
                                                    onChange={e =>
                                                        handleEditSizePrice(
                                                            size.weight,
                                                            "price",
                                                            e.target.value
                                                        )
                                                    }
                                                />

                                                <input
                                                    type="number"
                                                    min="0.01"
                                                    step="0.01"
                                                    value={size.offerPrice}
                                                    placeholder="Offer price"
                                                    onChange={e =>
                                                        handleEditSizePrice(
                                                            size.weight,
                                                            "offerPrice",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </div>
                                        ))}

                                    </div>
                                </div>
                            </section>

                            {/* ADDONS */}
                            <section className="edit-form-section">

                                <div className="addon-section-heading">
                                    <div>
                                        <h3>Optional Product Add-ons</h3>
                                        <p className="section-description">
                                            Manage extras available to customers.
                                        </p>
                                    </div>

                                    <label className="addon-toggle">
                                        <input
                                            type="checkbox"
                                            checked={editForm.hasAddons}
                                            onChange={e =>
                                                setEditForm(previous => ({
                                                    ...previous,
                                                    hasAddons: e.target.checked
                                                }))
                                            }
                                        />
                                        <span>Enable Add-ons</span>
                                    </label>
                                </div>

                                {editForm.hasAddons && (
                                    <>
                                        {editForm.addons.map((addon, index) => (
                                            <div
                                                className="edit-addon-row"
                                                key={addon.id || index}
                                            >
                                                <input
                                                    type="text"
                                                    placeholder="Add-on name"
                                                    value={addon.name}
                                                    onChange={e =>
                                                        updateAddon(
                                                            index,
                                                            "name",
                                                            e.target.value
                                                        )
                                                    }
                                                />

                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    placeholder="Price ₹"
                                                    value={addon.price}
                                                    onChange={e =>
                                                        updateAddon(
                                                            index,
                                                            "price",
                                                            e.target.value
                                                        )
                                                    }
                                                />

                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        checked={addon.active !== false}
                                                        onChange={e =>
                                                            updateAddon(
                                                                index,
                                                                "active",
                                                                e.target.checked
                                                            )
                                                        }
                                                    />
                                                    Active
                                                </label>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeEditAddon(index)
                                                    }
                                                >  Remove </button>
                                            </div>
                                        ))}

                                        <button
                                            type="button"
                                            onClick={addEditAddon}
                                        >     + Add Add-on </button>
                                    </>
                                )}

                                {!editForm.hasAddons && (
                                    <p className="addon-disabled-note">
                                        Add-ons are disabled for this product.
                                    </p>
                                )}
                            </section>

                            {/* PRODUCT STATUS */}
                            <section className="edit-form-section">
                                <h3>Product Status</h3>

                                <div className="form-group">
                                    <label>Availability Status</label>

                                    <select
                                        name="status"
                                        value={editForm.status}
                                        onChange={handleEditChange}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </section>

                            {/* ACTIONS */}
                            <div className="edit-modal-actions">

                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                >  Cancel  </button>
                                <button type="submit">     Save Changes </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}

export default Dashboard;