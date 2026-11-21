
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import "../../style/dashboard.css";
import AddProduct from "./addproduct";

// =====================================
// STORAGE HELPERS
// =====================================

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
    const navigate = useNavigate();

    const isAdmin =
        user?.authenticated === true &&
        String(user?.role || "").toLowerCase() === "admin";

    useEffect(() => {
        if (!isAdmin) navigate("/", { replace: true });
    }, [isAdmin, navigate]);

    const adminEmail = user?.email || "admin@konfiz.com";

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

    const [products, setProducts] = useState(() =>
        readStorage("konfizProducts", [])
    );

    useEffect(() => {
        saveStorage("konfizProducts", products);
    }, [products]);

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

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    deleteSubcategory(
                                                        categoryId,
                                                        getSubId(subcategory)
                                                    )
                                                }
                                            >
                                                ×
                                            </button>
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
        const matchingCategory = categories.find(category =>
            getCatName(category).toLowerCase() ===
            String(product.category || "").toLowerCase()
        );

        const categoryId =
            product.categoryId ||
            (matchingCategory ? getCatId(matchingCategory) : "");

        const categoryObject = categories.find(
            category => getCatId(category) === String(categoryId)
        );

        const subcategories = categoryObject && typeof categoryObject !== "string"
            ? categoryObject.subcategories || []
            : [];

        const matchingSubcategory = subcategories.find(item =>
            getSubName(item).toLowerCase() ===
            String(product.subcategory || product.subcategoryName || "").toLowerCase()
        );

        setEditProduct(product);

        setEditForm({
            ...product,
            name: product.name || "",
            description: product.description || "",
            price: product.price ?? 0,
            categoryId: String(categoryId || ""),
            category: product.category || (categoryObject ? getCatName(categoryObject) : ""),
            subcategoryId: String(
                product.subcategoryId ||
                (matchingSubcategory ? getSubId(matchingSubcategory) : "")
            ),
            subcategory: product.subcategory || product.subcategoryName || "",
            flavour: product.flavour || product.flavor || "",
            rating: product.rating ?? 0,
            stock: product.stock ?? 0,
            image: product.image || "",
            pricing: {
                unit: product.pricing?.unit || "ml",
                baseQuantity: product.pricing?.baseQuantity ?? 100,
                pricePerBaseUnit: product.pricing?.pricePerBaseUnit ?? product.price ?? 0,
                weightOptions: Array.isArray(product.pricing?.weightOptions)
                    ? [...product.pricing.weightOptions]
                    : [100, 250, 500, 1000]
            },
            addons: Array.isArray(product.addons)
                ? product.addons.map(item => ({ ...item }))
                : []
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

    const handleEditSubcategoryChange = (e) => {
        const subcategoryId = e.target.value;
        const category = categories.find(
            item => getCatId(item) === editForm.categoryId
        );

        const subcategories = category && typeof category !== "string"
            ? category.subcategories || []
            : [];

        const subcategory = subcategories.find(
            item => getSubId(item) === subcategoryId
        );

        const name = subcategory ? getSubName(subcategory) : "";

        setEditForm(previous => ({
            ...previous,
            subcategoryId,
            subcategory: name,
            subcategoryName: name
        }));
    };

    const handleEditPricingChange = (e) => {
        const { name, value } = e.target;

        setEditForm(previous => ({
            ...previous,
            pricing: {
                ...previous.pricing,
                [name]: value
            }
        }));
    };

    const handleEditWeightOptions = (value) => {
        setEditForm(previous => ({
            ...previous,
            pricing: {
                ...previous.pricing,
                weightOptions: value
                    .split(",")
                    .map(item => Number(item.trim()))
                    .filter(item => Number.isFinite(item) && item > 0)
            }
        }));
    };

    const updateAddon = (index, field, value) => {
        setEditForm(previous => ({
            ...previous,
            addons: previous.addons.map((addon, i) =>
                i === index
                    ? {
                        ...addon,
                        [field]: field === "price" ? value : value
                    }
                    : addon
            )
        }));
    };

    const addEditAddon = () => {
        setEditForm(previous => ({
            ...previous,
            addons: [
                ...previous.addons,
                {
                    id: `ADD-${Date.now()}`,
                    name: "",
                    price: 0
                }
            ]
        }));
    };

    const removeEditAddon = (index) => {
        setEditForm(previous => ({
            ...previous,
            addons: previous.addons.filter((_, i) => i !== index)
        }));
    };

    const saveEditedProduct = (e) => {
        e.preventDefault();

        if (!editProduct || !editForm) return;

        if (!String(editForm.name || "").trim()) {
            alert("Product name is required.");
            return;
        }

        const price = Number(editForm.price);
        const stock = Number(editForm.stock);
        const rating = Number(editForm.rating);

        if (!Number.isFinite(price) || price < 0) {
            alert("Please enter a valid product price.");
            return;
        }

        if (!Number.isFinite(stock) || stock < 0) {
            alert("Please enter a valid stock quantity.");
            return;
        }

        if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
            alert("Rating must be between 0 and 5.");
            return;
        }

        const updatedProduct = {
            ...editProduct,
            ...editForm,
            id: editProduct.id,
            name: editForm.name.trim(),
            price,
            stock,
            rating,
            categoryId: editForm.categoryId,
            category: editForm.category,
            subcategoryId: editForm.subcategoryId,
            subcategory: editForm.subcategory,
            subcategoryName: editForm.subcategory,
            flavour: editForm.flavour,
            description: editForm.description,
            image: editForm.image,
            pricing: {
                ...editForm.pricing,
                unit: editForm.pricing.unit || "ml",
                baseQuantity: Number(editForm.pricing.baseQuantity) || 100,
                pricePerBaseUnit:
                    Number(editForm.pricing.pricePerBaseUnit) || 0,
                weightOptions: editForm.pricing.weightOptions
            },
            addons: editForm.addons.map(addon => ({
                ...addon,
                name: String(addon.name || "").trim(),
                price: Number(addon.price) || 0
            })).filter(addon => addon.name)
        };

        setProducts(previous =>
            previous.map(product =>
                String(product.id) === String(editProduct.id)
                    ? updatedProduct
                    : product
            )
        );

        closeEditModal();
        alert("Product updated successfully.");
    };

    const editCategory = categories.find(
        category => getCatId(category) === String(editForm?.categoryId || "")
    );

    const editSubcategories = editCategory && typeof editCategory !== "string"
        ? editCategory.subcategories || []
        : [];

    // =====================================
    // MANAGE PRODUCTS
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

                    <button
                        type="button"
                        className="manage-add-product-btn"
                        onClick={() => selectPage("Add Product")}
                    >
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

                    {products.length === 0 ? (
                        <div className="manage-products-empty">
                            <div className="manage-empty-icon">🍨</div>
                            <h3>Your catalogue is empty</h3>
                            <p>Start adding delicious flavours to your KONFiZ store.</p>
                            <button onClick={() => selectPage("Add Product")}>
                                Add Your First Product
                            </button>
                        </div>
                    ) : filteredProducts.length === 0 ? (
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
                FULL PRODUCT EDIT POPUP
            ===================================== */}

            {showEditModal && editForm && (
                <div
                    className="edit-product-overlay"
                    onMouseDown={e => {
                        if (e.target === e.currentTarget) closeEditModal();
                    }}
                >
                    <div
                        className="edit-product-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="edit-product-title"
                    >
                        <div className="edit-product-header">
                            <div>
                                <h2 id="edit-product-title">Edit Product</h2>
                                <p>Update all product information.</p>
                            </div>

                            <button type="button" onClick={closeEditModal}>×</button>
                        </div>

                        <form onSubmit={saveEditedProduct}>
                            <div className="edit-product-body">

                                <h3>Basic Information</h3>

                                <div className="edit-form-group">
                                    <label>Product Name *</label>
                                    <input
                                        name="name"
                                        value={editForm.name}
                                        onChange={handleEditChange}
                                        required
                                    />
                                </div>

                                <div className="edit-form-group">
                                    <label>Description</label>
                                    <textarea
                                        name="description"
                                        value={editForm.description}
                                        onChange={handleEditChange}
                                        rows="3"
                                    />
                                </div>

                                <div className="edit-form-row">
                                    <div className="edit-form-group">
                                        <label>Main Category</label>
                                        <select
                                            value={editForm.categoryId}
                                            onChange={handleEditCategoryChange}
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

                                    <div className="edit-form-group">
                                        <label>Subcategory</label>
                                        <select
                                            value={editForm.subcategoryId}
                                            onChange={handleEditSubcategoryChange}
                                            disabled={!editForm.categoryId}
                                        >
                                            <option value="">Select Subcategory</option>
                                            {editSubcategories.map(subcategory => (
                                                <option
                                                    key={getSubId(subcategory)}
                                                    value={getSubId(subcategory)}
                                                >
                                                    {getSubName(subcategory)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="edit-form-row">
                                    <div className="edit-form-group">
                                        <label>Flavour</label>
                                        <input
                                            name="flavour"
                                            value={editForm.flavour}
                                            onChange={handleEditChange}
                                        />
                                    </div>

                                    <div className="edit-form-group">
                                        <label>Rating (0–5)</label>
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
                                </div>

                                <h3>Price and Inventory</h3>

                                <div className="edit-form-row">
                                    <div className="edit-form-group">
                                        <label>Starting Price (₹) *</label>
                                        <input
                                            type="number"
                                            name="price"
                                            min="0"
                                            step="0.01"
                                            value={editForm.price}
                                            onChange={handleEditChange}
                                            required
                                        />
                                    </div>

                                    <div className="edit-form-group">
                                        <label>Stock Quantity</label>
                                        <input
                                            type="number"
                                            name="stock"
                                            min="0"
                                            step="1"
                                            value={editForm.stock}
                                            onChange={handleEditChange}
                                        />
                                    </div>
                                </div>

                                <h3>Product Image</h3>

                                <div className="edit-form-group">
                                    <label>Image URL or Base64</label>
                                    <input
                                        name="image"
                                        value={editForm.image}
                                        onChange={handleEditChange}
                                        placeholder="Paste image URL or Base64 data"
                                    />

                                    {editForm.image && (
                                        <img
                                            src={editForm.image}
                                            alt="Product preview"
                                            className="edit-product-preview"
                                        />
                                    )}
                                </div>

                                <h3>Weight / Size Pricing</h3>

                                <div className="edit-form-row">
                                    <div className="edit-form-group">
                                        <label>Pricing Unit</label>
                                        <select
                                            name="unit"
                                            value={editForm.pricing.unit}
                                            onChange={handleEditPricingChange}
                                        >
                                            <option value="ml">ml</option>
                                            <option value="g">g</option>
                                        </select>
                                    </div>

                                    <div className="edit-form-group">
                                        <label>Base Quantity</label>
                                        <input
                                            type="number"
                                            min="1"
                                            name="baseQuantity"
                                            value={editForm.pricing.baseQuantity}
                                            onChange={handleEditPricingChange}
                                        />
                                    </div>
                                </div>

                                <div className="edit-form-group">
                                    <label>Price Per Base Quantity (₹)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        name="pricePerBaseUnit"
                                        value={editForm.pricing.pricePerBaseUnit}
                                        onChange={handleEditPricingChange}
                                    />
                                </div>

                                <div className="edit-form-group">
                                    <label>Weight Options (comma separated)</label>
                                    <input
                                        value={editForm.pricing.weightOptions.join(", ")}
                                        onChange={e => handleEditWeightOptions(e.target.value)}
                                        placeholder="100, 250, 500, 1000"
                                    />
                                    <small>Example: 100, 250, 500, 1000</small>
                                </div>

                                <h3>Add-ons</h3>

                                {editForm.addons.map((addon, index) => (
                                    <div className="edit-addon-row" key={addon.id || index}>
                                        <input
                                            value={addon.name || ""}
                                            placeholder="Add-on name"
                                            onChange={e =>
                                                updateAddon(index, "name", e.target.value)
                                            }
                                        />

                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={addon.price ?? 0}
                                            placeholder="Price"
                                            onChange={e =>
                                                updateAddon(index, "price", Number(e.target.value))
                                            }
                                        />

                                        <button
                                            type="button"
                                            onClick={() => removeEditAddon(index)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    className="edit-add-addon-btn"
                                    onClick={addEditAddon}
                                >
                                    + Add New Add-on
                                </button>
                            </div>

                            <div className="edit-product-footer">
                                <button
                                    type="button"
                                    className="edit-cancel-btn"
                                    onClick={closeEditModal}
                                >
                                    Cancel
                                </button>

                                <button type="submit" className="edit-save-btn">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;
