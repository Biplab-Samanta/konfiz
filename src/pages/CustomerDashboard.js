
import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";

import Navbar from "../components/navber";
import { useAuth } from "../context/authContext";
// import WishlistSection from "./customer/WishlistSection";

import "../style/CustomerDashboard.css";

// =====================================================
// STORAGE HELPERS
// =====================================================

const readStorage = (keys) => {
    for (const key of keys) {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) continue;

            const data = JSON.parse(raw);

            if (Array.isArray(data)) return data;

            if (data && typeof data === "object") {
                return data.items ||
                    data.orders ||
                    data.addresses ||
                    data.wishlist ||
                    data.activities ||
                    [];
            }
        } catch (error) {
            console.error("Storage error:", key, error);
        }
    }

    return [];
};

const formatDate = (date) => {
    if (!date) return "Not available";

    const parsed = new Date(date);

    if (isNaN(parsed.getTime())) return "Not available";

    return parsed.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
};

const formatDateTime = (date) => {
    if (!date) return "Date unavailable";

    const parsed = new Date(date);

    if (isNaN(parsed.getTime())) return "Date unavailable";

    return parsed.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
};

const money = (value) => {
    return Number(value || 0).toLocaleString("en-IN", {
        style: "currency",
        currency: "INR"
    });
};

const getOrderItems = (order) =>
    order.items || order.orderItems || order.products || [];

const getOrderId = (order) =>
    order.id || order.orderId || order.orderNumber || "N/A";

const getOrderAmount = (order) =>
    Number(
        order.grandTotal ??
        order.totalAmount ??
        order.total ??
        order.amount ??
        0
    );

const getOrderDate = (order) =>
    order.createdAt || order.orderDate || order.date;

const getOrderStatus = (order) =>
    order.status || order.orderStatus || "Pending";

const getPaymentStatus = (order) =>
    order.paymentStatus || order.payment || "Pending";

const getOrderProduct = (order) => {
    const items = getOrderItems(order);

    if (!items.length) {
        return order.productName || order.product || "Ice Cream Order";
    }

    const first = items[0].name ||
        items[0].productName ||
        items[0].title ||
        "Ice Cream";

    return items.length > 1
        ? `${first} + ${items.length - 1} more`
        : first;
};

const getOrderQuantity = (order) => {
    const items = getOrderItems(order);

    if (!items.length) return Number(order.quantity || 1);

    return items.reduce(
        (total, item) => total + Number(item.quantity || 1),
        0
    );
};

const belongsToCustomer = (item, customerId) => {
    const owner =
        item.customerId ||
        item.userId ||
        item.customer?.id ||
        item.user?.id;

    return String(owner) === String(customerId);
};

// =====================================================
// CUSTOMER DASHBOARD
// =====================================================

