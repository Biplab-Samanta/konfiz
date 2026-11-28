
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import { useCart } from "../context/cartcontext";
import { useAuth } from "../context/authContext";

import DynamicIcon from "./dynamicIcon";
import CartDrawer from "./CartDrawer";
import Marquee from "react-fast-marquee";
// import { FaArrowUp } from "react-icons/fa";

// import "../App.css";
import "../style/navbar.css";
// =====================================
// PRODUCT CATEGORIES
// =====================================

const productCategories = [
    {
        name: "gelato",
        description: "Cup · Cone · Stick",
        category: "cones"
    },
    {
        name: "kulfi",
        description: "Rajasthani · Punjabi · Matka",
        category: "tubs"
    },
    {
        name: "sorbet",
        description: "Cup",
        category: "family-packs"
    },
    {
        name: "popsicles",
        description: "Mini · Big · Real Fruit",
        category: "sundaes"
    },
    {
        name: "chocolate",
        description: "All Chocolate Products",
        category: "sticks"
    },
    {
        name: "bread-&-buns",
        description: "All Bakery Products",
        category: "milkshakes"
    },
    {
        name: "cookies",
        description: "All Cookie Products",
        category: "cookies"
    },
    {
        name: "dips-&-spread",
        description: "Hummus · Pesto · Hazelnut · Biskia · Magnum Spread",
        category: "dips-spreads"
    }
];


// =====================================
// OTHER NAVIGATION LINKS
// =====================================

const navigationLinks = [
    {
        name: "30 Minute Delivery in Kolkata",
        path: "/quick-delivery"
    },
    {
        name: "Our Distinguished Flavours",
        path: "/distinguished-flavours"
    },
     {
        name: "Blog",
        path: "/blog"
    },
    {
        name: "We Make You Sell",
        path: "/we-make-you-sell"
    },
    {
        name: "Our Story",
        path: "/our-story"
    }
];


// =====================================
// MOBILE NAVIGATION LINK
// =====================================

function MobileNavLink({ to, children, onNavigate }) {
    return (
        <Link to={to} onClick={onNavigate}>
            <span>{children}</span>
            <DynamicIcon name="arrowRight" size={17} />
        </Link>
    );
}


// =====================================
// MAIN NAVBAR
// =====================================

function Navbar() {

    // =====================================
    // AUTHENTICATION
    // =====================================

    const { user, logout } = useAuth();

    const navigate = useNavigate();
    // const handleCategoryClick = (category) => {
    //     const categoryId = category
    //         .toLowerCase()
    //         .trim()
    //         .replace(/\s+/g, "-");

    //     navigate(`/products#${categoryId}`);
    // };
    const location = useLocation();

    const userRole = String(user?.role || "").toLowerCase().trim();

    const isAdmin = userRole === "admin";
    const isCustomer = userRole === "customer";

    const isLoggedIn = !!user && user.authenticated !== false;

    const customer = isCustomer ? user : null;

    const adminEmail = isAdmin ? user?.email : "";

    const dashboardPath = isAdmin
        ? "/admin/dashboard"
        : "/customer/dashboard";


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
    // SCROLL STATE
    // =====================================

    // const [isScrolled, setIsScrolled] = useState(false);

    // useEffect(() => {

    //     const handleScroll = () => {
    //         setIsScrolled(window.scrollY > 80);
    //     };

    //     window.addEventListener("scroll", handleScroll, {
    //         passive: true
    //     });

    //     return () => {
    //         window.removeEventListener("scroll", handleScroll);
    //     };

    // }, []);


    // =====================================
    // MOBILE OFFCANVAS STATE
    // =====================================

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [mobileProductsOpen, setMobileProductsOpen] = useState(false);


    // =====================================
    // MOBILE MENU FUNCTIONS
    // =====================================

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
        setMobileProductsOpen(false);
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(prev => !prev);
    };

    const toggleMobileProducts = () => {
        setMobileProductsOpen(prev => !prev);
    };

    // scroll to top 
    // =====================================
// SCROLL STATE + SCROLL TO TOP
// =====================================

const [isScrolled, setIsScrolled] = useState(false);
const [showScrollTop, setShowScrollTop] = useState(false);

useEffect(() => {

    const handleScroll = () => {
        const scrollPosition = window.scrollY;

        setIsScrolled(scrollPosition > 80);
        setShowScrollTop(scrollPosition > 300);
    };

    window.addEventListener("scroll", handleScroll, {
        passive: true
    });

    // Check initial scroll position
    handleScroll();

    return () => {
        window.removeEventListener("scroll", handleScroll);
    };

}, []);

