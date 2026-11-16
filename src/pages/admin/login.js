
import React, { useState } from "react";
import "../../style/login.css";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";

function Login({ onLogin }) {

    const { login } = useAuth();
    const navigate = useNavigate();

    // =====================================
    // MASTER ADMIN
    // =====================================

    const ADMIN_EMAIL = "admin@konfiz.com";
    const ADMIN_PASSWORD = "Konfiz@123";

    // =====================================
    // DEMO CUSTOMER
    // =====================================

    const DEMO_CUSTOMER = {
        id: "KON-DEMO-001",
        name: "Demo Customer",
        email: "demo@konfiz.com",
        password: "Demo@123",
        mobile: "9876543210",
        role: "customer"
    };

    // =====================================
    // STATES
    // =====================================

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [customerId, setCustomerId] = useState("");
    const [mobile, setMobile] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showDemoPassword, setShowDemoPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [demoError, setDemoError] = useState("");

    // =====================================
    // ADMIN LOGIN
    // =====================================

    const handleLogin = (e) => {

        e.preventDefault();

        setError("");
        setDemoError("");
        setLoading(true);

        setTimeout(() => {

            if (
                email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
                password === ADMIN_PASSWORD
            ) {

                const user = {
                    id: "KON-ADMIN-001",
                    name: "Master Admin",
                    email: ADMIN_EMAIL,
                    role: "admin",
                    authenticated: true
                };

                // SAVE GLOBAL ADMIN LOGIN
                login(user);

                if (onLogin) {
                    onLogin(user);
                }

                // ADMIN DASHBOARD
                navigate("/admin/dashboard", { replace: true });

            } else {

                setError("Invalid admin email or password.");

            }

            setLoading(false);

        }, 500);

    };

    // =====================================
    // CUSTOMER LOGIN
    // =====================================

    const handleDemoLogin = (e) => {

        e.preventDefault();

        setDemoError("");
        setError("");
        setLoading(true);

        setTimeout(() => {

            const validCustomer =
                customerId.trim() === DEMO_CUSTOMER.id &&
                email.trim().toLowerCase() ===
                DEMO_CUSTOMER.email.toLowerCase() &&
                password === DEMO_CUSTOMER.password &&
                mobile.trim() === DEMO_CUSTOMER.mobile;

            if (validCustomer) {

                const user = {
                    id: DEMO_CUSTOMER.id,
                    customerId: DEMO_CUSTOMER.id,
                    name: DEMO_CUSTOMER.name,
                    email: DEMO_CUSTOMER.email,
                    mobile: DEMO_CUSTOMER.mobile,
                    role: "customer",
                    isDemo: true,
                    authenticated: true
                };

                // SAVE GLOBAL CUSTOMER LOGIN
                login(user);

                if (onLogin) {
                    onLogin(user);
                }

                // CUSTOMER PRODUCTS PAGE
                navigate("/products", { replace: true });

            } else {

                setDemoError(
                    "Invalid customer ID, email, password or mobile number."
                );

            }

            setLoading(false);

        }, 500);

    };

    // =====================================
    // LOGIN PAGE UI
    // =====================================

    return (

        <div className="login-page">

            <div className="login-card">

                <Link to="/" className="back-home-btn">
                    ← Back to Home
                </Link>

                <div className="login-logo">
                    KONFIZ
                </div>

                <div className="login-subtitle">
                    MASTER ADMINISTRATION
                </div>

                <h2 className="login-title">
                    Welcome Back!
                </h2>

                <p className="login-description">
                    Sign in to manage your online store.
                </p>

                <p className="login-description">
                    admin@konfiz.com <br />
                    Konfiz@123
                </p>

                {/* =====================================
                    ADMIN LOGIN
                ===================================== */}

                <form onSubmit={handleLogin}>

                    {error && (
                        <div className="login-error">
                            {error}
                        </div>
                    )}

                    <div className="login-group">

                        <label>Admin Email</label>

                        <input
                            type="email"
                            className="login-input"
                            placeholder="Enter admin email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                    </div>

                    <div className="login-group">

                        <label>Admin Password</label>

                        <div className="password-wrapper">

                            <input
                                type={showPassword ? "text" : "password"}
                                className="login-input"
                                placeholder="Enter admin password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>

                        </div>

                    </div>

                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >
                        {loading ? "Signing In..." : "ADMIN SIGN IN"}
                    </button>

                </form>

                {/* =====================================
                    CUSTOMER LOGIN DIVIDER
                ===================================== */}

                <div className="login-divider">
                    <span>DEMO CUSTOMER LOGIN</span>
                </div>

                <p className="login-description">
                    ID: KON-DEMO-001<br />
                    Email: demo@konfiz.com<br />
                    Password: Demo@123<br />
                    Mobile: 9876543210
                </p>

                {/* =====================================
                    CUSTOMER LOGIN
                ===================================== */}

                <form onSubmit={handleDemoLogin}>

                    {demoError && (
                        <div className="login-error">
                            {demoError}
                        </div>
                    )}

                    <div className="login-group">

                        <label>Customer ID</label>

                        <input
                            type="text"
                            className="login-input"
                            placeholder="Enter customer ID"
                            value={customerId}
                            onChange={(e) => setCustomerId(e.target.value)}
                            required
                        />

                    </div>

                    <div className="login-group">

                        <label>Customer Email</label>

                        <input
                            type="email"
                            className="login-input"
                            placeholder="Enter customer email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                    </div>

                    <div className="login-group">

                        <label>Mobile Number</label>

                        <input
                            type="tel"
                            className="login-input"
                            placeholder="Enter 10 digit mobile number"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            maxLength={10}
                            pattern="[0-9]{10}"
                            required
                        />

                    </div>

                    <div className="login-group">

                        <label>Customer Password</label>

                        <div className="password-wrapper">

                            <input
                                type={showDemoPassword ? "text" : "password"}
                                className="login-input"
                                placeholder="Enter customer password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() =>
                                    setShowDemoPassword(!showDemoPassword)
                                }
                            >
                                {showDemoPassword ? "Hide" : "Show"}
                            </button>

                        </div>

                    </div>

                    <button
                        type="submit"
                        className="demo-login-button"
                        disabled={loading}
                    >
                        {loading
                            ? "Please Wait..."
                            : "CONTINUE AS DEMO CUSTOMER"}
                    </button>

                </form>

                {/* SECURITY */}
                <div className="login-security">
                    🔒 Secure Login
                </div>

                {/* FOOTER */}
                <div className="login-footer">
                    © {new Date().getFullYear()} KONFIZ. All Rights Reserved.
                </div>

            </div>

        </div>

    );

}

export default Login;
