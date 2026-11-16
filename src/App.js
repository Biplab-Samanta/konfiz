
import React from "react";
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


// =====================================
// GLOBAL ROLE-BASED ROUTE PROTECTION
// =====================================

function ProtectedRoute({ children, allowedRoles }) {

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
        ? (user.customerId || user.id)
        : null;

    return (

        <CartProvider customerId={cartUserId}>

            <Routes>

                {/* =====================================
                    PUBLIC PAGES
                    NO LOGIN REQUIRED
                ===================================== */}

                <Route
                    path="/"
                    element={<Home />}
                />

                <Route
                    path="/login"
                    element={<Login />}
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


                {/* =====================================
                    ADMIN ONLY PAGES
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
                    INVALID ROUTES
                ===================================== */}

                <Route
                    path="*"
                    element={<Navigate to="/" replace />}
                />

            </Routes>

        </CartProvider>

    );
}


// =====================================
// MAIN APP
// =====================================

function App() {

    return (

        <AuthProvider>

            <BrowserRouter>

                <AppRoutes />

            </BrowserRouter>

        </AuthProvider>

    );

}

export default App;
