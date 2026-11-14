
import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import { CartProvider } from "../src/context/cartcontext";

import Home from "./pages/home";
import Product from "./pages/product";
import Login from "./pages/admin/login";
import Dashboard from "./pages/admin/dashboard";
import Cart from "./pages/cart";

// ADMIN PROTECTION
function ProtectedAdminRoute({ children }) {
  const isLoggedIn =
    sessionStorage.getItem("konfizAdminLoggedIn") === "true";

  return isLoggedIn
    ? children
    : <Navigate to="/login" replace />;
}

// CUSTOMER PROTECTION
function ProtectedCustomerRoute({ children }) {
  const customer = JSON.parse(
    sessionStorage.getItem("konfizCustomer") || "null"
  );

  return customer?.customerId && customer?.role === "customer"
    ? children
    : <Navigate to="/login" replace />;
}

// APP ROUTES
function AppRoutes() {
  const customer = JSON.parse(
    sessionStorage.getItem("konfizCustomer") || "null"
  );

  return (
    <CartProvider customerId={customer?.customerId}>
      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route
          path="/products"
          element={
            <ProtectedCustomerRoute>
              <Product />
            </ProtectedCustomerRoute>
          }
        />

        <Route
          path="/cart"
          element={
            <ProtectedCustomerRoute>
              <Cart />
            </ProtectedCustomerRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedAdminRoute>
              <Dashboard />
            </ProtectedAdminRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </CartProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
