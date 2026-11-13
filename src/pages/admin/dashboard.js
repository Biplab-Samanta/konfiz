
import React, { useState, useEffect } from "react";
import "../../style/dashboard.css";
import AddProduct from "./addproduct";

function Dashboard({ onLogout }) {
    const [activePage, setActivePage] = useState("Dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const adminEmail =
        sessionStorage.getItem("konfizAdminEmail") || "admin@konfiz.com";

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

    const stats = [
        { title: "Total Products", value: "0", change: "Products in store", icon: "▤" },
        { title: "Total Orders", value: "0", change: "Orders received", icon: "🛒" },
        { title: "Total Customers", value: "0", change: "Registered customers", icon: "♙" },
        { title: "Total Revenue", value: "₹0", change: "Store revenue", icon: "₹" }
    ];

    const handleLogout = () => {
        sessionStorage.removeItem("konfizAdminLoggedIn");
        sessionStorage.removeItem("konfizAdminEmail");

        if (onLogout) {
            onLogout();
        } else {
            window.location.href = "/";
        }
    };

    const selectPage = (page) => {
        setActivePage(page);
        setSidebarOpen(false);
    };
    // const [products, setProducts] = useState([]);

    // const handleAddProduct = (newProduct) => {
    //     setProducts((prev) => [...prev, newProduct]);
    //     setActivePage("Manage Products");
    // };
    const [products, setProducts] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("konfizProducts")) || [];
        } catch {
            return [];
        }
    });
    useEffect(() => {
        localStorage.setItem("konfizProducts", JSON.stringify(products));
    }, [products]);
    const handleAddProduct = (newProduct) => {
        setProducts((prev) => [...prev, newProduct]);
        setActivePage("Manage Products");
    };
    return (
        <div className="admin-layout">


            {/* SIDEBAR */}

            <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>

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
                            className={`sidebar-item ${activePage === item.name ? "active" : ""
                                }`}
                            onClick={() => selectPage(item.name)}
                        >
                            <span className="sidebar-icon">{item.icon}</span>
                            {item.name}
                        </button>
                    ))}

                </div>

                <div className="sidebar-bottom">
                    <button className="admin-logout" onClick={handleLogout}>
                        ↪ &nbsp; Logout
                    </button>
                </div>

            </aside>

            {/* MAIN CONTENT */}

            <main className="admin-main">

                <header className="admin-topbar">

                    <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
                        <button
                            className="mobile-menu"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            ☰
                        </button>

                        <div className="topbar-title">
                            {activePage}
                        </div>
                    </div>

                    <div className="admin-profile">

                        <div className="profile-avatar">A</div>

                        <div className="profile-info">
                            <strong>Master Admin</strong>
                            <span>{adminEmail}</span>
                        </div>

                    </div>

                </header>

                <div className="admin-content">

                    {activePage === "Dashboard" ? (

                        <>
                            <div className="welcome-section">

                                <div>
                                    <h2>Welcome to KONFIZ</h2>
                                    <p>Here's what's happening with your store today.</p>
                                </div>

                                <button
                                    className="primary-btn"
                                    onClick={() => selectPage("Add Product")}
                                >
                                    + Add New Product
                                </button>

                            </div>

                            {/* STATISTICS */}

                            <div className="stats-grid">

                                {stats.map((stat) => (
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

                            {/* LOWER DASHBOARD */}

                            <div className="dashboard-grid">

                                <div className="dashboard-panel">

                                    <div className="panel-heading">
                                        <h3>Recent Orders</h3>
                                        <span>View All</span>
                                    </div>

                                    <div className="empty-state">
                                        <div className="empty-icon">🛒</div>
                                        <strong>No orders yet</strong>
                                        <span>Customer orders will appear here.</span>
                                    </div>

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

                        </>

                    ) : (

                        <div className="page-placeholder">
                            <h2>{activePage}</h2>
                            <p>
                                The {activePage} module will be developed next.
                            </p>
                            <button
                                className="primary-btn"
                                onClick={() => selectPage("Dashboard")}
                            >
                                Back to Dashboard
                            </button>
                        </div>

                    )}

                    {activePage === "Add Product" ? (

                        <AddProduct
                            onAddProduct={handleAddProduct}
                            onCancel={() => selectPage("Dashboard")}
                        />

                    ) : activePage === "Manage Products" ? (

                        <div className="manage-products">
                            <h2>Manage Products</h2>

                            {products.length === 0 ? (
                                <p>No products added yet.</p>
                            ) : (
                                <div className="products-grid">
                                    {products.map((product) => (
                                        <div key={product.id} className="product-card">

                                            <img src={product.image} alt={product.name} />

                                            <h3>{product.name}</h3>
                                            <p>{product.category}</p>
                                            <p>{product.description}</p>

                                            <strong>₹{product.price}</strong>

                                            <p>⭐ {product.rating}</p>

                                            {/* <button
                                                onClick={() => handleDeleteProduct(product.id)}
                                            >
                                                Delete
                                            </button> */}

                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    ) : (
                        <div className="page-placeholder">
                            <h2>{activePage}</h2>
                            <p>The {activePage} module will be developed next.</p>
                            <button
                                className="primary-btn"
                                onClick={() => selectPage("Dashboard")}
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    )}
                </div>

            </main>

        </div>
    );
}

export default Dashboard;
