
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../src/App.css";

function Navbar() {

    const navigate = useNavigate();

    // CHECK ADMIN LOGIN
    const isAdmin =
        sessionStorage.getItem("konfizAdminLoggedIn") === "true";

    const adminEmail =
        sessionStorage.getItem("konfizAdminEmail");

    // GET CUSTOMER PROFILE
    let customer = null;

    try {
        customer = JSON.parse(
            sessionStorage.getItem("konfizCustomer") || "null"
        );
    } catch (error) {
        customer = null;
    }

    const isLoggedIn = isAdmin || !!customer;

    // LOGOUT FUNCTION
    const handleLogout = () => {

        sessionStorage.removeItem("konfizAdminLoggedIn");
        sessionStorage.removeItem("konfizAdminEmail");
        sessionStorage.removeItem("konfizCustomer");

        navigate("/login");
    };

    return (

        <nav className="navbar">

            {/* LOGO */}
            <Link to="/" className="logo">
                KONFiZ
                <small>ICE CREAM & HAPPINESS</small>
            </Link>

            {/* NAVIGATION LINKS */}
            <div className="nav-links">
                <Link to="/">Home</Link>
                <Link to="/products">Products</Link>

                <a href="/#categories">Categories</a>
                <a href="/#products">Our Flavours</a>
                <a href="/#story">Our Story</a>
            </div>

            {/* PROFILE AND CART */}
            <div className="navbar-user-section">

                {isLoggedIn ? (

                    <div className="navbar-profile">

                        {/* PROFILE INFORMATION */}
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
                                        : customer?.customerId || customer?.id || "Customer"}
                                </small>

                            </div>

                            {/* PROFILE DROPDOWN */}
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
                                    {isAdmin ? "Admin" : customer?.role || "Customer"}
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
                                            {customer?.customerId || customer?.id || "N/A"}
                                        </p>

                                        <p>
                                            <strong>Mobile:</strong>{" "}
                                            {customer?.mobile || "N/A"}
                                        </p>
                                    </>
                                )}

                                <button
                                    className="logout-btn"
                                    onClick={handleLogout}
                                    type="button"
                                >
                                    Logout
                                </button>

                            </div>

                        </div>

                    </div>

                ) : (

                    <Link className="konfiz_login" to="/login">
                        login
                    </Link>

                )}

                {/* CART */}
                <a href="#products" className="cart-button">
                    🛒 Cart
                </a>

            </div>

        </nav>

    );
}

export default Navbar;
