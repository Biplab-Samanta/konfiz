
import React from "react";
import { Link } from "react-router-dom";
import "../../src/App.css";
// import { useCart } from "../context/cartcontext";

function Navbar() {
    // const { totalQuantity } = useCart();

    return (

        <nav className="navbar">
            {/* LOGO */}
            <Link to="/" className="logo">
                KONFiZ
                <small>ICE CREAM & HAPPINESS</small>
            </Link>

            {/* NAVIGATION LINKS */}
            <div className="nav-links">
                <Link to="/">Home</Link>
                <Link to="/products">Products</Link>

                <a href="/#categories">Categories</a>
                <a href="/#products">Our Flavours</a>
                <a href="/#story">Our Story</a>
            </div>

            <div>
                <Link className="konfiz_login" to="/login">login</Link>

                <a href="#products" className="cart-button">
                    🛒 Cart
                    {/* <span>({totalQuantity})</span> */}
                </a>
            </div>

        </nav>

    );
}

export default Navbar;
