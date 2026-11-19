
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../components/navber";
import HeroSlider from "../components/heroSlider";
import DynamicVideo from "../components/DynamicVideo";
import videoSchema from "../data/videoschema";
import Footer from "../components/footer";

import "../../src/App.css";

const categories = [
    { name: "Ice Cream Cones", count: "12 Flavours", emoji: "🍦" },
    { name: "Ice Cream Tubs", count: "18 Products", emoji: "🍨" },
    { name: "Family Packs", count: "8 Products", emoji: "👨‍👩‍👧‍👦" },
    { name: "Sundaes", count: "10 Products", emoji: "🍧" },
];

function Home() {

    const [popularProducts, setPopularProducts] = useState([]);
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");


    // LOAD ACTUAL PRODUCTS
    

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

                const activeProducts = savedProducts.filter(
                    product => product.status !== "inactive"
                );

                const featuredProducts = activeProducts.filter(
                    product =>
                        product.isPopular === true ||
                        product.featured === true
                );

                const productsToShow =
                    featuredProducts.length > 0
                        ? featuredProducts
                        : activeProducts;

                setPopularProducts(productsToShow.slice(0, 4));

            } catch (error) {

                console.error("Product loading error:", error);
                setPopularProducts([]);

            }

        };

        loadProducts();

        window.addEventListener("storage", loadProducts);
        window.addEventListener("konfizProductsUpdated", loadProducts);

        return () => {
            window.removeEventListener("storage", loadProducts);
            window.removeEventListener("konfizProductsUpdated", loadProducts);
        };

    }, []);

    // NEWSLETTER


    const subscribe = (e) => {

        e.preventDefault();

        if (!email.trim()) return;

        setMessage("Thank you! You're on our sweet list with love.");
        setEmail("");

    };

    return (

        <div className="home-page">

            <Navbar />

            {/* HERO SECTION */}

            <HeroSlider />

            {/* VIDEO SECTION */}

            <DynamicVideo video={videoSchema.home} />

            {/*  CATEGORIES SECTION  */}

            <section className="categories section" id="categories">

                <div className="section-heading">

                    <span className="eyebrow">
                        FIND YOUR FAVOURITE
                    </span>

                    <h2>
                        Something for <span>Everyone.</span>
                    </h2>

                    <p>
                        Explore our delicious world of ice cream.
                    </p>

                </div>

                <div className="category-grid">

                    {categories.map((category) => (

                        <Link
                            to={`/products?category=${encodeURIComponent(category.name)}`}
                            className="category-card"
                            key={category.name}
                        >

                            <div className="category-emoji">
                                {category.emoji}
                            </div>

                            <h3>{category.name}</h3>

                            <p>{category.count}</p>

                            <span className="category-arrow">→</span>

                        </Link>

                    ))}

                </div>

            </section>

            {/*  POPULAR PRODUCTS*/}

            <section className="popular-products" id="products">

                <div className="section-heading">

                    <span className="eyebrow">
                        OUR BEST COLLECTION
                    </span>

                    <h2>
                        Popular <span>Products.</span>
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

                        <h3>Our delicious collection is coming soon!</h3>

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

            {/* BRAND STORY*/}

            <section className="story" id="story">

                <div className="story-image">

                    <img
                        src="https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=900"
                        alt="Freshly served ice cream"
                    />

                    <div className="story-sticker">
                        MADE WITH LOVE
                    </div>

                </div>

                <div className="story-content">

                    <span className="eyebrow">
                        THE KONFiZ EXPERIENCE
                    </span>

                    <h2>
                        Made with Love.
                        <br />
                        Served with <span>Happiness.</span>
                    </h2>

                    <p>
                        We believe ice cream is more than a dessert.
                        It is a reason to smile, a moment to share and
                        a little happiness in everyday life.
                    </p>

                    <div className="story-features">

                        <div>
                            <strong>Delicious Flavours</strong>
                            <small>
                                Something special in every bite.
                            </small>
                        </div>

                        <div>
                            <strong>Quality Ingredients</strong>
                            <small>
                                Carefully selected ingredients.
                            </small>
                        </div>

                        <div>
                            <strong>Made for Happiness</strong>
                            <small>
                                Sweet memories start here.
                            </small>
                        </div>

                    </div>

                    <Link to="/our-story" className="primary-btn">
                        Discover Our Story →
                    </Link>

                </div>

            </section>

            {/* PROMOTION */}

            <section className="promotion">

                <div className="promotion-content">

                    <span className="eyebrow">
                        A LITTLE EXTRA SWEETNESS
                    </span>

                    <h2>
                        Happiness is
                        <br />
                        <span>Just a Scoop Away!</span>
                    </h2>

                    <p>
                        Find your favourite flavour and make today
                        a little more delicious.
                    </p>

                    <div className="buttun_area">

                        <Link to="/products" className="primary-btn">
                            Order Your Happiness →
                        </Link>

                        <a
                            href={`https://wa.me/?text=${encodeURIComponent(
                                "Hello! I'd like to inquire about placing a bulk order."
                            )}`}
                            className="outline-btn"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Bulk Order →
                        </a>

                    </div>

                </div>

            </section>

           

            <Footer />

        </div>

    );

}

export default Home;
