
import React, { useState } from "react";
import "../../style/login.css";

function Login({ onLogin }) {

  // =====================================
  // MASTER ADMIN CREDENTIALS
  // Change username and password here
  // =====================================

  const ADMIN_EMAIL = "admin@konfiz.com";
  const ADMIN_PASSWORD = "Konfiz@123";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =====================================
  // LOGIN FUNCTION
  // =====================================

  const handleLogin = (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    setTimeout(() => {

      if (
        email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
        password === ADMIN_PASSWORD
      ) {

        // Store login session for current browser tab
        sessionStorage.setItem("konfizAdminLoggedIn", "true");
        sessionStorage.setItem("konfizAdminEmail", ADMIN_EMAIL);

        // Notify parent component
        if (onLogin) {
          onLogin({
            email: ADMIN_EMAIL,
            authenticated: true
          });
        } else {
          // Temporary success message until dashboard is connected
          window.location.href = "/admin/dashboard";
        }

      } else {
        setError("Invalid email or password. Please try again.");
      }

      setLoading(false);

    }, 500);
  };

  return (
    <div className="login-page">

    

      <div className="login-card">

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
              autoComplete="username"
              required
            />

          </div>

          <div className="login-group">

            <label>Password</label>

            <div className="password-wrapper">

              <input
                type={showPassword ? "text" : "password"}
                className="login-input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
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
            {loading ? "Signing In..." : "SIGN IN"}
          </button>

        </form>

        <div className="login-security">
          🔒 Administrator Access
        </div>

        <div className="login-footer">
          © {new Date().getFullYear()} KONFIZ. All Rights Reserved.
        </div>

      </div>

    </div>
  );
}

export default Login;
