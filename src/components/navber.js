
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useCart } from "../context/cartcontext";
import { useAuth } from "../context/authContext";

import DynamicIcon from "./dynamicIcon";
import CartDrawer from "./CartDrawer";
import Marquee from "react-fast-marquee";

import "../App.css";

function Navbar() {
    // =====================================
    // AUTHENTICATION
    // =====================================

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Normalize role to avoid uppercase/lowercase issues
    const userRole = String(user?.role || "").toLowerCase().trim();

    const isAdmin = userRole === "admin";
    const isCustomer = userRole === "customer";

    const isLoggedIn = !!user && user.authenticated !== false;

    const customer = isCustomer ? user : null;
    const adminEmail = isAdmin ? user?.email : "";

    // =====================================
    // CART STATE
    // =====================================

    const [cartOpen, setCartOpen] = useState(false);

    const {
        cartCount,
        totalQuantity
    } = useCart();

    const displayCartCount = cartCount ?? totalQuantity ?? 0;

    // =====================================
    // NAVBAR SCROLL STATE
    // =====================================

    const [showNavbar, setShowNavbar] = useState(true);

    useEffect(() => {
        let lastScrollY = window.scrollY;

        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY <= 80) {
                setShowNavbar(true);
            } else if (currentScrollY > lastScrollY) {
                setShowNavbar(false);
            } else if (currentScrollY < lastScrollY) {
                setShowNavbar(true);
            }

            lastScrollY = currentScrollY;
        };

        window.addEventListener("scroll", handleScroll, {
            passive: true
        });

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    // =====================================
    // LOGOUT
    // =====================================

    const handleLogout = () => {
        setCartOpen(false);
        logout();
        navigate("/");
    };

    // =====================================
    // CART DRAWER
    // =====================================

    const openCart = () => {
        setCartOpen(true);
    };

    const closeCart = () => {
        setCartOpen(false);
    };

    // =====================================
    // DASHBOARD NAVIGATION
    // =====================================

    const dashboardPath = isAdmin
        ? "/admin/dashboard"
        : "/customer/dashboard";

    return (
        <>
            {/* =====================================
                TOP OFFER BAR
            ===================================== */}

            <div className="topbar">
                <Marquee
                    speed={50}
                    pauseOnHover={true}
                    gradient={false}
                >
                    <span style={{ marginRight: "2rem" }}>
                        Scoop Into Happiness!
                    </span>

                    <span style={{ marginRight: "2rem" }}>
                        Taste the Magic, Feel the Joy!
                    </span>

                    <span style={{ marginRight: "2rem" }}>
                        Every Scoop Tells a Sweet Story!
                    </span>
                </Marquee>
            </div>

            {/* =====================================
                MAIN NAVBAR
            ===================================== */}

            <nav className={`navbar ${showNavbar ? "" : "navbar-hidden"}`}>

                {/* LOGO */}

                <Link to="/" className="logo">
                    KONFiZ
                    <small>ICE CREAM</small>
                </Link>

                {/* =====================================
                    MAIN NAVIGATION
                ===================================== */}

                <div className="nav-links">

                    <Link to="/">
                        Home
                    </Link>

                    {/* PRODUCTS MEGA MENU */}

                    <div className="nav-dropdown">

                        <Link
                            to="/products"
                            className="nav-product-link"
                        >
                            Products

                            <span className="dropdown-arrow">
                                <DynamicIcon
                                    name="dropdown"
                                    size={14}
                                />
                            </span>
                        </Link>

                        <div className="mega-menu">

                            <div className="mega-menu-content">

                                <div className="mega-menu-heading">

                                    <span>
                                        EXPLORE OUR PRODUCTS
                                    </span>

                                    <h2>
                                        Find Your Favourite Treat!
                                    </h2>

                                    <p>
                                        Discover something delicious
                                        for every mood.
                                    </p>

                                </div>

                                <div className="mega-menu-grid">

                                    <Link
                                        to="/products?category=cones"
                                        className="mega-item"
                                    >
                                        <div>
                                            <h3>Gelato</h3>
                                            <p>Cup · Cone · Stick</p>
                                        </div>
                                    </Link>

                                    <Link
                                        to="/products?category=tubs"
                                        className="mega-item"
                                    >
                                        <div>
                                            <h3>Kulfi</h3>
                                            <p>Rajasthani · Punjabi · Matka</p>
                                        </div>
                                    </Link>

                                    <Link
                                        to="/products?category=family-packs"
                                        className="mega-item"
                                    >
                                        <div>
                                            <h3>Sorbet</h3>
                                            <p>Cup</p>
                                        </div>
                                    </Link>

                                    <Link
                                        to="/products?category=sundaes"
                                        className="mega-item"
                                    >
                                        <div>
                                            <h3>Popsicles</h3>
                                            <p>Mini · Big · Real Fruit</p>
                                        </div>
                                    </Link>

                                    <Link
                                        to="/products?category=sticks"
                                        className="mega-item"
                                    >
                                        <div>
                                            <h3>Chocolate</h3>
                                            <p>All Chocolate Products</p>
                                        </div>
                                    </Link>

                                    <Link
                                        to="/products?category=milkshakes"
                                        className="mega-item"
                                    >
                                        <div>
                                            <h3>Breads & Buns</h3>
                                            <p>All Bakery Products</p>
                                        </div>
                                    </Link>

                                    <Link
                                        to="/products?category=cookies"
                                        className="mega-item"
                                    >
                                        <div>
                                            <h3>Cookies</h3>
                                            <p>All Cookie Products</p>
                                        </div>
                                    </Link>

                                    <Link
                                        to="/products?category=dips-spreads"
                                        className="mega-item"
                                    >
                                        <div>
                                            <h3>Dips & Spreads</h3>
                                            <p>
                                                Hummus · Pesto · Hazelnut ·
                                                Biskia · Magnum Spread
                                            </p>
                                        </div>
                                    </Link>

                                </div>

                                <div className="mega-menu-footer">

                                    <span>
                                        🍦 A little scoop of happiness
                                        in every bite!
                                    </span>

                                    <Link to="/products">
                                        View All Products →
                                    </Link>

                                </div>

                            </div>
                        </div>
                    </div>

                    <Link to="/quick-delivery">
                        30 Minute Delivery in Kolkata
                    </Link>

                    <Link to="/distinguished-flavours">
                        Our Distinguished Flavours
                    </Link>

                    <Link to="/we-make-you-sell">
                        We Make You Sell
                    </Link>

                    <Link to="/our-story">
                        Our Story
                    </Link>

                </div>

                {/* =====================================
                    USER AND CART SECTION
                ===================================== */}

                <div className="navbar-user-section">

                    {/* =====================================
                        LOGIN / CUSTOMER / ADMIN PROFILE
                    ===================================== */}

                    {isLoggedIn ? (

                        <div className="navbar-profile">

                            <div className="profile-info">

                                <span className="profile-icon">
                                    <DynamicIcon
                                        name="profile"
                                        size={21}
                                    />
                                </span>

                                <div className="profile-details">

                                    <strong>
                                        {isAdmin
                                            ? "Administrator"
                                            : customer?.name ||
                                              customer?.fullName ||
                                              "Customer"}
                                    </strong>

                                    <small>
                                        {isAdmin
                                            ? "Admin"
                                            : customer?.customerId ||
                                              customer?.id ||
                                              "Customer"}
                                    </small>

                                </div>

                                {/* =====================================
                                    PROFILE DROPDOWN
                                ===================================== */}

                                <div className="profile-dropdown">

                                    <h3>
                                        Profile Information
                                    </h3>

                                    <p>
                                        <strong>Name:</strong>{" "}
                                        {isAdmin
                                            ? user?.name || "Administrator"
                                            : customer?.name ||
                                              customer?.fullName ||
                                              "Customer"}
                                    </p>

                                    <p>
                                        <strong>Role:</strong>{" "}
                                        {isAdmin ? "Admin" : "Customer"}
                                    </p>

                                    <p>
                                        <strong>Email:</strong>{" "}
                                        {isAdmin
                                            ? adminEmail || "N/A"
                                            : customer?.email || "N/A"}
                                    </p>

                                    {/* CUSTOMER INFORMATION */}

                                    {isCustomer && (
                                        <>
                                            <p>
                                                <strong>Customer ID:</strong>{" "}
                                                {customer?.customerId ||
                                                    customer?.id ||
                                                    "N/A"}
                                            </p>

                                            <p>
                                                <strong>Mobile:</strong>{" "}
                                                {customer?.mobile ||
                                                    customer?.phone ||
                                                    "N/A"}
                                            </p>
                                        </>
                                    )}

                                    {/* =====================================
                                        ADMIN DASHBOARD
                                    ===================================== */}

                                    {isAdmin && (
                                        <Link
                                            to="/admin/dashboard"
                                            className="profile-dashboard-link"
                                        >
                                            <DynamicIcon
                                                name="dashboard"
                                                size={17}
                                            />

                                            Admin Dashboard
                                        </Link>
                                    )}

                                    {/* =====================================
                                        CUSTOMER DASHBOARD
                                    ===================================== */}

                                    {isCustomer && (
                                        <Link
                                            to="/customer/dashboard"
                                            className="profile-dashboard-link"
                                        >
                                            <DynamicIcon
                                                name="dashboard"
                                                size={17}
                                            />

                                            My Account
                                        </Link>
                                    )}

                                    {/* =====================================
                                        LOGOUT
                                    ===================================== */}

                                    <button
                                        className="logout-btn"
                                        type="button"
                                        onClick={handleLogout}
                                    >
                                        <DynamicIcon
                                            name="logout"
                                            size={17}
                                        />

                                        Logout
                                    </button>

                                </div>
                            </div>
                        </div>

                    ) : (

                        /* LOGGED OUT */

                        <Link
                            className="konfiz_login"
                            to="/login"
                        >
                            Login
                        </Link>

                    )}

                    {/* =====================================
                        STICKY CART BUTTON
                    ===================================== */}

                    <div
                        className="cart-button"
                        onClick={openCart}
                        aria-label="Open shopping cart"
                        aria-expanded={cartOpen}
                    >

                        <button
                            type="button"
                            className="navbar-cart-button"
                            aria-label="Open cart"
                        >
                            <DynamicIcon
                                name="cart"
                                size={23}
                            />
                        </button>

                        <span className="navbar-cart-count">
                            {displayCartCount}
                        </span>

                    </div>

                </div>

            </nav>

            {/* =====================================
                GLOBAL OFF-CANVAS CART DRAWER
            ===================================== */}

            <CartDrawer
                isOpen={cartOpen}
                onClose={closeCart}
            />

        </>
    );
}

export default Navbar;
