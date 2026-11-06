
import React from "react";
import { Link } from "react-router-dom";
import "../../src/App.css";
// import { useCart } from "../context/cartcontext";

function Navbar() {
        // const { totalQuantity } = useCart();

    return (

        <nav className="navbar">
            <a href="#home" className="logo">
                KONFiZ<span>.</span>
                <small>ICE CREAM & HAPPINESS</small>
            </a>

            <div className="nav-links">
                <Link to="/">Home</Link>
                <Link to="/products">Products</Link>

                <a href="#categories">Categories</a>
                <a href="#products">Our Flavours</a>
                <a href="#story">Our Story</a>
            </div>

            <a href="#products" className="cart-button">
                🛒 Cart
                {/* <span>({totalQuantity})</span> */}
            </a>
        </nav>

    );
}

export default Navbar;
