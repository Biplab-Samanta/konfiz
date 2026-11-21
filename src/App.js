
import React, { useState, useEffect } from "react";

import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import { CartProvider } from "./context/cartcontext";
import { AuthProvider, useAuth } from "./context/authContext";

import Home from "./pages/home";
import Product from "./pages/product";
import Login from "./pages/admin/login";
import Dashboard from "./pages/admin/dashboard";
import Cart from "./pages/cart";
import OurStory from "./pages/ourStory";
import WeMakeYouSell from "./pages/weMakeYouSell.js";
import DistinguishedFlavours from "./pages/DistinguishedFlavours";
import QuickDelivery from "./pages/QuickDelivery.js";
import Checkout from "./pages/checkout";
import CustomerDashboard from "./pages/CustomerDashboard.js";
import NotFound from "./pages/NotFound";

import Loader from "./components/loader.js";


// =====================================
// LOGIN ROUTE PROTECTION
// =====================================

function LoginRoute() {

    const { user } = useAuth();

    // Already logged in
    if (user && user.authenticated) {

        const userRole = user.role?.toLowerCase();

        if (userRole === "admin") {
            return <Navigate to="/admin/dashboard" replace />;
        }

        if (userRole === "customer") {
            return <Navigate to="/customer/dashboard" replace />;
        }

        return <Navigate to="/" replace />;
    }

    // Not logged in
    return <Login />;
}


// =====================================
// GLOBAL ROLE-BASED ROUTE PROTECTION
// =====================================

function ProtectedRoute({ children, allowedRoles = [] }) {

    const { user } = useAuth();

    // USER NOT LOGGED IN
    if (!user || !user.authenticated) {
        return <Navigate to="/login" replace />;
    }

    // VERIFY USER ROLE
    const userRole = user.role?.toLowerCase();

    // CHECK PERMISSION
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

    // CUSTOMER / ADMIN CART IDENTIFICATION
    const cartUserId = user
        ? (user.customerId || user.id || user._id)
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

                {/* Login automatically redirects
                    already logged-in users */}

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


                {/* =====================================
                    CUSTOMER + ADMIN PAGES
                ===================================== */}

                <Route
                    path="/products"
                    element={
                        <ProtectedRoute allowedRoles={["customer", "admin"]}>
                            <Product />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/cart"
                    element={
                        <ProtectedRoute allowedRoles={["customer", "admin"]}>
                            <Cart />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/checkout"
                    element={
                        <ProtectedRoute allowedRoles={["customer", "admin"]}>
                            <Checkout />
                        </ProtectedRoute>
                    }
                />


                {/* =====================================
                    CUSTOMER ONLY PAGES
                ===================================== */}

                <Route
                    path="/customer/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={["customer"]}>
                            <CustomerDashboard />
                        </ProtectedRoute>
                    }
                />


                {/* =====================================
                    ADMIN ONLY PAGES
                ===================================== */}

                <Route
                    path="/admin/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />


                {/* =====================================
                    INVALID ROUTES
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

                {/* ALL APPLICATION ROUTES */}
                <AppRoutes />

            </BrowserRouter>

        </AuthProvider>

    );

}

export default App;
