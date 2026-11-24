
import React, { useState, useEffect } from "react";

import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    useLocation
} from "react-router-dom";

// =====================================
// CONTEXT IMPORTS
// =====================================

import { CartProvider } from "./context/cartcontext";
import { AuthProvider, useAuth } from "./context/authContext";

// =====================================
// PAGE IMPORTS
// =====================================

import Home from "./pages/home";
import Product from "./pages/product";
import Login from "./pages/admin/login";
import Dashboard from "./pages/admin/dashboard";
import Cart from "./pages/cart";
import Checkout from "./pages/checkout";

import OurStory from "./pages/ourStory";
import WeMakeYouSell from "./pages/weMakeYouSell";
import DistinguishedFlavours from "./pages/DistinguishedFlavours";
import QuickDelivery from "./pages/QuickDelivery";

import CustomerDashboard from "./pages/CustomerDashboard";
import NotFound from "./pages/NotFound";
import ProductDetails from "./pages/productdetails";

// =====================================
// COMPONENT IMPORTS
// =====================================

import Loader from "./components/loader";

// =====================================
// AUTH HELPER
// =====================================

const isUserAuthenticated = (user) => {
    return Boolean(user) && user.authenticated !== false;
};

const getUserRole = (user) => {
    return String(user?.role || "").trim().toLowerCase();
};


// =====================================
// LOGIN ROUTE PROTECTION
// =====================================

function LoginRoute() {

    const { user } = useAuth();



    if (isUserAuthenticated(user)) {

        const role = getUserRole(user);

        if (role === "admin") {
            return <Navigate to="/admin/dashboard" replace />;
        }

        if (role === "customer") {
            return <Navigate to="/customer/dashboard" replace />;
        }

        return <Navigate to="/" replace />;
    }

    return <Login />;
}


// =====================================
// GLOBAL ROLE-BASED ROUTE PROTECTION
// =====================================

function ProtectedRoute({ children, allowedRoles = [] }) {

    const { user } = useAuth();

    // Check login
    if (!isUserAuthenticated(user)) {
        return <Navigate to="/login" replace />;
    }

    // Normalize role
    const userRole = getUserRole(user);

    // Check access permission
    if (!allowedRoles.includes(userRole)) {
        return <Navigate to="/" replace />;
    }

    return children;
}


// =====================================
// APP ROUTES
// =====================================

function AppRoutes() {

    const { user } = useAuth();


    const location = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    // =====================================
    // CUSTOMER-SPECIFIC CART IDENTIFICATION
    // =====================================

    const cartUserId = isUserAuthenticated(user)
        ? (
            user.customerId ||
            user.id ||
            user._id ||
            null
        )
        : null;

    return (

        <CartProvider customerId={cartUserId}>

            <Routes>

                {/* =====================================
                    PUBLIC PAGES
                ===================================== */}

                <Route
                    path="/"
                    element={<Home />}
                />

                <Route
                    path="/login"
                    element={<LoginRoute />}
                />

                <Route
                    path="/our-story"
                    element={<OurStory />}
                />

                <Route
                    path="/we-make-you-sell"
                    element={<WeMakeYouSell />}
                />

                <Route
                    path="/distinguished-flavours"
                    element={<DistinguishedFlavours />}
                />

                <Route
                    path="/quick-delivery"
                    element={<QuickDelivery />}
                />

                <Route
                    path="/products/details/:productId"
                    element={<ProductDetails />}
                />
                {/* =====================================
                    CUSTOMER + ADMIN PAGES
                ===================================== */}

                <Route
                    path="/products"
                    element={
                        <ProtectedRoute
                            allowedRoles={["customer", "admin"]}
                        >
                            <Product />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/cart"
                    element={
                        <ProtectedRoute
                            allowedRoles={["customer", "admin"]}
                        >
                            <Cart />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/checkout"
                    element={
                        <ProtectedRoute
                            allowedRoles={["customer", "admin"]}
                        >
                            <Checkout />
                        </ProtectedRoute>
                    }
                />


                {/* =====================================
                    CUSTOMER ONLY
                ===================================== */}

                <Route
                    path="/customer/dashboard"
                    element={
                        <ProtectedRoute
                            allowedRoles={["customer"]}
                        >
                            <CustomerDashboard />
                        </ProtectedRoute>
                    }
                />


                {/* =====================================
                    ADMIN ONLY
                ===================================== */}

                <Route
                    path="/admin/dashboard"
                    element={
                        <ProtectedRoute
                            allowedRoles={["admin"]}
                        >
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />


                {/* =====================================
                    404 PAGE
                ===================================== */}

                <Route
                    path="*"
                    element={<NotFound />}
                />

            </Routes>

        </CartProvider>
    );
}


// =====================================
// GLOBAL LOADER
// =====================================

function GlobalLoader() {

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const timer = setTimeout(() => {
            setLoading(false);
        }, 1800);

        return () => clearTimeout(timer);

    }, []);

    if (!loading) {
        return null;
    }

    return <Loader />;
}


// =====================================
// MAIN APP
// =====================================

function App() {

    return (

        <AuthProvider>

            <BrowserRouter>

                {/* GLOBAL LOADER */}

                <GlobalLoader />

                {/* APPLICATION ROUTES */}

                <AppRoutes />

            </BrowserRouter>

        </AuthProvider>

    );
}

export default App;
