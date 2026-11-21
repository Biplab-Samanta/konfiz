
import React, { useState } from "react";
import "../../style/login.css";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";

function Login({ onLogin }) {
    const { login } = useAuth();
    const navigate = useNavigate();

    // =====================================
    // MASTER ADMIN CREDENTIALS
    // =====================================

    const ADMIN_EMAIL = "admin@konfiz.com";
    const ADMIN_PASSWORD = "Konfiz@123";

    // =====================================
    // STORAGE
    // =====================================

    const ACCOUNT_KEY = "konfiz_accounts";

    const getAccounts = () => {
        try {
            return JSON.parse(localStorage.getItem(ACCOUNT_KEY)) || [];
        } catch {
            return [];
        }
    };

    const saveAccounts = (accounts) => {
        localStorage.setItem(ACCOUNT_KEY, JSON.stringify(accounts));
    };

    // =====================================
    // STATES
    // =====================================

    // Customer is selected by default
    const [selectedRole, setSelectedRole] = useState("customer");

    const [isRegister, setIsRegister] = useState(false);

    const [name, setName] = useState("");
    const [mobile, setMobile] = useState("");
    const [email, setEmail] = useState("");
    const [location, setLocation] = useState("");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // =====================================
    // RESET FORM
    // =====================================

    const resetForm = () => {
        setName("");
        setMobile("");
        setEmail("");
        setLocation("");
        setPassword("");
        setConfirmPassword("");
        setShowPassword(false);
        setError("");
    };

    const switchRole = (role) => {
        setSelectedRole(role);
        setIsRegister(false);
        resetForm();
    };

    // =====================================
    // GENERATE CUSTOMER / VENDOR ID
    // =====================================

    const generateId = (role) => {
        const accounts = getAccounts();

        const prefix =
            role === "customer" ? "KON-CUS-" : "KON-VEN-";

        const highestNumber = accounts
            .filter((account) => account.role === role)
            .reduce((max, account) => {
                const number = parseInt(
                    String(account.id || "").replace(prefix, ""),
                    10
                );

                return Number.isFinite(number)
                    ? Math.max(max, number)
                    : max;
            }, 1000);

        return `${prefix}${String(highestNumber + 1).padStart(4, "0")}`;
    };

    // =====================================
    // COMPLETE LOGIN
    // =====================================

    const completeLogin = (user, destination) => {
        // Never pass password into AuthContext
        const sessionUser = { ...user };
        delete sessionUser.password;

        sessionUser.authenticated = true;

        login(sessionUser);

        if (onLogin) {
            onLogin(sessionUser);
        }

        navigate(destination, { replace: true });
    };

    // =====================================
    // ADMIN LOGIN
    // =====================================

    const handleAdminLogin = (e) => {
        e.preventDefault();
        setError("");

        setLoading(true);

        if (
            email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
            password === ADMIN_PASSWORD
        ) {
            const adminUser = {
                id: "KON-ADMIN-001",
                name: "Master Admin",
                email: ADMIN_EMAIL,
                role: "admin",
                authenticated: true
            };

            completeLogin(adminUser, "/admin/dashboard");
        } else {
            setError("Invalid admin email or password.");
        }

        setLoading(false);
    };

    // =====================================
    // CUSTOMER / VENDOR REGISTRATION
    // =====================================

    const handleRegister = (e) => {
        e.preventDefault();
        setError("");

        const cleanName = name.trim();
        const cleanMobile = mobile.trim();
        const cleanEmail = email.trim().toLowerCase();
        const cleanLocation = location.trim();

        if (!cleanName) {
            setError("Please enter your name.");
            return;
        }

        if (!/^[0-9]{10}$/.test(cleanMobile)) {
            setError("Enter a valid 10-digit mobile number.");
            return;
        }

        if (selectedRole === "vendor" && !cleanEmail) {
            setError("Email is required for vendor registration.");
            return;
        }

        if (
            cleanEmail &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
        ) {
            setError("Please enter a valid email address.");
            return;
        }

        if (selectedRole === "vendor" && !cleanLocation) {
            setError("Please enter your business location.");
            return;
        }

        if (password.length < 6) {
            setError("Password must contain at least 6 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        const accounts = getAccounts();

        const duplicateMobile = accounts.some(
            (account) => account.mobile === cleanMobile
        );

        if (duplicateMobile) {
            setError(
                "This mobile number is already registered. Please login."
            );
            return;
        }

        if (cleanEmail) {
            const duplicateEmail = accounts.some(
                (account) =>
                    account.email?.toLowerCase() === cleanEmail
            );

            if (duplicateEmail) {
                setError("This email address is already registered.");
                return;
            }
        }

        const newUser = {
            id: generateId(selectedRole),
            name: cleanName,
            mobile: cleanMobile,
            email: cleanEmail,
            password: password,
            role: selectedRole,
            registrationDate: new Date().toISOString(),
            authenticated: true
        };

        // Vendor-specific details
        if (selectedRole === "vendor") {
            newUser.location = cleanLocation;
            newUser.vendorStatus = "active";
        }

        accounts.push(newUser);
        saveAccounts(accounts);

        const destination =
            selectedRole === "customer"
                ? "/products"
                : "/vendor/dashboard";

        completeLogin(newUser, destination);
    };

    // =====================================
    // CUSTOMER / VENDOR LOGIN
    // =====================================

    const handleUserLogin = (e) => {
        e.preventDefault();
        setError("");

        const cleanMobile = mobile.trim();

        if (!/^[0-9]{10}$/.test(cleanMobile)) {
            setError("Enter your registered 10-digit mobile number.");
            return;
        }

        const accounts = getAccounts();

        const matchedUser = accounts.find(
            (account) =>
                account.mobile === cleanMobile &&
                account.password === password &&
                account.role === selectedRole
        );

        if (!matchedUser) {
            setError("Invalid mobile number or password.");
            return;
        }

        // Check vendor access status
        if (
            selectedRole === "vendor" &&
            matchedUser.vendorStatus !== "active"
        ) {
            setError("Your vendor account is not active yet.");
            return;
        }

        const destination =
            selectedRole === "customer"
                ? "/products"
                : "/vendor/dashboard";

        completeLogin(matchedUser, destination);
    };

    // =====================================
    // PASSWORD FIELD
    // =====================================

    const renderPasswordField = (label, value, setter) => (
        <div className="login-group">
            <label>{label}</label>

            <div className="password-wrapper">
                <input
                    type={showPassword ? "text" : "password"}
                    className="login-input"
                    placeholder={`Enter ${label.toLowerCase()}`}
                    value={value}
                    onChange={(e) => setter(e.target.value)}
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
    );

    // =====================================
    // MAIN UI
    // =====================================

    return (
        <div className="login-page">

            <div className="login-card">

                <Link to="/" className="back-home-btn">
                    ← Back to Home
                </Link>

                {/* BRAND */}

                <div className="login-logo">
                    KONFIZ
                </div>

                <div className="login-subtitle">
                    ICE CREAM & HAPPINESS
                </div>

                <h2 className="login-title">
                    {isRegister ? "Create Your Account" : "Welcome Back!"}
                </h2>

                <p className="login-description">
                    {isRegister
                        ? "Join the KONFiZ family."
                        : "Sign in to your KONFiZ account."}
                </p>

                {/* =====================================
                    ROLE SELECTOR
                ===================================== */}

                <div className="login-role-selector">

                    <button
                        type="button"
                        className={
                            selectedRole === "customer" ? "active" : ""
                        }
                        onClick={() => switchRole("customer")}
                    >
                        Customer
                    </button>

                    <button
                        type="button"
                        className={
                            selectedRole === "vendor" ? "active" : ""
                        }
                        onClick={() => switchRole("vendor")}
                    >
                        Vendor
                    </button>

                    <button
                        type="button"
                        className={
                            selectedRole === "admin" ? "active" : ""
                        }
                        onClick={() => switchRole("admin")}
                    >
                        Admin
                    </button>

                </div>

                {/* ROLE DESCRIPTION */}

                <p className="login-description">
                    {selectedRole === "customer" &&
                        "Shop your favourite ice creams and manage your orders."}

                    {selectedRole === "vendor" &&
                        "Access your KONFiZ franchise partner account."}

                    {selectedRole === "admin" &&
                        "Authorized administration access only."}
                </p>

                {/* ERROR */}

                {error && (
                    <div className="login-error">
                        {error}
                    </div>
                )}

                {/* =====================================
                    ADMIN LOGIN
                ===================================== */}
                {/* DEFAULT ADMIN CREDENTIALS */}

                <div className="admin-demo-credentials">
                    <h4>🔐 Default Admin Credentials</h4>

                    <div className="admin-credential-row">
                        <span>Email:</span>
                        <strong>admin@konfiz.com</strong>
                    </div>

                    <div className="admin-credential-row">
                        <span>Password:</span>
                        <strong>Konfiz@123</strong>
                    </div>

                    <p>Use these credentials to access the admin dashboard.</p>
                </div>
                {selectedRole === "admin" && (
                    <form onSubmit={handleAdminLogin}>

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

                        {renderPasswordField(
                            "Admin Password",
                            password,
                            setPassword
                        )}

                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >
                            {loading ? "Signing In..." : "ADMIN SIGN IN"}
                        </button>

                    </form>
                )}

                {/* =====================================
                    CUSTOMER / VENDOR REGISTRATION
                ===================================== */}

                {selectedRole !== "admin" && isRegister && (
                    <form onSubmit={handleRegister}>

                        <div className="login-group">
                            <label>
                                {selectedRole === "vendor"
                                    ? "Owner / Applicant Name"
                                    : "Full Name"}
                            </label>

                            <input
                                type="text"
                                className="login-input"
                                placeholder="Enter your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
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
                                onChange={(e) =>
                                    setMobile(
                                        e.target.value
                                            .replace(/\D/g, "")
                                            .slice(0, 10)
                                    )
                                }
                                maxLength={10}
                                required
                            />
                        </div>

                        <div className="login-group">
                            <label>
                                Email Address
                                {selectedRole === "customer"
                                    ? " (Optional)"
                                    : ""}
                            </label>

                            <input
                                type="email"
                                className="login-input"
                                placeholder="Enter email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required={selectedRole === "vendor"}
                            />
                        </div>

                        {selectedRole === "vendor" && (
                            <div className="login-group">
                                <label>Business / Franchise Location</label>

                                <input
                                    type="text"
                                    className="login-input"
                                    placeholder="Enter your city or location"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        {renderPasswordField(
                            "Create Password",
                            password,
                            setPassword
                        )}

                        {renderPasswordField(
                            "Confirm Password",
                            confirmPassword,
                            setConfirmPassword
                        )}

                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >
                            {loading
                                ? "Creating Account..."
                                : selectedRole === "customer"
                                    ? "CREATE CUSTOMER ACCOUNT"
                                    : "REGISTER AS VENDOR"}
                        </button>

                    </form>
                )}

                {/* =====================================
                    CUSTOMER / VENDOR LOGIN
                ===================================== */}

                {selectedRole !== "admin" && !isRegister && (
                    <form onSubmit={handleUserLogin}>

                        <div className="login-group">
                            <label>Mobile Number</label>

                            <input
                                type="tel"
                                className="login-input"
                                placeholder="Enter registered mobile number"
                                value={mobile}
                                onChange={(e) =>
                                    setMobile(
                                        e.target.value
                                            .replace(/\D/g, "")
                                            .slice(0, 10)
                                    )
                                }
                                maxLength={10}
                                required
                            />
                        </div>

                        {renderPasswordField(
                            "Password",
                            password,
                            setPassword
                        )}

                        <button
                            type="submit"
                            className="demo-login-button"
                            disabled={loading}
                        >
                            {loading
                                ? "Please Wait..."
                                : selectedRole === "customer"
                                    ? "CUSTOMER SIGN IN"
                                    : "VENDOR SIGN IN"}
                        </button>

                    </form>
                )}

                {/* =====================================
                    LOGIN / REGISTER SWITCH
                ===================================== */}

                {selectedRole !== "admin" && (
                    <div className="login-register-switch">

                        {isRegister ? (
                            <p>
                                Already have an account?{" "}

                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsRegister(false);
                                        resetForm();
                                    }}
                                >
                                    Sign In
                                </button>
                            </p>
                        ) : (
                            <p>
                                Don't have an account?{" "}

                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsRegister(true);
                                        resetForm();
                                    }}
                                >
                                    Register Now
                                </button>
                            </p>
                        )}

                    </div>
                )}

                {/* SECURITY */}

                <div className="login-security">
                    🔒 Secure KONFiZ Account
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
