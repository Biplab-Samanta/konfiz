
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Navbar from "../components/navber";
import Footer from "../components/footer";
import { useAuth } from "../context/authContext";
import { useCart } from "../context/cartcontext";

import {
    DELIVERY_PIN_CODES,
    DELIVERY_CONFIG
} from "../config/deliveryAreas";

import "../style/quickDelivery.css";

// =====================================================
// DELIVERY SETTINGS
// =====================================================

const DELIVERY_CONTACT_NUMBER = "+91XXXXXXXXXX";

const DELIVERY_MINUTES =
    DELIVERY_CONFIG?.estimatedDeliveryMinutes || 30;

// =====================================================
// QUICK DELIVERY COMPONENT
// =====================================================

function QuickDelivery() {

    const { user } = useAuth();
    const { addToCart } = useCart();
    const navigate = useNavigate();

    // =================================================
    // STATES
    // =================================================

    const [popularProducts, setPopularProducts] = useState([]);

    const [showLoginPopup, setShowLoginPopup] = useState(false);

    const [pinCode, setPinCode] = useState("");

    const [isEligible, setIsEligible] = useState(false);

    const [isChecking, setIsChecking] = useState(false);

    const [deliveryStatus, setDeliveryStatus] = useState("");

    const [deliveryMessage, setDeliveryMessage] = useState("");

    const [showDeliveryPopup, setShowDeliveryPopup] = useState(false);

    // =================================================
    // LOAD PRODUCTS FROM ADMIN PRODUCT DATA
    // SAME LOGIC AS HOME PAGE
    // =================================================

    useEffect(() => {

        const loadProducts = () => {

            try {

                const savedProducts = JSON.parse(
                    localStorage.getItem("konfizProducts") || "[]"
                );

                if (!Array.isArray(savedProducts)) {

                    setPopularProducts([]);

                    return;
                }

                // Remove inactive products

                const activeProducts = savedProducts.filter(
                    product => product.status !== "inactive"
                );

                // Find featured products

                const featuredProducts = activeProducts.filter(
                    product =>
                        product.isPopular === true ||
                        product.featured === true
                );

                // Featured products first
                // Otherwise show active products

                const productsToShow =
                    featuredProducts.length > 0
                        ? featuredProducts
                        : activeProducts;

                // Display maximum four products

                setPopularProducts(productsToShow.slice(0, 4));

            } catch (error) {

                console.error(
                    "Quick Delivery product loading error:",
                    error
                );

                setPopularProducts([]);

            }

        };

        loadProducts();

        // Listen for product updates

        window.addEventListener("storage", loadProducts);

        window.addEventListener(
            "konfizProductsUpdated",
            loadProducts
        );

        return () => {

            window.removeEventListener("storage", loadProducts);

            window.removeEventListener(
                "konfizProductsUpdated",
                loadProducts
            );

        };

    }, []);

    // =================================================
    // AUTOMATIC LOGIN POPUP AFTER 8 SECONDS
    // =================================================

    useEffect(() => {

        if (user) {

            setShowLoginPopup(false);

            return;
        }

        if (
            sessionStorage.getItem("konfiz_delivery_popup_shown")
        ) {

            return;
        }

        const timer = setTimeout(() => {

            setShowLoginPopup(true);

            sessionStorage.setItem(
                "konfiz_delivery_popup_shown",
                "true"
            );

        }, 8000);

        return () => clearTimeout(timer);

    }, [user]);

    // =================================================
    // PIN CODE INPUT
    // =================================================

    const handlePinChange = (e) => {

        const value = e.target.value.replace(/\D/g, "");

        setPinCode(value.slice(0, 6));

        setIsEligible(false);

        setDeliveryStatus("");

        setDeliveryMessage("");

        setShowDeliveryPopup(false);

    };

    // =================================================
    // CHECK DELIVERY AVAILABILITY
    // =================================================

    const checkDelivery = (e) => {

        e.preventDefault();

        if (isChecking) return;

        setIsEligible(false);

        setDeliveryMessage("");

        setDeliveryStatus("");

        setShowDeliveryPopup(false);

        // Validate PIN

        if (!/^\d{6}$/.test(pinCode)) {

            setDeliveryStatus("error");

            setDeliveryMessage(
                "Please enter a valid 6-digit PIN code."
            );

            setShowDeliveryPopup(true);

            return;
        }

        setIsChecking(true);

        // Check serviceable PIN codes

        const available = DELIVERY_PIN_CODES
            .map(code => String(code).trim())
            .includes(pinCode);

        // Short checking animation

        setTimeout(() => {

            if (available) {

                setIsEligible(true);

                setDeliveryStatus("success");

                setDeliveryMessage(
                    <>
                        Great news! KONFiZ delivers to {pinCode}.
                        <br />
                        You can contact us at <strong>9230967112</strong> for more details.
                    </>
                );

            } else {

                setIsEligible(false);

                setDeliveryStatus("warning");

                setDeliveryMessage(
                    `Sorry! KONFiZ express delivery is not currently available at ${pinCode}.`
                );

            }

            setIsChecking(false);

            setShowDeliveryPopup(true);

        }, 500);

    };

    // =================================================
    // CLOSE DELIVERY POPUP
    // =================================================

    const closeDeliveryPopup = () => {

        setShowDeliveryPopup(false);

    };

    // =================================================
    // ADD PRODUCT TO CART
    // =================================================

    const handleAddToCart = (product) => {

        if (!isEligible) {

            alert(
                "Please check your delivery PIN code before ordering."
            );

            document.getElementById("check-location")
                ?.scrollIntoView({
                    behavior: "smooth"
                });

            return;
        }

        addToCart({

            ...product,

            quantity: 1,

            selectedSize: "100 ml"

        });

    };

    // =================================================
    // LOGIN POPUP
    // =================================================

    const handleLogin = () => {

        setShowLoginPopup(false);

        navigate("/login");

    };

    const closeLoginPopup = () => {

        setShowLoginPopup(false);

    };

    // =================================================
    // RENDER
    // =================================================

    return (

        <>

            <Navbar />

            <main className="quick-delivery-page">

                {/* =====================================
                    HERO SECTION
                ===================================== */}

                <section className="delivery-hero">

                    <div className="delivery-hero-content">

                        <span className="delivery-label">

                            <span className="delivery-live-dot"></span>

                            KONFiZ EXPRESS DELIVERY

                        </span>

                        <h1>
                            Ice Cream Happiness

                            <span>
                                In Just {DELIVERY_MINUTES} Minutes!
                            </span>
                        </h1>

                        <p>
                            Kolkata, your favourite ice cream is closer
                            than ever. Discover delicious flavours and
                            enjoy the sweetness delivered to your doorstep.
                        </p>

                        <div className="delivery-hero-buttons">

                            <a href="#quick-products">
                                Order Now →
                            </a>

                            <a
                                href="#check-location"
                                className="secondary"
                            >
                                Check Your PIN Code
                            </a>

                        </div>

                        <div className="delivery-highlights">

                            <div>
                                <strong>{DELIVERY_MINUTES} min</strong>
                                <span>Target delivery</span>
                            </div>

                            <div>
                                <strong>Fresh</strong>
                                <span>Frozen happiness</span>
                            </div>

                            <div>
                                <strong>Kolkata</strong>
                                <span>Delivery zone</span>
                            </div>

                        </div>

                    </div>

                    <div className="delivery-hero-art">

                        <div className="delivery-circle">
                            <span>🍨</span>
                        </div>

                        <div className="delivery-floating delivery-float-one">
                            🍓
                        </div>

                        <div className="delivery-floating delivery-float-two">
                            🍦
                        </div>

                        <div className="delivery-time-card">

                            <span>⚡</span>

                            <div>
                                <strong>{DELIVERY_MINUTES} MIN</strong>
                                <small>Express delivery</small>
                            </div>

                        </div>

                    </div>

                </section>

                {/* =====================================
                    PIN CODE CHECKER
                ===================================== */}

                <section
                    className="delivery-location"
                    id="check-location"
                >

                    <div className="location-icon">
                        📍
                    </div>

                    <div className="location-content">

                        <span>DELIVERY AVAILABILITY</span>

                        <h2>
                            Are We Delivering Near You?
                        </h2>

                        <p>
                            Enter your 6-digit PIN code to check
                            whether KONFiZ express delivery is available
                            in your area.
                        </p>

                        <form onSubmit={checkDelivery}>

                            <input
                                type="text"
                                value={pinCode}
                                maxLength={6}
                                inputMode="numeric"
                                autoComplete="postal-code"
                                placeholder="Enter 6-digit PIN code"
                                onChange={handlePinChange}
                                required
                            />

                            <button
                                type="submit"
                                disabled={isChecking}
                            >

                                {isChecking
                                    ? "Checking..."
                                    : "Check Availability"
                                }

                            </button>

                        </form>

                    </div>

                </section>

                {/* =====================================
                    DELIVERY RESULT POPUP
                ===================================== */}

                {showDeliveryPopup && (

                    <div
                        className="delivery-result-overlay"
                        onClick={closeDeliveryPopup}
                    >

                        <div
                            className={`delivery-result-popup ${deliveryStatus}`}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="delivery-popup-title"
                            onClick={(e) => e.stopPropagation()}
                        >

                            <button
                                type="button"
                                className="delivery-result-close"
                                onClick={closeDeliveryPopup}
                                aria-label="Close popup"
                            >
                                ×
                            </button>

                            <div className="delivery-result-icon">

                                {deliveryStatus === "success" && "✓"}

                                {deliveryStatus === "warning" && "!"}

                                {deliveryStatus === "error" && "×"}

                            </div>

                            {/* SUCCESS POPUP */}

                            {deliveryStatus === "success" && (

                                <>

                                    <span className="delivery-popup-tag">
                                        GREAT NEWS!
                                    </span>

                                    <h2 id="delivery-popup-title">
                                        We Deliver to Your Area!
                                    </h2>

                                    <p className="delivery-popup-message">
                                        {deliveryMessage}
                                    </p>

                                    <div className="delivery-popup-details">

                                        <div>
                                            <span>📍</span>

                                            <div>
                                                <small>DELIVERY PIN CODE</small>
                                                <strong>{pinCode}</strong>
                                            </div>
                                        </div>

                                        <div>
                                            <span>⚡</span>

                                            <div>
                                                <small>ESTIMATED DELIVERY</small>
                                                <strong>
                                                    {DELIVERY_MINUTES} Minutes
                                                </strong>
                                            </div>
                                        </div>

                                        <div>
                                            <span>🍦</span>

                                            <div>
                                                <small>DELIVERY STATUS</small>
                                                <strong>Available</strong>
                                            </div>
                                        </div>

                                    </div>

                                    <div className="delivery-popup-note">
                                        ✓ You can now add your favourite
                                        ice creams to your cart!
                                    </div>

                                    <button
                                        type="button"
                                        className="delivery-popup-primary"
                                        onClick={() => {

                                            closeDeliveryPopup();

                                            document.getElementById("quick-products")
                                                ?.scrollIntoView({
                                                    behavior: "smooth"
                                                });

                                        }}
                                    >
                                        Explore Ice Creams →
                                    </button>

                                </>

                            )}

                            {/* UNAVAILABLE POPUP */}

                            {deliveryStatus === "warning" && (

                                <>

                                    <span className="delivery-popup-tag">
                                        DELIVERY UPDATE
                                    </span>

                                    <h2 id="delivery-popup-title">
                                        Sorry, Not Available Yet!
                                    </h2>

                                    <p className="delivery-popup-message">
                                        {deliveryMessage}
                                    </p>

                                    <div className="delivery-popup-details">

                                        <div>
                                            <span>📍</span>

                                            <div>
                                                <small>YOUR PIN CODE</small>
                                                <strong>{pinCode}</strong>
                                            </div>
                                        </div>

                                        <div>
                                            <span>💝</span>

                                            <div>
                                                <small>NEED ASSISTANCE?</small>
                                                <strong>Contact KONFiZ</strong>
                                            </div>
                                        </div>

                                    </div>

                                    <div className="delivery-contact-box">

                                        <span>📞</span>

                                        <div>
                                            <small>CALL US FOR ASSISTANCE</small>

                                            <a href={`tel:${DELIVERY_CONTACT_NUMBER}`}>
                                                {DELIVERY_CONTACT_NUMBER}
                                            </a>
                                        </div>

                                    </div>

                                    <p className="delivery-popup-help">
                                        Our team can help you with delivery
                                        availability and service-area enquiries.
                                    </p>

                                    <button
                                        type="button"
                                        className="delivery-popup-primary"
                                        onClick={closeDeliveryPopup}
                                    >
                                        Okay, Got It
                                    </button>

                                </>

                            )}

                            {/* INVALID PIN POPUP */}

                            {deliveryStatus === "error" && (

                                <>

                                    <span className="delivery-popup-tag">
                                        CHECK YOUR PIN CODE
                                    </span>

                                    <h2 id="delivery-popup-title">
                                        Invalid PIN Code
                                    </h2>

                                    <p className="delivery-popup-message">
                                        {deliveryMessage}
                                    </p>

                                    <button
                                        type="button"
                                        className="delivery-popup-primary"
                                        onClick={closeDeliveryPopup}
                                    >
                                        Try Again
                                    </button>

                                </>

                            )}

                        </div>

                    </div>

                )}
                {/* =====================================
                    QUICK DELIVERY PRODUCTS
                    SAME PRODUCTS AS HOME PAGE
                ===================================== */}

                <section
                    className="quick-products"
                    id="quick-products"
                >

                    <div className="delivery-section-heading">

                        <span>AVAILABLE QUICK PICKS</span>

                        <h2>
                            Delicious Ice Cream, Just a Click Away!
                        </h2>

                        <p>
                            Explore our customer favourites and
                            order your favourite flavours.
                        </p>

                    </div>

                    {popularProducts.length > 0 ? (

                        <div className="quick-product-grid">

                            {popularProducts.map((product) => (

                                <div
                                    className="quick-product-card"
                                    key={product.id}
                                >

                                    <div className="quick-product-image">

                                        <Link to={`/product/${product.id}`}>

                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                loading="lazy"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = "none";
                                                }}
                                            />

                                        </Link>

                                        <span>
                                            {product.tag || "QUICK PICK"}
                                        </span>

                                    </div>

                                    <div className="quick-product-info">

                                        <small>
                                            {product.category}
                                        </small>

                                        <h3>
                                            {product.name}
                                        </h3>

                                        <p>
                                            {product.description ||
                                                "Deliciously made with love, just for you."}
                                        </p>

                                        <div className="quick-product-bottom">

                                            <strong>
                                                ₹{product.price}
                                            </strong>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleAddToCart(product)
                                                }
                                                disabled={!isEligible}
                                                title={
                                                    !isEligible
                                                        ? "Check delivery availability first"
                                                        : "Add to cart"
                                                }
                                            >
                                                + Add
                                            </button>

                                        </div>

                                    </div>

                                </div>

                            ))}

                        </div>

                    ) : (

                        <div className="no-products">

                            <h3>
                                Our delicious collection is coming soon!
                            </h3>

                            <p>
                                We are preparing something special for you.
                            </p>

                        </div>

                    )}

                    <div className="all-products-link">

                        <Link to="/products">
                            View All Products →
                        </Link>

                    </div>

                </section>
                {/* =====================================
                    BENEFITS SECTION
                ===================================== */}

                <section className="delivery-benefits">

                    <div className="delivery-section-heading">

                        <span>WHY KONFiZ EXPRESS?</span>

                        <h2>
                            Sweetness Without the Wait
                        </h2>

                    </div>

                    <div className="benefits-grid">

                        <div className="benefit-card">
                            <span>⚡</span>
                            <h3>Express Delivery</h3>
                            <p>
                                Our target is to bring your favourite
                                treats to your doorstep in {DELIVERY_MINUTES} minutes.
                            </p>
                        </div>

                        <div className="benefit-card">
                            <span>❄️</span>
                            <h3>Frozen Freshness</h3>
                            <p>
                                Carefully packed to help preserve the
                                creamy goodness of every scoop.
                            </p>
                        </div>

                        <div className="benefit-card">
                            <span>🍦</span>
                            <h3>Delicious Choices</h3>
                            <p>
                                Choose from chocolate, fruit, classic
                                and premium ice cream flavours.
                            </p>
                        </div>

                        <div className="benefit-card">
                            <span>💝</span>
                            <h3>Made for Happiness</h3>
                            <p>
                                Every order is an opportunity to make
                                someone's day a little sweeter.
                            </p>
                        </div>

                    </div>

                </section>

                {/* =====================================
                    BEST SELLING PRODUCTS
                ===================================== */}

                <section className="popular-products" id="products">

                    <div className="section-heading">

                        <span className="eyebrow">
                            OUR BEST COLLECTION
                        </span>

                        <h2>
                            Best Selling <span>Products</span>
                        </h2>

                        <p>
                            Discover the flavours everyone loves.
                        </p>

                    </div>

                    {popularProducts.length > 0 ? (

                        <div className="product-grid">

                            {popularProducts.map((product) => (

                                <Link
                                    to={`/product/${product.id}`}
                                    className="product-card"
                                    key={product.id}
                                >

                                    <div className="product-image">

                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            loading="lazy"
                                        />

                                        {(product.tag || product.isPopular) && (

                                            <span className="product-tag">
                                                {product.tag || "Popular"}
                                            </span>

                                        )}

                                    </div>

                                    <div className="product-info">

                                        <h3>{product.name}</h3>

                                        <p>
                                            {product.description ||
                                                "Deliciously made with love, just for you."}
                                        </p>

                                        <div className="product-card-bottom">

                                            <span className="product-price">
                                                ₹{product.price}
                                            </span>

                                            <span className="product-view-link">
                                                View Product →
                                            </span>

                                        </div>

                                    </div>

                                </Link>

                            ))}

                        </div>

                    ) : (

                        <div className="no-products">

                            <h3>
                                Our delicious collection is coming soon!
                            </h3>

                            <p>
                                We are preparing something special for you.
                            </p>

                        </div>

                    )}

                    <div className="view-all-products">

                        <Link to="/products" className="primary-btn">
                            Explore All Products →
                        </Link>

                    </div>

                </section>



                {/* =====================================
                    FINAL BANNER
                ===================================== */}

                <section className="delivery-bottom-banner">

                    <span>
                        YOUR HAPPINESS IS ON ITS WAY
                    </span>

                    <h2>
                        One Order. Endless Happiness.
                    </h2>

                    <p>
                        Make your day sweeter with KONFiZ.
                    </p>

                    <Link to="/products">
                        Explore Ice Creams →
                    </Link>

                </section>

            </main>

            {/* =====================================
                AUTOMATIC LOGIN POPUP
            ===================================== */}

            {showLoginPopup && !user && (

                <div
                    className="delivery-popup-overlay"
                    onClick={closeLoginPopup}
                >

                    <div
                        className="delivery-login-popup"
                        role="dialog"
                        aria-modal="true"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <button
                            className="delivery-popup-close"
                            onClick={closeLoginPopup}
                            aria-label="Close login popup"
                        >
                            ×
                        </button>

                        <div className="popup-icecream">
                            🍦
                        </div>

                        <span>
                            WELCOME TO KONFiZ
                        </span>

                        <h2>
                            Sweet Moments
                            <br />
                            Start With You!
                        </h2>

                        <p>
                            Login to your account for a sweeter shopping
                            experience. Explore flavours and keep track
                            of your orders.
                        </p>

                        <button
                            className="popup-login-button"
                            onClick={handleLogin}
                        >
                            Login / Sign Up →
                        </button>

                        <button
                            className="popup-later-button"
                            onClick={closeLoginPopup}
                        >
                            Maybe Later
                        </button>

                    </div>

                </div>
               

            )}
 <Footer />
        </>

    );

}

export default QuickDelivery;
