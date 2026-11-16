
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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

    const renderManageProducts = () => (
        <div className="manage-products">
            {pageHeader(
                "Manage Products",
                "View, edit and remove your store products."
            )}

            {products.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🍦</div>
                    <strong>No products added yet.</strong>

                    <button
                        className="primary-btn"
                        onClick={() => selectPage("Add Product")}
                    >
                        Add Your First Product
                    </button>
                </div>
            ) : (
                <div className="products-grid">
                    {products.map((product) => (
                        <div key={product.id} className="product-card">
                            {product.image && (
                                <img
                                    src={product.image}
                                    alt={product.name}
                                />
                            )}

                            <h3>{product.name}</h3>
                            <p>{product.category}</p>
                            <p>{product.description}</p>

                            <strong>
                                {formatCurrency(product.price)}
                            </strong>

                            <p>⭐ {product.rating || "N/A"}</p>
                            <p>Stock: {product.stock ?? 0}</p>

                            <div style={{
                                display: "flex",
                                gap: 8,
                                flexWrap: "wrap"
                            }}>
                                <button
                                    type="button"
                                    onClick={() => handleEditProduct(product)}
                                >
                                    Edit
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleDeleteProduct(product.id)}
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    // =====================================
    // CATEGORIES
    // =====================================

    const renderCategories = () => (
        <div className="manage-products">
            {pageHeader(
                "Categories",
                "Create and manage your ice cream categories."
            )}

            <div className="dashboard-panel">
                <div className="login-group">
                    <label>New Category</label>

                    <input
                        type="text"
                        className="login-input"
                        placeholder="Enter category name"
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
                    className="primary-btn"
                    onClick={addCategory}
                >
                    + Add Category
                </button>
            </div>

            <div className="dashboard-panel" style={{ marginTop: 20 }}>
                <h3>Category List</h3>

                {categories.length === 0 ? (
                    <p>No categories created yet.</p>
                ) : (
                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Category</th>
                                    <th>Products</th>
                                    <th>Action</th>
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
                                            <td>{name}</td>
                                            <td>{count}</td>
                                            <td>
                                                {typeof category === "string" ? (
                                                    <span>Existing category</span>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => deleteCategory(id)}
                                                    >
                                                        Delete
                                                    </button>
                                                )}
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

    const renderInventory = () => (
        <div className="manage-products">
            {pageHeader(
                "Inventory Management",
                "Monitor and update your product stock."
            )}

            <div className="dashboard-panel">
                <h3>Inventory Summary</h3>
                <p>Total Products: {products.length}</p>
                <p>Low Stock: {lowStockProducts.length}</p>

                <p>
                    Out of Stock: {
                        products.filter(
                            (product) => Number(product.stock || 0) === 0
                        ).length
                    }
                </p>
            </div>

            <div className="dashboard-panel" style={{ marginTop: 20 }}>
                <div className="admin-table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Category</th>
                                <th>Current Stock</th>
                                <th>Update Stock</th>
                                <th>Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {products.map((product) => (
                                <tr key={product.id}>
                                    <td>{product.name}</td>
                                    <td>{product.category || "N/A"}</td>
                                    <td>{product.stock ?? 0}</td>

                                    <td>
                                        <input
                                            type="number"
                                            min="0"
                                            defaultValue={product.stock ?? 0}
                                            onBlur={(e) => {
                                                if (e.target.value !== "") {
                                                    updateStock(product, e.target.value);
                                                }
                                            }}
                                        />
                                    </td>

                                    <td>
                                        {Number(product.stock || 0) === 0
                                            ? "Out of Stock"
                                            : Number(product.stock || 0) <= 5
                                                ? "Low Stock"
                                                : "Available"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    // =====================================
    // ORDERS
    // =====================================

    const renderOrders = () => (
        <div className="manage-products">
            {pageHeader(
                "Orders Management",
                "View customer orders and update their status."
            )}

            <div className="dashboard-panel">
                <h3>Total Orders: {orders.length}</h3>

                {orders.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🛒</div>
                        <strong>No orders received yet.</strong>
                    </div>
                ) : (
                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {orders.map((order, index) => {
                                    const id = order.id || order.orderId || index;

                                    return (
                                        <tr key={id}>
                                            <td>
                                                {order.orderId || order.id || `Order ${index + 1}`}
                                            </td>

                                            <td>{getOrderCustomer(order)}</td>

                                            <td>
                                                {order.orderDate || order.date
                                                    ? new Date(
                                                        order.orderDate || order.date
                                                    ).toLocaleDateString("en-IN")
                                                    : "N/A"}
                                            </td>

                                            <td>
                                                {formatCurrency(getOrderAmount(order))}
                                            </td>

                                            <td>
                                                <select
                                                    value={order.status || "Pending"}
                                                    onChange={(e) =>
                                                        updateOrderStatus(
                                                            id,
                                                            e.target.value
                                                        )
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
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );

    // =====================================
    // CUSTOMERS
    // =====================================

    const renderCustomers = () => (
        <div className="manage-products">
            {pageHeader(
                "Customer Management",
                "View registered customer information."
            )}

            <div className="dashboard-panel">
                <h3>Total Customers: {customers.length}</h3>

                {customers.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">♙</div>
                        <strong>No registered customer records found.</strong>
                        <span>
                            Connect your customer registration system to
                            konfizRegisteredCustomers.
                        </span>
                    </div>
                ) : (
                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Customer ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Mobile</th>
                                </tr>
                            </thead>

                            <tbody>
                                {customers.map((customer, index) => (
                                    <tr key={customer.id || customer.customerId || index}>
                                        <td>
                                            {customer.customerId || customer.id || "N/A"}
                                        </td>
                                        <td>{customer.name || "N/A"}</td>
                                        <td>{customer.email || "N/A"}</td>
                                        <td>{customer.mobile || "N/A"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );

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
                <div className="admin-brand">
                    KONFIZ<span>.</span>
                </div>

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
                            className={`sidebar-item ${
                                activePage === item.name ? "active" : ""
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