const scrollToTop = () => {
    window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth"
    });
};
    // =====================================
    // BODY SCROLL LOCK
    // =====================================

    useEffect(() => {

        document.body.style.overflow = mobileMenuOpen
            ? "hidden"
            : "";

        return () => {
            document.body.style.overflow = "";
        };

    }, [mobileMenuOpen]);


    // =====================================
    // ESCAPE KEY
    // =====================================

    useEffect(() => {

        const handleEscape = (event) => {
            if (event.key === "Escape") {
                closeMobileMenu();
                setCartOpen(false);
            }
        };

        window.addEventListener("keydown", handleEscape);

        return () => {
            window.removeEventListener("keydown", handleEscape);
        };

    }, []);


    // =====================================
    // CLOSE DRAWER AFTER ROUTE CHANGE
    // =====================================

    useEffect(() => {
        closeMobileMenu();
    }, [location.pathname, location.search]);


    // =====================================
    // LOGOUT
    // =====================================

    const handleLogout = () => {

        closeMobileMenu();
        setCartOpen(false);

        logout();

        navigate("/");
    };


    // =====================================
    // CART FUNCTIONS
    // =====================================

    const openCart = () => {
        closeMobileMenu();
        setCartOpen(true);
    };

    const closeCart = () => {
        setCartOpen(false);
    };


    // =====================================
    // MOBILE ACCOUNT NAVIGATION
    // =====================================

    const openAccount = () => {

        closeMobileMenu();

        navigate(isLoggedIn ? dashboardPath : "/login");
    };


    // =====================================
    // ACTIVE NAVIGATION
    // =====================================

    const isHomeActive = location.pathname === "/";

    const isProductsActive = location.pathname === "/products";

    const isAccountActive =
        location.pathname === "/login" ||
        location.pathname.includes("dashboard");


    // =====================================
    // RENDER
    // =====================================

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

            <nav className={`navbar ${isScrolled ? "navbar-hidden" : ""}`}>

                {/* LOGO + MOBILE HAMBURGER */}

                <div className="navbar-brand-wrapper">

                    <Link
                        to="/"
                        className="logo"
                        onClick={closeMobileMenu}
                    >
                        KONFiZ
                        <small>ICE CREAM</small>
                    </Link>

                    <button
                        type="button"
                        className="mobile-menu-toggle"
                        onClick={toggleMobileMenu}
                        aria-label="Toggle navigation"
                        aria-expanded={mobileMenuOpen}
                    >
                        <DynamicIcon
                            name={mobileMenuOpen ? "close" : "menu"}
                            size={25}
                        />
                    </button>

                </div>


                {/* =====================================
                    DESKTOP NAVIGATION
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

                                    {productCategories.map(category => (

                                        <Link
                                            key={category.category}
                                            to={`/products#${category.name}`}
                                            className="mega-item"
                                        >

                                            <div>
                                                <h3>{category.name}</h3>
                                                <p>{category.description}</p>
                                            </div>

                                        </Link>

                                    ))}

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


                    {/* OTHER LINKS */}

                    {navigationLinks.map(link => (

                        <Link
                            key={link.path}
                            to={link.path}
                        >
                            {link.name}
                        </Link>

                    ))}

                </div>


                {/* =====================================
                    DESKTOP USER SECTION
                ===================================== */}

                <div className="navbar-user-section">

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


                                {/* PROFILE DROPDOWN */}

                                <div className="profile-dropdown">

                                    <h3>Profile Information</h3>

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

                        <Link
                            className="konfiz_login"
                            to="/login"
                        >
                            Login
                        </Link>

                    )}


                    {/* DESKTOP CART */}

                    <button
                        type="button"
                        className="navbar-cart-button"
                        onClick={openCart}
                        aria-label="Open shopping cart"
                    >

                        <DynamicIcon
                            name="cart"
                            size={30}
                        />

                        <span className="navbar-cart-count">
                            {displayCartCount}
                        </span>

                    </button>

                </div>

            </nav>


            {/* =====================================
                MOBILE OFFCANVAS OVERLAY
            ===================================== */}

            <div
                className={`mobile-menu-overlay ${mobileMenuOpen ? "active" : ""
                    }`}
                onClick={closeMobileMenu}
                aria-hidden={!mobileMenuOpen}
            >

                <aside
                    className={`mobile-offcanvas ${mobileMenuOpen ? "active" : ""
                        }`}
                    onClick={event => event.stopPropagation()}
                    aria-label="Mobile navigation"
                    aria-modal="true"
                    role="dialog"
                >

                    {/* DRAWER HEADER */}

                    <div className="mobile-offcanvas-header">

                        <Link
                            to="/"
                            className="mobile-menu-logo"
                            onClick={closeMobileMenu}
                        >
                            KONFiZ
                            <small>ICE CREAM & HAPPINESS</small>
                        </Link>

                        <button
                            type="button"
                            className="mobile-menu-close"
                            onClick={closeMobileMenu}
                            aria-label="Close menu"
                        >
                            <DynamicIcon
                                name="close"
                                size={24}
                            />
                        </button>

                    </div>


                    {/* DRAWER LINKS */}

                    <div className="mobile-menu-body">

                        <MobileNavLink
                            to="/"
                            onNavigate={closeMobileMenu}
                        >
                            Home
                        </MobileNavLink>


                        {/* PRODUCTS ACCORDION */}

                        <div className="mobile-products-section">

                            <div className="mobile-products-heading">

                                <Link
                                    to="/products"
                                    onClick={closeMobileMenu}
                                >
                                    Products
                                </Link>

                                <button
                                    type="button"
                                    onClick={toggleMobileProducts}
                                    aria-expanded={mobileProductsOpen}
                                    aria-label="Toggle product categories"
                                >
                                    <DynamicIcon
                                        name="dropdown"
                                        size={19}
                                    />
                                </button>

                            </div>


                            {mobileProductsOpen && (

                                <div className="mobile-submenu">

                                    {productCategories.map(category => (

                                        <Link
                                            key={category.category}
                                            to={`/products?category=${category.category}`}
                                            onClick={closeMobileMenu}
                                        >
                                            {category.name}
                                        </Link>

                                    ))}

                                    <Link
                                        to="/products"
                                        onClick={closeMobileMenu}
                                    >
                                        View All Products →
                                    </Link>

                                </div>

                            )}

                        </div>


                        {/* OTHER NAVIGATION LINKS */}

                        {navigationLinks.map(link => (

                            <MobileNavLink
                                key={link.path}
                                to={link.path}
                                onNavigate={closeMobileMenu}
                            >
                                {link.name}
                            </MobileNavLink>

                        ))}

                    </div>


                    {/* DRAWER ACCOUNT SECTION */}

                    <div className="mobile-menu-account">

                        {isLoggedIn ? (

                            <>

                                <div className="mobile-account-info">

                                    <DynamicIcon
                                        name="profile"
                                        size={23}
                                    />

                                    <div>

                                        <strong>
                                            {isAdmin
                                                ? "Administrator"
                                                : customer?.name ||
                                                customer?.fullName ||
                                                "Customer"}
                                        </strong>

                                        <small>
                                            {isAdmin
                                                ? "Admin Account"
                                                : "Customer Account"}
                                        </small>

                                    </div>

                                </div>


                                <Link
                                    to={dashboardPath}
                                    className="mobile-account-dashboard"
                                    onClick={closeMobileMenu}
                                >
                                    <DynamicIcon
                                        name="dashboard"
                                        size={18}
                                    />

                                    {isAdmin
                                        ? "Admin Dashboard"
                                        : "My Account"}
                                </Link>


                                <button
                                    type="button"
                                    className="mobile-account-logout"
                                    onClick={handleLogout}
                                >
                                    <DynamicIcon
                                        name="logout"
                                        size={18}
                                    />
                                    Logout
                                </button>

                            </>

                        ) : (

                            <Link
                                to="/login"
                                className="mobile-account-login"
                                onClick={closeMobileMenu}
                            >
                                <DynamicIcon
                                    name="profile"
                                    size={19}
                                />

                                Login / My Account
                            </Link>

                        )}

                    </div>


                    {/* DRAWER FOOTER */}

                    <div className="mobile-menu-footer">
                        🍦 A little scoop of happiness!
                    </div>

                </aside>

            </div>


            {/*   MOBILE FIXED BOTTOM NAVBAR  */}

            <div className="mobile-bottom-navbar">

                {/* HOME */}

                <Link
                    to="/"
                    className={`mobile-bottom-item ${isHomeActive ? "active" : ""
                        }`}
                >
                    <DynamicIcon
                        name="home"
                        size={21}
                    />

                    <span>Home</span>
                </Link>


                {/* PRODUCTS */}

                <Link
                    to="/products"
                    className={`mobile-bottom-item ${isProductsActive ? "active" : ""
                        }`}
                >
                    <DynamicIcon
                        name="shoppingBag"
                        size={21}
                    />

                    <span>Products</span>
                </Link>


                {/* CART */}

                <button
                    type="button"
                    className="mobile-bottom-item mobile-bottom-cart"
                    onClick={openCart}
                >

                    <span className="mobile-bottom-cart-icon">

                        <DynamicIcon
                            name="cart"
                            size={21}
                        />

                        {displayCartCount > 0 && (
                            <span className="mobile-bottom-cart-count">
                                {displayCartCount}
                            </span>
                        )}

                    </span>

                    <span>Cart</span>

                </button>


                {/* ACCOUNT */}

                <button
                    type="button"
                    className={`mobile-bottom-item ${isAccountActive ? "active" : ""
                        }`}
                    onClick={openAccount}
                >

                    <DynamicIcon
                        name="profile"
                        size={21}
                    />

                    <span>Account</span>

                </button>

            </div>
            {showScrollTop && (
                <button
                    className="scroll-to-top"
                    onClick={scrollToTop}
                    aria-label="Scroll to top"
                    title="Scroll to top"
                >
                  <DynamicIcon name="rocket" size={22} />
                </button>
            )}

            {/* =====================================
                GLOBAL CART DRAWER
            ===================================== */}

            <CartDrawer
                isOpen={cartOpen}
                onClose={closeCart}
            />

        </>
    );
}

export default Navbar;
