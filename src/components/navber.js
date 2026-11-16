
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/cartcontext";
import { useAuth } from "../context/authContext";
import "../App.css";

function Navbar() {

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const { cartCount } = useCart();

    // =====================================
    // GLOBAL ADMIN AND CUSTOMER LOGIN
    // =====================================

    const isAdmin = user?.role?.toLowerCase() === "admin";

    const isLoggedIn = !!user;

    // ADMIN PROFILE
    const adminEmail = isAdmin ? user?.email : "";

    // CUSTOMER PROFILE
    const customer = isAdmin ? null : user;

    // =====================================
    // LOGOUT
    // =====================================

    const handleLogout = () => {

        // Clear shared authentication
        logout();

        // Redirect to home page
        navigate("/");

    };

    return (

        <nav className="navbar">
            <div>
                
            </div>
            {/* LOGO */}
            <Link to="/" className="logo">
                KONFiZ
                <small>ICE CREAM</small>
            </Link>

            {/* NAVIGATION */}
            <div className="nav-links">

                <Link to="/">Home</Link>

                {/* PRODUCTS MEGA MENU */}
                <div className="nav-dropdown">

                    <Link to="/products" className="nav-product-link">
                        Products <span className="dropdown-arrow">v</span>
                    </Link>

                    <div className="mega-menu">

                        <div className="mega-menu-content">

                            <div className="mega-menu-heading">
                                <span>EXPLORE OUR PRODUCTS</span>
                                <h2>Find Your Favourite Treat!</h2>
                                <p>Discover something delicious for every mood.</p>
                            </div>

                            <div className="mega-menu-grid">

                                <Link to="/products?category=cones" className="mega-item">
                                    <span className="mega-emoji">🍦</span>
                                    <div>
                                        <h3>Ice Cream Cones</h3>
                                        <p>Classic and premium cones</p>
                                    </div>
                                </Link>

                                <Link to="/products?category=tubs" className="mega-item">
                                    <span className="mega-emoji">🍨</span>
                                    <div>
                                        <h3>Ice Cream Tubs</h3>
                                        <p>Delicious tubs in every flavour</p>
                                    </div>
                                </Link>

                                <Link to="/products?category=family-packs" className="mega-item">
                                    <span className="mega-emoji">👨‍👩‍👧‍👦</span>
                                    <div>
                                        <h3>Family Packs</h3>
                                        <p>More happiness to share</p>
                                    </div>
                                </Link>

                                <Link to="/products?category=sundaes" className="mega-item">
                                    <span className="mega-emoji">🍧</span>
                                    <div>
                                        <h3>Sundaes</h3>
                                        <p>Loaded dessert combinations</p>
                                    </div>
                                </Link>

                                <Link to="/products?category=sticks" className="mega-item">
                                    <span className="mega-emoji">🍫</span>
                                    <div>
                                        <h3>Ice Cream Sticks</h3>
                                        <p>Chocolate-coated treats</p>
                                    </div>
                                </Link>

                                <Link to="/products?category=milkshakes" className="mega-item">
                                    <span className="mega-emoji">🥤</span>
                                    <div>
                                        <h3>Milkshakes</h3>
                                        <p>Thick and creamy shakes</p>
                                    </div>
                                </Link>

                            </div>

                            <div className="mega-menu-footer">
                                <span>🍦 A little scoop of happiness in every bite!</span>
                                <Link to="/products">View All Products →</Link>
                            </div>

                        </div>

                    </div>

                </div>

                <a href="/#categories">Categories</a>

                <a href="/#products">Our Flavours</a>

                <a href="/#story">Our Story</a>

            </div>

            {/* USER AND CART */}
            <div className="navbar-user-section">

                {/* LOGIN / PROFILE */}
                {isLoggedIn ? (

                    <div className="navbar-profile">

                        <div className="profile-info">

                            <span className="profile-icon">
                                👤
                            </span>

                            <div className="profile-details">

                                <strong>
                                    {isAdmin
                                        ? "Administrator"
                                        : customer?.name || "Customer"}
                                </strong>

                                <small>
                                    {isAdmin
                                        ? "Admin"
                                        : customer?.customerId ||
                                        customer?.id ||
                                        "Customer"}
                                </small>

                            </div>

                            <div className="profile-dropdown">

                                <h3>Profile Information</h3>

                                <p>
                                    <strong>Name:</strong>{" "}
                                    {isAdmin
                                        ? "Administrator"
                                        : customer?.name || "Customer"}
                                </p>

                                <p>
                                    <strong>Role:</strong>{" "}
                                    {isAdmin
                                        ? "Admin"
                                        : customer?.role || "Customer"}
                                </p>

                                <p>
                                    <strong>Email:</strong>{" "}
                                    {isAdmin
                                        ? adminEmail
                                        : customer?.email || "N/A"}
                                </p>

                                {!isAdmin && (
                                    <>
                                        <p>
                                            <strong>Customer ID:</strong>{" "}
                                            {customer?.customerId ||
                                                customer?.id ||
                                                "N/A"}
                                        </p>

                                        <p>
                                            <strong>Mobile:</strong>{" "}
                                            {customer?.mobile || "N/A"}
                                        </p>
                                    </>
                                )}

                                <button
                                    className="logout-btn"
                                    type="button"
                                    onClick={handleLogout}
                                >
                                    Logout
                                </button>

                            </div>

                        </div>

                    </div>

                ) : (

                    <Link className="konfiz_login" to="/login">
                        Login
                    </Link>

                )}

                {/* LIVE CART */}
                <Link to="/cart" className="cart-button">

                    {/* <span className="cart-icon">
                        🛒
                    </span> */}

                    Cart

                    <span className="cart-count">
                        {cartCount}
                    </span>

                </Link>

            </div>

        </nav>

    );

}

export default Navbar;
