
import React from "react";
import { useAuth } from "../../context/authContext";
import { useNavigate } from "react-router-dom";

function VendorDashboard() {

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    return (
        <div className="vendor-dashboard">

            <h1>Welcome to KONFiZ Vendor Dashboard</h1>

            <p>Welcome, {user?.name || "Vendor"}!</p>

            <div className="vendor-profile">
                <p>Vendor ID: {user?.id}</p>
                <p>Business Location: {user?.location || "Not available"}</p>
                <p>Mobile: {user?.mobile}</p>
                <p>Email: {user?.email}</p>
            </div>

            <button onClick={handleLogout}>
                Logout
            </button>

        </div>
    );
}

export default VendorDashboard;
