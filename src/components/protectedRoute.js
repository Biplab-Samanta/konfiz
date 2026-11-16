
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/authContext";

function ProtectedRoute({ allowedRoles }) {

    const { user } = useAuth();

    // Not logged in
    if (!user) {
        return <Navigate to="/" replace />;
    }

    // Wrong role
    if (
        allowedRoles &&
        !allowedRoles.includes(user.role?.toLowerCase())
    ) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}

export default ProtectedRoute;
