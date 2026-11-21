
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/navber";
import Footer from "../components/footer";
import "../style/notfound.css";

function NotFound() {
    const navigate = useNavigate();

    return (
        <>
            <Navbar />

            <main className="notfound-page">
                <div className="notfound-container">

                    <div className="notfound-illustration">
                        <div className="error-number">4</div>

                        <div className="icecream-illustration">
                            🍦
                        </div>

                        <div className="error-number">4</div>
                    </div>

                    <span className="notfound-label">
                        OOPS! SCOOP HAPPENS
                    </span>

                    <h1>
                        This Scoop is <span>Missing!</span>
                    </h1>

                    <p>
                        Looks like this page has melted away!
                        But don't worry, there's always another
                        delicious scoop waiting for you.
                    </p>

                    <div className="notfound-actions">
                        <Link to="/" className="notfound-home-btn">
                            🏠 Back to Home
                        </Link>

                        <Link to="/products" className="notfound-product-btn">
                            Explore Flavours →
                        </Link>
                    </div>

                    <div className="notfound-bottom">
                        <span>🍨</span>
                        <span>🍦</span>
                        <span>🍧</span>
                    </div>

                    <small>
                        KONFiZ – ICE CREAM & HAPPINESS
                    </small>

                </div>
            </main>

            <Footer />
        </>
    );
}

export default NotFound;
