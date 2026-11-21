
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

const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2
    });
};

const getOrderAmount = (order) => {
    return Number(
        order.grandTotal ??
        order.totalAmount ??
        order.total ??
        order.amount ??
        0
    );
};

const getOrderCustomer = (order) => {
    return (
        order.customerName ||
        order.customer?.name ||
        order.name ||
        order.customerEmail ||
        order.email ||
        "Customer"
    );
};

// =====================================
// DASHBOARD COMPONENT
// =====================================

function Dashboard({ onLogout }) {

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // =====================================
    // ADMIN SECURITY
    // =====================================

    const isAdmin =
        user?.authenticated === true &&
        user?.role?.toLowerCase() === "admin";

    useEffect(() => {
        if (!isAdmin) {
            navigate("/", { replace: true });
        }
    }, [isAdmin, navigate]);

    const adminEmail = user?.email || "admin@konfiz.com";

    // =====================================
    // SIDEBAR
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

        setProducts((previous) => [...previous, product]);
        selectPage("Manage Products");
    };

    const handleDeleteProduct = (id) => {
        if (!window.confirm("Are you sure you want to delete this product?")) {
            return;
        }

        setProducts((previous) =>
            previous.filter((product) => product.id !== id)
        );
    };

    const handleEditProduct = (product) => {
        const newName = window.prompt(
            "Enter product name:",
            product.name || ""
        );

        if (newName === null || !newName.trim()) {
            return;
        }

        const newPrice = window.prompt(
            "Enter product price:",
            product.price ?? 0
        );

        if (newPrice === null || newPrice.trim() === "") {
            return;
        }

        if (!Number.isFinite(Number(newPrice)) || Number(newPrice) < 0) {
            alert("Please enter a valid product price.");
            return;
        }

        setProducts((previous) =>
            previous.map((item) =>
                item.id === product.id
                    ? {
                        ...item,
                        name: newName.trim(),
                        price: Number(newPrice)
                    }
                    : item
            )
        );
    };

    // =====================================
    // CATEGORIES
    // =====================================

    const [categories, setCategories] = useState(() =>
        readStorage("konfizCategories", [])
    );

    const [newCategory, setNewCategory] = useState("");

    useEffect(() => {
        saveStorage("konfizCategories", categories);
    }, [categories]);

    const addCategory = () => {
        const name = newCategory.trim();

        if (!name) {
            alert("Enter a category name.");
            return;
        }

        const exists = categories.some(
            (category) =>
                (typeof category === "string"
                    ? category
                    : category.name
                )?.toLowerCase() === name.toLowerCase()
        );

        if (exists) {
            alert("This category already exists.");
            return;
        }

        setCategories((previous) => [
            ...previous,
            {
                id: `CAT-${Date.now()}`,
                name
            }
        ]);

        setNewCategory("");
    };

    const deleteCategory = (id) => {
        const category = categories.find(
            (item) => item.id === id
        );

        const categoryName =
            typeof category === "string"
                ? category
                : category?.name;

        const used = products.some(
            (product) =>
                product.category?.toLowerCase() ===
                categoryName?.toLowerCase()
        );

        if (used) {
            alert("This category is currently used by a product.");
            return;
        }

        if (!window.confirm("Delete this category?")) {
            return;
        }

        setCategories((previous) =>
            previous.filter((item) => item.id !== id)
        );
    };

    // =====================================
    // ORDERS
    // =====================================

    const [orders, setOrders] = useState(() =>
        readStorage("konfizOrders", [])
    );

    useEffect(() => {
        saveStorage("konfizOrders", orders);
    }, [orders]);

    const updateOrderStatus = (orderId, status) => {
        setOrders((previous) =>
            previous.map((order) =>
                String(order.id || order.orderId) === String(orderId)
                    ? { ...order, status }
                    : order
            )
        );
    };

    // =====================================
    // CUSTOMERS
    // =====================================

    const [customers, setCustomers] = useState(() =>
        readStorage("konfizRegisteredCustomers", [])
    );

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
        setSettings((previous) => ({
            ...previous,
            [field]: value
        }));
    };

    // =====================================
    // INVENTORY
    // =====================================

    const updateStock = (product, amount) => {
        const newStock = Number(amount);

        if (!Number.isFinite(newStock) || newStock < 0) {
            alert("Stock cannot be negative.");
            return;
        }

        setProducts((previous) =>
            previous.map((item) =>
                item.id === product.id
                    ? { ...item, stock: newStock }
                    : item
            )
        );
    };

    // =====================================
    // DASHBOARD STATISTICS
    // =====================================

    const totalProducts = products.length;
    const totalOrders = orders.length;
    const totalCustomers = customers.length;

    const totalRevenue = orders
        .filter((order) =>
            ["delivered", "completed"].includes(
                String(order.status || "").toLowerCase()
            )
        )
        .reduce(
            (total, order) => total + getOrderAmount(order),
            0
        );

    const lowStockProducts = products.filter(
        (product) => Number(product.stock || 0) <= 5
    );

    const stats = [
        {
            title: "Total Products",
            value: totalProducts,
            change: "Products in store",
            icon: "▤"
        },
        {
            title: "Total Orders",
            value: totalOrders,
            change: "Orders received",
            icon: "🛒"
        },
        {
            title: "Total Customers",
            value: totalCustomers,
            change: "Registered customers",
            icon: "♙"
        },
        {
            title: "Total Revenue",
            value: formatCurrency(totalRevenue),
            change: "Completed orders",
            icon: "₹"
        }
    ];

    const recentOrders = useMemo(() => {
        return [...orders].slice(-5).reverse();
    }, [orders]);

    // =====================================
    // CROSS-TAB DATA REFRESH
    // =====================================

    useEffect(() => {
        const handleStorageChange = (event) => {

            if (event.key === null || event.key === "konfizProducts") {
                setProducts(readStorage("konfizProducts", []));
            }

            if (event.key === null || event.key === "konfizOrders") {
                setOrders(readStorage("konfizOrders", []));
            }

            if (
                event.key === null ||
                event.key === "konfizRegisteredCustomers"
            ) {
                setCustomers(
                    readStorage("konfizRegisteredCustomers", [])
                );
            }

            if (event.key === null || event.key === "konfizCategories") {
                setCategories(readStorage("konfizCategories", []));
            }
        };

        window.addEventListener("storage", handleStorageChange);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);

    // =====================================
    // GLOBAL LOGOUT
    // =====================================

    const handleLogout = () => {
        logout();

        sessionStorage.removeItem("konfizAdminLoggedIn");
        sessionStorage.removeItem("konfizAdminEmail");
        sessionStorage.removeItem("konfizCustomer");

        if (onLogout) {
            onLogout();
        }

        navigate("/", { replace: true });
    };

    // =====================================
    // REUSABLE PAGE HEADER
    // =====================================

    const pageHeader = (title, description) => (
        <div className="welcome-section">
            <div>
                <h2>{title}</h2>
                <p>{description}</p>
            </div>
        </div>
    );

    // =====================================
    // DASHBOARD HOME
    // =====================================

    const renderDashboard = () => (
        <>
            <div className="welcome-section">
                <div>
                    <h2>Welcome to KONFIZ</h2>
                    <p>
                        Here's what's happening with your store today.
                    </p>
                </div>

                <button
                    className="primary-btn"
                    onClick={() => selectPage("Add Product")}
                >
                    + Add New Product
                </button>
            </div>

            <div className="stats-grid">
                {stats.map((stat) => (
                    <div className="stat-card" key={stat.title}>
                        <div className="stat-top">
                            <span className="stat-title">
                                {stat.title}
                            </span>

                            <div className="stat-icon">
                                {stat.icon}
                            </div>
                        </div>

                        <div className="stat-value">
                            {stat.value}
                        </div>

                        <div className="stat-change">
                            {stat.change}
                        </div>
                    </div>
                ))}
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-panel">
                    <div className="panel-heading">
                        <h3>Recent Orders</h3>

                        <button
                            type="button"
                            onClick={() => selectPage("Orders")}
                        >
                            View All
                        </button>
                    </div>

                    {recentOrders.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">🛒</div>
                            <strong>No orders yet</strong>
                            <span>
                                Customer orders will appear here.
                            </span>
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
                                            <td>
                                                {order.orderId || order.id || `Order ${index + 1}`}
                                            </td>
                                            <td>{getOrderCustomer(order)}</td>
                                            <td>
                                                {formatCurrency(getOrderAmount(order))}
                                            </td>
                                            <td>{order.status || "Pending"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="dashboard-panel">
                    <div className="panel-heading">
                        <h3>Quick Actions</h3>
                    </div>

                    <div className="quick-actions">
                        <button
                            className="quick-action"
                            onClick={() => selectPage("Add Product")}
                        >
                            <strong>＋ Add Product</strong>
                            <span>Add a new store product</span>
                        </button>

                        <button
                            className="quick-action"
                            onClick={() => selectPage("Manage Products")}
                        >
                            <strong>▤ Products</strong>
                            <span>Manage existing products</span>
                        </button>

                        <button
                            className="quick-action"
                            onClick={() => selectPage("Orders")}
                        >
                            <strong>🛒 Orders</strong>
                            <span>View customer orders</span>
                        </button>

                        <button
                            className="quick-action"
                            onClick={() => selectPage("Inventory")}
                        >
                            <strong>▣ Inventory</strong>
                            <span>Check available stock</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="dashboard-panel" style={{ marginTop: 20 }}>
                <div className="panel-heading">
                    <h3>Low Stock Products</h3>
                    <button onClick={() => selectPage("Inventory")}>
                        View Inventory
                    </button>
                </div>

                {lowStockProducts.length === 0 ? (
                    <p>All products have sufficient stock.</p>
                ) : (
                    lowStockProducts.map((product) => (
                        <p key={product.id}>
                            {product.name} — {product.stock || 0} remaining
                        </p>
                    ))
                )}
            </div>
        </>
    );

    // =====================================
    // MANAGE PRODUCTS
    // =====================================
const [productSearch, setProductSearch] = useState("");
const [productCategoryFilter, setProductCategoryFilter] = useState("All");
const [productStockFilter, setProductStockFilter] = useState("All");
const [productSort, setProductSort] = useState("newest");
 const renderManageProducts = () => {
    const categoriesList = [
        ...new Set(
            products
                .map((product) => product.category)
                .filter(Boolean)
        ),
    ];

    const filteredProducts = products
        .filter((product) => {
            const search = productSearch.toLowerCase();

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

    const totalProducts = products.length;
    const inStockProducts = products.filter(
        (product) => Number(product.stock ?? 0) > 5
    ).length;
    const lowStockProductsCount = products.filter((product) => {
        const stock = Number(product.stock ?? 0);
        return stock > 0 && stock <= 5;
    }).length;
    const outOfStockProducts = products.filter(
        (product) => Number(product.stock ?? 0) === 0
    ).length;

    return (
        <div className="manage-products-page">

            {/* PAGE HEADER */}
            <div className="manage-products-header">
                <div>
                    <span className="manage-products-eyebrow">
                        KONFiZ STORE / CATALOGUE
                    </span>

                    <h2>Manage Products</h2>

                    <p>
                        Organise your ice cream collection, update product
                        details and manage your catalogue.
                    </p>
                </div>

                <button
                    type="button"
                    className="manage-add-product-btn"
                    onClick={() => selectPage("Add Product")}
                >
                    <span>＋</span>
                    Add New Product
                </button>
            </div>

            {/* OVERVIEW CARDS */}
            <div className="manage-product-stats">

                <div className="manage-product-stat">
                    <div className="manage-stat-icon pink">🍦</div>
                    <div>
                        <span>Total Products</span>
                        <h3>{totalProducts}</h3>
                    </div>
                </div>

                <div className="manage-product-stat">
                    <div className="manage-stat-icon green">✓</div>
                    <div>
                        <span>In Stock</span>
                        <h3>{inStockProducts}</h3>
                    </div>
                </div>

                <div className="manage-product-stat">
                    <div className="manage-stat-icon orange">⚠</div>
                    <div>
                        <span>Low Stock</span>
                        <h3>{lowStockProductsCount}</h3>
                    </div>
                </div>

                <div className="manage-product-stat">
                    <div className="manage-stat-icon red">×</div>
                    <div>
                        <span>Out of Stock</span>
                        <h3>{outOfStockProducts}</h3>
                    </div>
                </div>

            </div>

            {/* PRODUCT CATALOGUE */}
            <div className="manage-catalogue-card">

                <div className="manage-catalogue-heading">
                    <div>
                        <h3>Product Catalogue</h3>
                        <p>
                            View and manage all products available in your store.
                        </p>
                    </div>

                    <span className="manage-product-count">
                        {filteredProducts.length} Products
                    </span>
                </div>

                {/* TOOLBAR */}
                <div className="manage-product-toolbar">

                    <div className="manage-product-search">
                        <span>⌕</span>
                        <input
                            type="text"
                            placeholder="Search by product name or ID..."
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                        />
                    </div>

                    <select
                        value={productCategoryFilter}
                        onChange={(e) => setProductCategoryFilter(e.target.value)}
                    >
                        <option value="All">All Categories</option>

                        {categoriesList.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>

                    <select
                        value={productStockFilter}
                        onChange={(e) => setProductStockFilter(e.target.value)}
                    >
                        <option value="All">All Stock Status</option>
                        <option value="In Stock">In Stock</option>
                        <option value="Low Stock">Low Stock</option>
                        <option value="Out of Stock">Out of Stock</option>
                    </select>

                    <select
                        value={productSort}
                        onChange={(e) => setProductSort(e.target.value)}
                    >
                        <option value="newest">Default Order</option>
                        <option value="name">Name: A to Z</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                    </select>

                </div>

                {/* PRODUCT GRID */}
                {products.length === 0 ? (

                    <div className="manage-products-empty">
                        <div className="manage-empty-icon">🍨</div>
                        <h3>Your catalogue is empty</h3>
                        <p>
                            Start adding delicious flavours to your KONFiZ store.
                        </p>

                        <button
                            type="button"
                            onClick={() => selectPage("Add Product")}
                        >
                            Add Your First Product
                        </button>
                    </div>

                ) : filteredProducts.length === 0 ? (

                    <div className="manage-products-empty">
                        <div className="manage-empty-icon">🔍</div>
                        <h3>No matching products</h3>
                        <p>Try changing your search or filters.</p>

                        <button
                            type="button"
                            onClick={() => {
                                setProductSearch("");
                                setProductCategoryFilter("All");
                                setProductStockFilter("All");
                                setProductSort("newest");
                            }}
                        >
                            Clear Filters
                        </button>
                    </div>

                ) : (

                    <div className="manage-products-grid">

                        {filteredProducts.map((product) => {
                            const stock = Number(product.stock ?? 0);

                            const stockStatus =
                                stock === 0
                                    ? "out"
                                    : stock <= 5
                                        ? "low"
                                        : "available";

                            return (
                                <div
                                    className="manage-product-card"
                                    key={product.id}
                                >

                                    {/* IMAGE */}
                                    <div className="manage-product-image">

                                        {product.image ? (
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                            />
                                        ) : (
                                            <div className="manage-product-placeholder">
                                                🍦
                                            </div>
                                        )}

                                        <span
                                            className={`manage-stock-badge ${stockStatus}`}
                                        >
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

                                    {/* DETAILS */}
                                    <div className="manage-product-details">

                                        <div className="manage-product-title-row">
                                            <h3>{product.name}</h3>
                                            <span className="manage-product-rating">
                                                ⭐ {product.rating || "N/A"}
                                            </span>
                                        </div>

                                        <p className="manage-product-description">
                                            {product.description ||
                                                "A delicious KONFiZ ice cream flavour."}
                                        </p>

                                        <div className="manage-product-meta">
                                            <span>
                                                Product ID
                                                <strong>{product.id}</strong>
                                            </span>

                                            <span>
                                                Available Stock
                                                <strong>{stock} units</strong>
                                            </span>
                                        </div>

                                        <div className="manage-product-card-footer">

                                            <div className="manage-product-price">
                                                <small>Starting from</small>
                                                <strong>
                                                    {formatCurrency(product.price)}
                                                </strong>
                                            </div>

                                            <div className="manage-product-actions">

                                                <button
                                                    type="button"
                                                    className="manage-edit-btn"
                                                    title="Edit product"
                                                    onClick={() =>
                                                        handleEditProduct(product)
                                                    }
                                                >
                                                    ✎
                                                </button>

                                                <button
                                                    type="button"
                                                    className="manage-delete-btn"
                                                    title="Remove product"
                                                    onClick={() =>
                                                        handleDeleteProduct(product.id)
                                                    }
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

                {/* FOOTER */}
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
    // CATEGORIES
    // =====================================

   
const renderCategories = () => (
    <div className="category-management">

        <div className="category-page-header">
            <div>
                <span className="category-eyebrow">KONFIZ STORE</span>
                <h2>Category Management</h2>
                <p>Organize and manage your ice cream categories.</p>
            </div>

            <button
                type="button"
                className="category-add-btn"
                onClick={() => {
                    const input = document.querySelector(".category-name-input");
                    if (input) input.focus();
                }}
            >
                + Add Category
            </button>
        </div>

        {/* ADD CATEGORY */}
        <div className="category-form-card">
            <div className="category-form-heading">
                <div className="category-form-icon">🍦</div>
                <div>
                    <h3>Create New Category</h3>
                    <p>Add a new category to your KONFIZ store.</p>
                </div>
            </div>

            <div className="category-form-row">
                <div className="category-input-group">
                    <label>Category Name</label>
                    <input
                        type="text"
                        className="category-name-input"
                        placeholder="e.g. Ice Cream Tubs"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                addCategory();
                            }
                        }}
                    />
                </div>

                <button
                    type="button"
                    className="category-submit-btn"
                    onClick={addCategory}
                >
                    + Create Category
                </button>
            </div>
        </div>

        {/* CATEGORY TABLE */}
        <div className="category-list-card">

            <div className="category-list-header">
                <div>
                    <h3>Category List</h3>
                    <p>All your store categories in one place.</p>
                </div>

                <div className="category-total">
                    {categories.length} Categories
                </div>
            </div>

            {categories.length === 0 ? (
                <div className="category-empty">
                    <div>🍨</div>
                    <h3>No Categories Found</h3>
                    <p>Create your first category to organize products.</p>
                </div>
            ) : (
                <div className="category-table-wrapper">
                    <table className="category-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Category Name</th>
                                <th>Products</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {categories.map((category, index) => {
                                const name =
                                    typeof category === "string"
                                        ? category
                                        : category.name;

                                const id =
                                    typeof category === "string"
                                        ? category
                                        : category.id;

                                const count = products.filter(
                                    (product) =>
                                        String(product.category || "").toLowerCase() ===
                                        String(name || "").toLowerCase()
                                ).length;

                                return (
                                    <tr key={id || index}>
                                        <td>
                                            <span className="category-id">
                                                {String(index + 1).padStart(2, "0")}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="category-name-cell">
                                              
                                                <strong>{name}</strong>
                                            </div>
                                        </td>

                                        <td>
                                            <span className="category-product-count">
                                                {count} Products
                                            </span>
                                        </td>

                                        <td>
                                            <span className={
                                                count > 0
                                                    ? "category-status active"
                                                    : "category-status empty"
                                            }>
                                                {count > 0 ? "Active" : "Empty"}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="category-action-buttons">

                                                <button
                                                    type="button"
                                                    className="category-edit-btn"
                                                    onClick={() => {
                                                        const updatedName = window.prompt(
                                                            "Enter new category name:",
                                                            name
                                                        );

                                                        if (
                                                            updatedName === null ||
                                                            !updatedName.trim()
                                                        ) return;

                                                        const duplicate = categories.some(
                                                            (item) => {
                                                                const itemName =
                                                                    typeof item === "string"
                                                                        ? item
                                                                        : item.name;

                                                                return (
                                                                    itemName.toLowerCase() ===
                                                                    updatedName.trim().toLowerCase() &&
                                                                    itemName.toLowerCase() !==
                                                                    name.toLowerCase()
                                                                );
                                                            }
                                                        );

                                                        if (duplicate) {
                                                            alert("Category already exists.");
                                                            return;
                                                        }

                                                        setCategories((previous) =>
                                                            previous.map((item) => {
                                                                const itemName =
                                                                    typeof item === "string"
                                                                        ? item
                                                                        : item.name;

                                                                if (
                                                                    itemName.toLowerCase() !==
                                                                    name.toLowerCase()
                                                                ) return item;

                                                                if (typeof item === "string") {
                                                                    return updatedName.trim();
                                                                }

                                                                return {
                                                                    ...item,
                                                                    name: updatedName.trim()
                                                                };
                                                            })
                                                        );

                                                        // Update products using the old category name
                                                        setProducts((previous) =>
                                                            previous.map((product) =>
                                                                String(product.category || "").toLowerCase() ===
                                                                name.toLowerCase()
                                                                    ? {
                                                                        ...product,
                                                                        category: updatedName.trim()
                                                                    }
                                                                    : product
                                                            )
                                                        );
                                                    }}
                                                >
                                                    Edit
                                                </button>

                                                {typeof category === "string" ? (
                                                    <button
                                                        type="button"
                                                        className="category-delete-btn"
                                                        onClick={() => {
                                                            alert(
                                                                "This is an existing category. Please migrate it to a managed category before deleting."
                                                            );
                                                        }}
                                                    >
                                                        Delete
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        className="category-delete-btn"
                                                        onClick={() => deleteCategory(id)}
                                                    >
                                                        Delete
                                                    </button>
                                                )}

                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>

    </div>
);


    // =====================================
    // INVENTORY
    // =====================================

const [inventorySearch, setInventorySearch] = useState("");
const [inventoryCategory, setInventoryCategory] = useState("All");
const [inventoryFilter, setInventoryFilter] = useState("All");

   
const renderInventory = () => {

    const outOfStockProducts = products.filter(
        (product) => Number(product.stock || 0) === 0
    );

    const totalStock = products.reduce(
        (total, product) => total + Number(product.stock || 0),
        0
    );

    const inventoryValue = products.reduce(
        (total, product) =>
            total + (
                Number(product.price || 0) *
                Number(product.stock || 0)
            ),
        0
    );

    const filteredProducts = products.filter((product) => {

        const matchesSearch =
            String(product.name || "")
                .toLowerCase()
                .includes(inventorySearch.toLowerCase());

        const matchesCategory =
            inventoryCategory === "All" ||
            String(product.category || "").toLowerCase() ===
            inventoryCategory.toLowerCase();

        const stock = Number(product.stock || 0);

        const matchesStatus =
            inventoryFilter === "All" ||
            (inventoryFilter === "In Stock" && stock > 5) ||
            (inventoryFilter === "Low Stock" && stock > 0 && stock <= 5) ||
            (inventoryFilter === "Out of Stock" && stock === 0);

        return matchesSearch && matchesCategory && matchesStatus;
    });

    const getStockStatus = (stock) => {
        if (stock === 0) {
            return {
                label: "Out of Stock",
                className: "out-stock"
            };
        }

        if (stock <= 5) {
            return {
                label: "Low Stock",
                className: "low-stock"
            };
        }

        return {
            label: "In Stock",
            className: "in-stock"
        };
    };

    return (
        <div className="inventory-page">

            {/* PAGE HEADER */}

            <div className="inventory-header">
                <div>
                    <span className="inventory-eyebrow">
                        KONFIZ STORE MANAGEMENT
                    </span>

                    <h2>Inventory Overview</h2>

                    <p>
                        Track your ice cream products, monitor stock
                        levels and manage inventory.
                    </p>
                </div>

                <div className="inventory-header-icon">
                    📦
                </div>
            </div>

            {/* SUMMARY CARDS */}

            <div className="inventory-stats-grid">

                <div className="inventory-stat-card">
                    <div className="inventory-stat-top">
                        <div className="inventory-stat-icon purple">
                            📦
                        </div>
                        <span className="inventory-stat-tag">
                            All Products
                        </span>
                    </div>

                    <h3>{products.length}</h3>
                    <p>Total Products</p>
                </div>

                <div className="inventory-stat-card">
                    <div className="inventory-stat-top">
                        <div className="inventory-stat-icon blue">
                            🏬
                        </div>
                        <span className="inventory-stat-tag">
                            Units
                        </span>
                    </div>

                    <h3>{totalStock.toLocaleString("en-IN")}</h3>
                    <p>Total Stock Units</p>
                </div>

                <div className="inventory-stat-card">
                    <div className="inventory-stat-top">
                        <div className="inventory-stat-icon orange">
                            ⚠️
                        </div>
                        <span className="inventory-stat-tag warning">
                            Attention
                        </span>
                    </div>

                    <h3>{lowStockProducts.length}</h3>
                    <p>Low Stock Products</p>
                </div>

                <div className="inventory-stat-card">
                    <div className="inventory-stat-top">
                        <div className="inventory-stat-icon red">
                            🚫
                        </div>
                        <span className="inventory-stat-tag danger">
                            Critical
                        </span>
                    </div>

                    <h3>{outOfStockProducts.length}</h3>
                    <p>Out of Stock</p>
                </div>

            </div>

            {/* INVENTORY VALUE */}

            <div className="inventory-value-card">
                <div>
                    <span>Estimated Inventory Value</span>
                    <h2>{formatCurrency(inventoryValue)}</h2>
                    <p>Based on current product price × available stock</p>
                </div>

                <div className="inventory-value-icon">
                    ₹
                </div>
            </div>

            {/* INVENTORY TABLE */}

            <div className="inventory-table-card">

                <div className="inventory-table-heading">
                    <div>
                        <h3>Product Inventory</h3>
                        <p>Manage product quantities and stock status.</p>
                    </div>

                    <span className="inventory-total-badge">
                        {filteredProducts.length} Products
                    </span>
                </div>

                {/* SEARCH AND FILTER */}

                <div className="inventory-toolbar">

                    <div className="inventory-search">
                        <span>⌕</span>

                        <input
                            type="text"
                            placeholder="Search products..."
                            value={inventorySearch}
                            onChange={(e) =>
                                setInventorySearch(e.target.value)
                            }
                        />
                    </div>

                    <select
                        value={inventoryCategory}
                        onChange={(e) =>
                            setInventoryCategory(e.target.value)
                        }
                    >
                        <option value="All">All Categories</option>

                        {[...new Set(
                            products
                                .map((product) => product.category)
                                .filter(Boolean)
                        )].map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>

                    <select
                        value={inventoryFilter}
                        onChange={(e) =>
                            setInventoryFilter(e.target.value)
                        }
                    >
                        <option value="All">All Status</option>
                        <option value="In Stock">In Stock</option>
                        <option value="Low Stock">Low Stock</option>
                        <option value="Out of Stock">Out of Stock</option>
                    </select>

                </div>

                {/* STATUS FILTERS */}

                <div className="inventory-status-filters">

                    {["All", "In Stock", "Low Stock", "Out of Stock"].map(
                        (status) => (
                            <button
                                type="button"
                                key={status}
                                className={
                                    inventoryFilter === status
                                        ? "inventory-filter-btn active"
                                        : "inventory-filter-btn"
                                }
                                onClick={() => setInventoryFilter(status)}
                            >
                                {status}
                            </button>
                        )
                    )}

                </div>

                {/* TABLE */}

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

                            {filteredProducts.length === 0 ? (

                                <tr>
                                    <td colSpan="7">
                                        <div className="inventory-empty">
                                            <span>📦</span>
                                            <h3>No Products Found</h3>
                                            <p>
                                                Try changing your search
                                                or filters.
                                            </p>
                                        </div>
                                    </td>
                                </tr>

                            ) : (

                                filteredProducts.map((product) => {

                                    const stock = Number(product.stock || 0);
                                    const status = getStockStatus(stock);

                                    // Display scale only; no stock capacity
                                    // is assumed by this visualization.
                                    const progress = Math.min(stock, 100);

                                    return (
                                        <tr key={product.id}>

                                            <td>
                                                <div className="inventory-product">

                                                    {product.image ? (
                                                        <img
                                                            src={product.image}
                                                            alt={product.name}
                                                        />
                                                    ) : (
                                                        <div className="inventory-product-placeholder">
                                                            🍦
                                                        </div>
                                                    )}

                                                    <div>
                                                        <strong>
                                                            {product.name}
                                                        </strong>

                                                        <small>
                                                            {product.id}
                                                        </small>
                                                    </div>

                                                </div>
                                            </td>

                                            <td>
                                                <span className="inventory-category">
                                                    {product.category || "Uncategorized"}
                                                </span>
                                            </td>

                                            <td className="inventory-price">
                                                {formatCurrency(product.price)}
                                            </td>

                                            <td>
                                                <strong className="inventory-stock-number">
                                                    {stock}
                                                </strong>
                                                <small className="inventory-unit">
                                                    units
                                                </small>
                                            </td>

                                            <td>
                                                <div className="inventory-progress">
                                                    <div className="inventory-progress-track">
                                                        <div
                                                            className={`inventory-progress-fill ${status.className}`}
                                                            style={{
                                                                width: `${progress}%`
                                                            }}
                                                        />
                                                    </div>

                                                    <small>
                                                        {stock} units
                                                    </small>
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
                                                        onBlur={(e) => {
                                                            if (e.target.value === "") {
                                                                e.target.value = stock;
                                                                return;
                                                            }

                                                            updateStock(
                                                                product,
                                                                e.target.value
                                                            );
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") {
                                                                e.currentTarget.blur();
                                                            }
                                                        }}
                                                    />

                                                    <span>Units</span>

                                                </div>
                                            </td>

                                        </tr>
                                    );
                                })
                            )}

                        </tbody>

                    </table>

                </div>

                {/* TABLE FOOTER */}

                <div className="inventory-table-footer">
                    Showing {filteredProducts.length} of {products.length} products
                </div>

            </div>

        </div>
    );
};

    // =====================================
    // ORDERS
    // =====================================

   const [orderSearch, setOrderSearch] = useState("");

const renderOrders = () => {
    const filteredOrders = orders.filter((order) =>
        String(order.orderId || order.id || "")
            .toLowerCase()
            .includes(orderSearch.toLowerCase().trim())
    );

    return (
        <div className="orders-section">

            <div className="orders-header">
                <div>
                    <h2>Manage Orders</h2>
                    <p>Search and manage customer orders</p>
                </div>

                <div className="order-search">
                    <span>🔍</span>
                    <input
                        type="text"
                        placeholder="Search by Order ID..."
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                    />

                    {orderSearch && (
                        <button
                            type="button"
                            onClick={() => setOrderSearch("")}
                        >
                            ✕
                        </button>
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
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map((order, index) => {
                                const customer = order.customer || {};

                                const orderId = order.orderId || order.id || "N/A";
                                const name = customer.name || order.customerName || "Guest";
                                const phone = customer.mobile || customer.phone || order.mobile || order.phone || "N/A";

                                const address = [
                                    customer.address || order.address || order.billingAddress,
                                    customer.city || order.city,
                                    customer.state || order.state,
                                    customer.pincode || order.pincode
                                ].filter(Boolean).join(", ");

                                const status = order.status || order.orderStatus || "Pending";

                                return (
                                    <tr key={orderId}>
                                        <td>{orderId}</td>
                                        <td>{name}</td>
                                        <td>{phone}</td>
                                        <td>
                                            {order.orderDate
                                                ? new Date(order.orderDate).toLocaleDateString()
                                                : "N/A"}
                                        </td>
                                        <td>{address || "N/A"}</td>
                                        <td>₹{Number(order.total || order.grandTotal || 0).toFixed(2)}</td>
                                        <td>
                                            <select
                                                value={status}
                                                onChange={(e) =>
                                                    updateOrderStatus(orderId, e.target.value)
                                                }
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Confirmed">Confirmed</option>
                                                <option value="Processing">Processing</option>
                                                <option value="Shipped">Shipped</option>
                                                <option value="Delivered">Delivered</option>
                                                <option value="Completed">Completed</option>
                                                <option value="Cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="7" className="no-orders">
                                    {orderSearch
                                        ? `No order found with ID "${orderSearch}"`
                                        : "No orders available"}
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

  
const [customerSearch, setCustomerSearch] = useState("");

const renderCustomers = () => {
    const filteredCustomers = customers.filter((customer) => {
        const search = customerSearch.toLowerCase().trim();

        return (
            String(customer.customerId || customer.id || "")
                .toLowerCase().includes(search) ||
            String(customer.name || "")
                .toLowerCase().includes(search) ||
            String(customer.mobile || customer.phone || "")
                .toLowerCase().includes(search)
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

                <div className="customer-summary-note">
                    Customer records
                </div>
            </div>

            <div className="dashboard-panel customer-panel">

                <div className="customer-panel-header">
                    <div>
                        <h3>All Customers</h3>
                        <p>View customer details and contact information</p>
                    </div>

                    <div className="customer-search">
                        <span>⌕</span>

                        <input
                            type="text"
                            placeholder="Search ID, name or phone..."
                            value={customerSearch}
                            onChange={(e) => setCustomerSearch(e.target.value)}
                        />

                        {customerSearch && (
                            <button
                                type="button"
                                onClick={() => setCustomerSearch("")}
                            >
                                ×
                            </button>
                        )}
                    </div>
                </div>

                {customers.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">♙</div>
                        <strong>No registered customers found.</strong>
                        <span>
                            Customer records will appear here after registration.
                        </span>
                    </div>
                ) : filteredCustomers.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">⌕</div>
                        <strong>No matching customers found.</strong>
                        <span>Try searching with another customer ID or phone number.</span>
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
                                    const customerId =
                                        customer.customerId || customer.id || "N/A";

                                    const phone =
                                        customer.mobile || customer.phone || "N/A";

                                    const email = customer.email || "";

                                    const registrationDate =
                                        customer.createdAt ||
                                        customer.registrationDate ||
                                        customer.registeredAt;

                                    return (
                                        <tr key={customerId === "N/A" ? index : customerId}>

                                            <td>
                                                <span className="customer-id">
                                                    {customerId}
                                                </span>
                                            </td>

                                            <td>
                                                <div className="customer-name-cell">
                                                    <div className="customer-avatar">
                                                        {(customer.name || "C")
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </div>

                                                    <strong>
                                                        {customer.name || "N/A"}
                                                    </strong>
                                                </div>
                                            </td>

                                            <td>
                                                <span className="customer-phone">
                                                    {phone}
                                                </span>
                                            </td>

                                            <td>
                                                {email ? (
                                                    <span className="customer-email">
                                                        {email}
                                                    </span>
                                                ) : (
                                                    <span className="email-optional">
                                                        Not provided
                                                    </span>
                                                )}
                                            </td>

                                            <td>
                                                <span className="customer-date">
                                                    {registrationDate
                                                        ? new Date(registrationDate)
                                                            .toLocaleDateString("en-IN")
                                                        : "N/A"}
                                                </span>
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
    // SETTINGS
    // =====================================

    const renderSettings = () => (
        <div className="manage-products">
            {pageHeader(
                "Store Settings",
                "Manage your KONFIZ store information."
            )}

            <div className="dashboard-panel">
                <h3>Store Information</h3>

                <div className="login-group">
                    <label>Store Name</label>
                    <input
                        className="login-input"
                        value={settings.storeName}
                        onChange={(e) =>
                            handleSettingsChange("storeName", e.target.value)
                        }
                    />
                </div>

                <div className="login-group">
                    <label>Store Email</label>
                    <input
                        type="email"
                        className="login-input"
                        value={settings.email}
                        onChange={(e) =>
                            handleSettingsChange("email", e.target.value)
                        }
                    />
                </div>

                <div className="login-group">
                    <label>Mobile Number</label>
                    <input
                        type="tel"
                        className="login-input"
                        value={settings.mobile}
                        onChange={(e) =>
                            handleSettingsChange("mobile", e.target.value)
                        }
                    />
                </div>

                <div className="login-group">
                    <label>Store Address</label>
                    <textarea
                        className="login-input"
                        value={settings.address}
                        onChange={(e) =>
                            handleSettingsChange("address", e.target.value)
                        }
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
    // PAGE CONTENT
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

    // =====================================
    // WAIT FOR ADMIN VERIFICATION
    // =====================================

    if (!isAdmin) {
        return null;
    }

    // =====================================
    // MAIN DASHBOARD UI
    // =====================================

    return (
        <div className="admin-layout">
            <aside
                className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}
            >
                <Link to="/" className="admin-brand-link">
                    <div className="admin-brand">
                        KONFIZ<span>.</span>
                    </div>
                </Link>

                <div className="admin-brand-sub">
                    MASTER ADMIN PANEL
                </div>

                <div className="sidebar-label">
                    MAIN MENU
                </div>

                <div className="sidebar-menu">
                    {navigation.map((item) => (
                        <button
                            key={item.name}
                            type="button"
                            className={`sidebar-item ${activePage === item.name ? "active" : ""
                                }`}
                            onClick={() => selectPage(item.name)}
                        >
                            <span className="sidebar-icon">
                                {item.icon}
                            </span>
                            {item.name}
                        </button>
                    ))}
                </div>

                <div className="sidebar-bottom">
                    <button
                        className="admin-logout"
                        type="button"
                        onClick={handleLogout}
                    >
                        ↪ &nbsp; Logout
                    </button>
                </div>
            </aside>

            <main className="admin-main">
                <header className="admin-topbar">
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 15
                        }}
                    >
                        <button
                            className="mobile-menu"
                            type="button"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            ☰
                        </button>

                        <div className="topbar-title">
                            {activePage}
                        </div>
                    </div>

                    <div className="admin-profile">
                        <div className="profile-avatar">
                            A
                        </div>

                        <div className="profile-info">
                            <strong>
                                {user?.name || "Master Admin"}
                            </strong>
                            <span>{adminEmail}</span>
                        </div>
                    </div>
                </header>

                <div className="admin-content">
                    {renderPage()}
                </div>
            </main>
        </div>
    );
}

export default Dashboard;