function CustomerDashboard() {

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState("overview");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [orders, setOrders] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [activities, setActivities] = useState([]);

    const [loading, setLoading] = useState(true);

    // Customer identity
    const customerId =
        user?.id ||
        user?.customerId ||
        user?._id;

    const customerName =
        user?.name ||
        user?.fullName ||
        "Customer";

    const customerEmail = user?.email || "Not provided";

    const customerMobile =
        user?.mobile ||
        user?.phone ||
        "Not available";

    const registrationDate =
        user?.registrationDate ||
        user?.createdAt ||
        user?.created_at;

    // =================================================
    // TAB CONFIGURATION
    // =================================================

    const tabs = [
        { id: "overview", label: "Overview", icon: "▦" },
        { id: "profile", label: "Personal Information", icon: "♙" },
        { id: "orders", label: "My Orders", icon: "▤" },
        { id: "addresses", label: "My Addresses", icon: "⌖" },
        { id: "wishlist", label: "My Wishlist", icon: "♡" },
        { id: "activity", label: "Activity History", icon: "◷" },
        { id: "settings", label: "Account Settings", icon: "⚙" }
    ];

    // =================================================
    // LOAD ALL CUSTOMER DATA
    // =================================================

    useEffect(() => {

        if (!customerId) {
            setOrders([]);
            setWishlist([]);
            setAddresses([]);
            setActivities([]);
            setLoading(false);
            return;
        }

        const loadData = () => {

            try {

                // ORDERS
                const allOrders = readStorage([
                    "konfizOrders",
                    "konfiz_orders",
                    "customerOrders"
                ]);

                setOrders(
                    allOrders
                        .filter(item =>
                            belongsToCustomer(item, customerId)
                        )
                        .sort((a, b) =>
                            new Date(getOrderDate(b) || 0) -
                            new Date(getOrderDate(a) || 0)
                        )
                );

                // WISHLIST
                const wishlistKey = `konfiz_wishlist_${customerId}`;

                const savedWishlist = JSON.parse(
                    localStorage.getItem(wishlistKey) || "[]"
                );

                setWishlist(
                    Array.isArray(savedWishlist) ? savedWishlist : []
                );

                // ADDRESSES
                const allAddresses = readStorage([
                    "konfizAddresses",
                    "konfiz_addresses",
                    "customerAddresses"
                ]);

                setAddresses(
                    allAddresses.filter(item =>
                        belongsToCustomer(item, customerId)
                    )
                );

                // ACTIVITY
                const allActivities = readStorage([
                    "konfiz_customer_activities"
                ]);

                setActivities(
                    allActivities
                        .filter(item =>
                            String(item.customerId) ===
                            String(customerId)
                        )
                        .sort((a, b) =>
                            new Date(b.createdAt || 0) -
                            new Date(a.createdAt || 0)
                        )
                );

            } catch (error) {
                console.error("Dashboard loading error:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();

        const events = [
            "storage",
            "konfiz-activity-updated",
            "konfiz-orders-updated",
            "konfiz-wishlist-updated",
            "konfiz-addresses-updated"
        ];

        events.forEach(event =>
            window.addEventListener(event, loadData)
        );

        return () => {
            events.forEach(event =>
                window.removeEventListener(event, loadData)
            );
        };

    }, [customerId]);

    // =================================================
    // STATISTICS
    // =================================================

    const totalOrders = orders.length;
    const totalWishlist = wishlist.length;
    const totalAddresses = addresses.length;

    const paidOrders = orders.filter(order =>
        ["paid", "success", "successful", "completed"].includes(
            String(getPaymentStatus(order)).toLowerCase()
        )
    );

    const totalSpending = paidOrders.reduce(
        (total, order) => total + getOrderAmount(order),
        0
    );

    const deliveredOrders = orders.filter(order =>
        String(getOrderStatus(order)).toLowerCase() === "delivered"
    ).length;

    const pendingOrders = orders.filter(order =>
        ["pending", "processing", "confirmed", "shipped"].includes(
            String(getOrderStatus(order)).toLowerCase()
        )
    ).length;

    // =================================================
    // ACTIVITY ICONS
    // =================================================

    const activityIcon = (type) => {
        const icons = {
            CUSTOMER_REGISTERED: "✨",
            PROFILE_UPDATED: "👤",
            LOGIN: "🔐",
            ORDER_PLACED: "📦",
            PAYMENT_SUCCESS: "💳",
            PAYMENT_FAILED: "⚠️",
            ORDER_CANCELLED: "❌",
            ORDER_DELIVERED: "🎉",
            WISHLIST_ADDED: "❤️",
            WISHLIST_REMOVED: "💔",
            ADDRESS_ADDED: "📍",
            ADDRESS_UPDATED: "🏠",
            ADDRESS_DELETED: "🗑️"
        };

        return icons[type] || "🔔";
    };

    // =================================================
    // LOGOUT
    // =================================================

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const changeTab = (tab) => {
        setActiveTab(tab);
        setSidebarOpen(false);
    };

    // =================================================
    // REUSABLE SECTION HEADER
    // =================================================

    const pageHeader = (title, description) => (
        <div className="customer-section-heading">
            <div>
                <h2>{title}</h2>
                <p>{description}</p>
            </div>
        </div>
    );

    // =================================================
    // OVERVIEW TAB
    // =================================================

    const renderOverview = () => (

        <>
            <div className="customer-welcome-banner">
                <div>
                    <span>ICE CREAM & HAPPINESS</span>
                    <h2>
                        A little sweetness makes every day better!
                    </h2>
                    <p>
                        Discover your favourite flavours and enjoy
                        every moment with KONFiZ.
                    </p>
                    <Link to="/products" className="customer-shop-btn">
                        Explore Ice Cream →
                    </Link>
                </div>

                <div className="customer-banner-emoji">🍨</div>
            </div>

            <div className="customer-dashboard-grid">

                <div className="customer-info-card">

                    <div className="customer-card-heading">
                        <h3>My Profile</h3>
                        <button onClick={() => changeTab("profile")}>
                            View Details →
                        </button>
                    </div>

                    <div className="customer-profile-details">
                        <div className="customer-avatar large">
                            {customerName.charAt(0).toUpperCase()}
                        </div>

                        <div>
                            <h3>{customerName}</h3>
                            <p>{customerEmail}</p>
                            {user?.mobileVerified && (
                                <span className="customer-verified">
                                    ✓ Mobile Verified
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="customer-detail-row">
                        <span>Customer ID</span>
                        <strong>{customerId || "Not available"}</strong>
                    </div>

                    <div className="customer-detail-row">
                        <span>Mobile</span>
                        <strong>{customerMobile}</strong>
                    </div>

                    <div className="customer-detail-row">
                        <span>Member Since</span>
                        <strong>{formatDate(registrationDate)}</strong>
                    </div>

                </div>

                <div className="customer-stats-column">

                    {[
                        {
                            icon: "📦",
                            title: "Total Orders",
                            value: totalOrders,
                            description: `${deliveredOrders} delivered`,
                            tab: "orders"
                        },
                        {
                            icon: "♡",
                            title: "My Wishlist",
                            value: totalWishlist,
                            description: "Saved favourites",
                            tab: "wishlist"
                        },
                        {
                            icon: "📍",
                            title: "Saved Addresses",
                            value: totalAddresses,
                            description: "Delivery locations",
                            tab: "addresses"
                        },
                        {
                            icon: "💰",
                            title: "Total Spending",
                            value: money(totalSpending),
                            description: "Confirmed payments",
                            tab: "orders"
                        }
                    ].map((stat, index) => (

                        <div className="customer-stat-card" key={index}>
                            <div className="customer-stat-icon">
                                {stat.icon}
                            </div>

                            <div>
                                <p>{stat.title}</p>
                                <h2>{stat.value}</h2>
                                <span>{stat.description}</span>
                            </div>

                            <button onClick={() => changeTab(stat.tab)}>
                                →
                            </button>
                        </div>

                    ))}

                </div>
            </div>

            <div className="customer-quick-section">

                {pageHeader(
                    "Quick Actions",
                    "Everything you need, just one click away."
                )}

                <div className="customer-quick-grid">

                    {[
                        {
                            icon: "📦",
                            title: "My Orders",
                            description: "Track your purchases",
                            tab: "orders"
                        },
                        {
                            icon: "📍",
                            title: "My Addresses",
                            description: "Manage delivery locations",
                            tab: "addresses"
                        },
                        {
                            icon: "👤",
                            title: "My Profile",
                            description: "Update personal details",
                            tab: "profile"
                        },
                        {
                            icon: "❤️",
                            title: "My Wishlist",
                            description: "Your favourite flavours",
                            tab: "wishlist"
                        }
                    ].map(item => (

                        <button
                            className="customer-quick-card"
                            key={item.tab}
                            onClick={() => changeTab(item.tab)}
                        >
                            <span>{item.icon}</span>
                            <h3>{item.title}</h3>
                            <p>{item.description}</p>
                            <b>Open Section →</b>
                        </button>

                    ))}

                </div>
            </div>

            {renderRecentOrders()}
            {renderRecentActivity(5)}
        </>
    );

    // =================================================
    // PROFILE TAB
    // =================================================

    const renderProfile = () => (

        <>
            {pageHeader(
                "Personal Information",
                "View your registered customer information."
            )}

            <div className="customer-info-card">

                <div className="customer-profile-details">
                    <div className="customer-avatar large">
                        {customerName.charAt(0).toUpperCase()}
                    </div>

                    <div>
                        <h3>{customerName}</h3>
                        <p>{customerEmail}</p>
                        <span className="customer-member-badge">
                            KONFiZ Customer
                        </span>
                    </div>
                </div>

                {[
                    ["Full Name", customerName],
                    ["Customer ID", customerId],
                    ["Email Address", customerEmail],
                    ["Mobile Number", customerMobile],
                    ["Registration Date", formatDate(registrationDate)]
                ].map(([label, value]) => (

                    <div className="customer-detail-row" key={label}>
                        <span>{label}</span>
                        <strong>{value || "Not available"}</strong>
                    </div>

                ))}

                <p>
                    To edit your information, use your profile
                    editing page if it is already implemented.
                </p>

                <Link to="/customer/profile" className="customer-edit-btn">
                    Edit Personal Information →
                </Link>

            </div>
        </>
    );

    // =================================================
    // RECENT ORDERS
    // =================================================

    const renderRecentOrders = () => (

        <section className="customer-orders-section">

            <div className="customer-section-heading order-heading">
                <div>
                    <h2>Recent Orders</h2>
                    <p>Your latest KONFiZ purchases.</p>
                </div>

                <button
                    className="customer-view-all"
                    onClick={() => changeTab("orders")}
                >
                    View All →
                </button>
            </div>

            {orders.length ? (

                <div className="customer-orders-table-wrapper">

                    <table className="customer-orders-table">

                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Product</th>
                                <th>Date</th>
                                <th>Amount</th>
                                <th>Payment</th>
                                <th>Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {orders.slice(0, 5).map(order => (

                                <tr key={getOrderId(order)}>
                                    <td>
                                        <strong>{getOrderId(order)}</strong>
                                    </td>

                                    <td>
                                        {getOrderProduct(order)}
                                        <small>
                                            Qty: {getOrderQuantity(order)}
                                        </small>
                                    </td>

                                    <td>{formatDate(getOrderDate(order))}</td>

                                    <td>{money(getOrderAmount(order))}</td>

                                    <td>
                                        <span className={`customer-status ${String(getPaymentStatus(order)).toLowerCase()
                                            }`}>
                                            {getPaymentStatus(order)}
                                        </span>
                                    </td>

                                    <td>
                                        <span className={`customer-status ${String(getOrderStatus(order)).toLowerCase()
                                            }`}>
                                            {getOrderStatus(order)}
                                        </span>
                                    </td>
                                </tr>

                            ))}
                        </tbody>

                    </table>

                </div>

            ) : (

                <div className="customer-empty-orders">
                    <div>🍨</div>
                    <h3>No orders yet!</h3>
                    <p>Your delicious journey starts here.</p>
                    <Link to="/products">Start Shopping →</Link>
                </div>

            )}

        </section>
    );

    // =================================================
    // ALL ORDERS TAB
    // =================================================

    const renderOrders = () => (

        <>
            {pageHeader(
                "My Orders",
                `You have placed ${totalOrders} orders with KONFiZ.`
            )}

            <div className="customer-order-summary">
                <div>
                    <span>Total Orders</span>
                    <h2>{totalOrders}</h2>
                </div>

                <div>
                    <span>Pending / Processing</span>
                    <h2>{pendingOrders}</h2>
                </div>

                <div>
                    <span>Delivered</span>
                    <h2>{deliveredOrders}</h2>
                </div>

                <div>
                    <span>Total Paid</span>
                    <h2>{money(totalSpending)}</h2>
                </div>
            </div>

            {renderRecentOrders()}
        </>
    );

    // =================================================
    // ADDRESSES TAB
    // =================================================

    const renderAddresses = () => (

        <>
            {pageHeader(
                "My Addresses",
                "Manage your saved delivery locations."
            )}

            <div className="customer-data-grid">

                {addresses.length ? addresses.map((address, index) => (

                    <div className="customer-info-card" key={
                        address.id || address._id || index
                    }>
                        <h3>
                            {address.label ||
                                address.type ||
                                `Address ${index + 1}`}
                        </h3>

                        <p>
                            {address.name || customerName}
                        </p>

                        <p>
                            {[
                                address.addressLine1 || address.address,
                                address.addressLine2,
                                address.landmark,
                                address.city,
                                address.state,
                                address.postalCode || address.pincode
                            ].filter(Boolean).join(", ")}
                        </p>

                        <p>
                            {address.mobile || address.phone || customerMobile}
                        </p>

                        {address.isDefault && (
                            <span className="customer-verified">
                                Default Address
                            </span>
                        )}

                    </div>

                )) : (

                    <div className="customer-empty-orders">
                        <div>📍</div>
                        <h3>No saved addresses</h3>
                        <p>Add an address for convenient delivery.</p>
                    </div>

                )}

            </div>

            <Link
                to="/customer/addresses"
                className="customer-edit-btn"
            >
                Manage Addresses →
            </Link>
        </>
    );

    // =================================================
    // WISHLIST TAB
    // =================================================

    const renderWishlist = () => (

        <>
            {pageHeader(
                "My Wishlist",
                "All the ice cream flavours you have saved."
            )}

            {wishlist.length ? (

                <div className="customer-data-grid wishlist">

                    {wishlist.map((item, index) => {

                        const product =
                            item.product ||
                            item;

                        const productId =
                            product.id ||
                            product.productId ||
                            product._id;

                        return (

                            <div
                                className="customer-info-card"
                                key={item.id || productId || index}
                            >

                                {(product.image || product.imageUrl) && (
                                    <img
                                        src={product.image || product.imageUrl}
                                        alt={product.name || "Ice Cream"}
                                        style={{
                                            width: "100%",
                                            maxHeight: "180px",
                                            objectFit: "cover",
                                            borderRadius: "12px"
                                        }}
                                    />
                                )}

                                <h3>
                                    {product.name ||
                                        product.productName ||
                                        "Saved Product"}
                                </h3>

                                <p>
                                    {product.category || "Ice Cream"}
                                </p>

                                <strong>
                                    {money(product.price)}
                                </strong>

                                
                                    <Link
                                        to={
                                            productId
                                                ? `/product/${productId}`
                                                : "/products"
                                        }
                                        className="customer-edit-btn"
                                    >
                                        View Product →
                                    </Link>
                               
                            </div>

                        );
                    })}

                </div>

            ) : (

                <div className="customer-empty-orders">
                    <div>❤️</div>
                    <h3>Your wishlist is empty</h3>
                    <p>Save your favourite flavours here.</p>
                    <Link to="/products">Explore Products →</Link>
                </div>

            )}

        </>
    );

    // =================================================
    // ACTIVITY TAB
    // =================================================

    const renderRecentActivity = (limit = null) => (

        <section className="customer-activity-section">

            {pageHeader(
                "Recent Activity",
                "Track your actions and account updates."
            )}

            {activities.length ? (

                <div className="customer-activity-list">

                    {(limit ? activities.slice(0, limit) : activities)
                        .map(activity => (

                            <div
                                className="customer-activity-item"
                                key={activity.id}
                            >

                                <div className="activity-icon">
                                    {activityIcon(activity.type)}
                                </div>

                                <div className="activity-details">
                                    <h4>{activity.title}</h4>

                                    <p>{activity.description}</p>

                                    <small>
                                        {formatDateTime(activity.createdAt)}
                                    </small>
                                </div>

                                {activity.amount != null && (
                                    <strong>
                                        {money(activity.amount)}
                                    </strong>
                                )}

                            </div>

                        ))}

                </div>

            ) : (

                <div className="customer-empty-orders">
                    <div>✨</div>
                    <h3>No activity recorded yet</h3>
                    <p>Your account activities will appear here.</p>
                </div>

            )}

        </section>
    );

    // =================================================
    // SETTINGS TAB
    // =================================================

    const renderSettings = () => (

        <>
            {pageHeader(
                "Account Settings",
                "Manage your account and security."
            )}

            <div className="customer-info-card">

                <h3>Account Information</h3>

                <div className="customer-detail-row">
                    <span>Account Status</span>
                    <strong>Active</strong>
                </div>

                <div className="customer-detail-row">
                    <span>Registered Email</span>
                    <strong>{customerEmail}</strong>
                </div>

                <div className="customer-detail-row">
                    <span>Mobile Number</span>
                    <strong>{customerMobile}</strong>
                </div>

                <div className="customer-detail-row">
                    <span>Member Since</span>
                    <strong>{formatDate(registrationDate)}</strong>
                </div>

            </div>

            <div className="customer-info-card">

                <h3>Privacy & Security</h3>

                <p>
                    Manage your password and account security.
                </p>

                <Link
                    to="/customer/settings"
                    className="customer-edit-btn"
                >
                    Manage Security →
                </Link>

            </div>

            <div className="customer-info-card">

                <h3>Logout</h3>

                <p>Sign out of your KONFiZ customer account.</p>

                <button
                    className="customer-logout-btn"
                    onClick={handleLogout}
                >
                    ↪ Logout
                </button>

            </div>
        </>
    );

    // =================================================
    // ACTIVE TAB CONTENT
    // =================================================

    const renderActiveContent = () => {

        switch (activeTab) {

            case "overview":
                return renderOverview();

            case "profile":
                return renderProfile();

            case "orders":
                return renderOrders();

            case "addresses":
                return renderAddresses();

            case "wishlist":
                return renderWishlist();

            case "activity":
                return renderRecentActivity();

            case "settings":
                return renderSettings();

            default:
                return renderOverview();
        }
    };

    // =================================================
    // LOADING
    // =================================================

    if (loading) {
        return (
            <div className="customer-dashboard">
                <Navbar />
                <div className="customer-dashboard-content">
                    <h2>Loading your account...</h2>
                </div>
            </div>
        );
    }

    // =================================================
    // MAIN RENDER
    // =================================================

    return (

        <div className="customer-dashboard">

            <Navbar />

            <div className="customer-dashboard-layout">

                <button
                    className="customer-mobile-menu"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                    ☰ {sidebarOpen ? "Close Menu" : "My Account"}
                </button>

                {/* SIDEBAR */}

                <aside className={`customer-sidebar ${sidebarOpen ? "sidebar-open" : ""
                    }`}>

                    <div className="customer-sidebar-profile">

                        <div className="customer-avatar">
                            {customerName.charAt(0).toUpperCase()}
                        </div>

                        <h3>{customerName}</h3>
                        <p>{customerEmail}</p>

                        <span className="customer-member-badge">
                            KONFiZ Customer
                        </span>

                    </div>

                    <div className="customer-sidebar-divider"></div>

                    <nav className="customer-sidebar-nav">

                        {tabs.map(tab => (

                            <button
                                type="button"
                                key={tab.id}
                                className={`customer-nav-link ${activeTab === tab.id ? "active" : ""
                                    }`}
                                onClick={() => changeTab(tab.id)}
                            >
                                <span className="customer-nav-icon">
                                    {tab.icon}
                                </span>

                                {tab.label}

                            </button>

                        ))}

                    </nav>

                    <div className="customer-sidebar-bottom">

                        <Link to="/" className="customer-back-home">
                            ← Back to Shopping
                        </Link>

                        <button
                            className="customer-logout-btn"
                            onClick={handleLogout}
                        >
                            ↪ Logout
                        </button>

                    </div>

                </aside>

                {/* MAIN CONTENT */}

                <main className="customer-dashboard-content">

                    <div className="customer-page-header">

                        <div>
                            <p className="customer-breadcrumb">
                                Home / My Account / {
                                    tabs.find(tab => tab.id === activeTab)?.label
                                }
                            </p>

                            <h1>
                                {activeTab === "overview"
                                    ? `Welcome back, ${customerName.split(" ")[0]}! 👋`
                                    : tabs.find(tab => tab.id === activeTab)?.label
                                }
                            </h1>

                            <p>
                                Manage your KONFiZ customer account.
                            </p>
                        </div>

                        <button
                            className="customer-edit-btn"
                            onClick={() => changeTab("profile")}
                        >
                            ✎ My Profile
                        </button>

                    </div>

                    {/* TAB CONTENT */}

                    <div className="customer-tab-content">
                        {renderActiveContent()}
                    </div>

                    <div className="customer-dashboard-footer">
                        Made with ♡ by KONFiZ – ICE CREAM & HAPPINESS
                    </div>

                </main>

            </div>

        </div>

    );
}

export default CustomerDashboard;
