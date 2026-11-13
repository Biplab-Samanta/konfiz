
import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Home from "./pages/home";
import Product from "./pages/product";
import Login from "./pages/admin/login";
import Dashboard from "./pages/admin/dashboard";

function ProtectedAdminRoute({ children }) {
  const isLoggedIn =
    sessionStorage.getItem("konfizAdminLoggedIn") === "true";

  return isLoggedIn
    ? children
    : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/products" element={<Product />} />

        {/* Single Login */}
        <Route path="/login" element={<Login />} />

        {/* Admin Dashboard */}
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
    </BrowserRouter>
  );
}

export default App;
