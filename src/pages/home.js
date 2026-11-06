
import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/navber";
import "../../src/App.css";

const categories = [
    { name: "Ice Cream Cones", count: "12 Flavours" },
    { name: "Ice Cream Tubs", count: "18 Products" },
    { name: "Family Packs", count: "8 Products" },
    { name: "Sundaes", count: "10 Products" },
];

const products = [
    {
        id: 1,
        name: "Belgian Chocolate",
        category: "Tubs",
        price: 249,
        oldPrice: 299,
        rating: "4.9",
        image:
            "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600",
        tag: "Bestseller",
    },
    {
        id: 2,
        name: "Strawberry Bliss",
        category: "Tubs",
        price: 199,
        oldPrice: 249,
        rating: "4.8",
        image:
            "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=600",
        tag: "Popular",
    },
    {
        id: 3,
        name: "Vanilla Dream",
        category: "Cones",
        price: 149,
        oldPrice: 179,
        rating: "4.7",
        image:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJGFc_i_JH35DZpkCrb-WYUksSR9hdT1ls9JT6n0UR8mJyA_z9IFLYwCTYlQVwsCaE97Xz9jiLUtDfGscaq7AQ0vn3GMPy7aukSD1iiis&s=10",
        tag: "New",
    },
    {
        id: 4,
        name: "Mango Magic",
        category: "Tubs",
        price: 229,
        oldPrice: 279,
        rating: "4.9",
        image:
            "https://images.unsplash.com/photo-1488900128323-21503983a07e?w=600",
        tag: "Seasonal",
    },
];

function Home() {
    const [cart, setCart] = useState(0);
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const addToCart = () => {
        setCart((previous) => previous + 1);
    };

    const subscribe = (e) => {
        e.preventDefault();

        if (!email.trim()) return;

        setMessage("Thank you! You're on our sweet list ❤️");
        setEmail("");
    };

    return (
        <div className="website">
            <Navbar />

            
            {/* SECTION 1: HERO */}
            <section className="hero" id="home">
                <div className="hero-content">
                    <span className="eyebrow">
                        MADE FOR YOUR HAPPY MOMENTS
                    </span>

                    <h1>
                        A Little Scoop
                        <br />
                        Of <span>Happiness.</span>
                    </h1>

                    <p>
                        Life is better with ice cream. Discover your favourite
                        flavours and make every moment delicious.
                    </p>

                    <div className="hero-buttons">
                        <a href="#products" className="primary-btn">
                            Shop Now <span>→</span>
                        </a>

                        <a href="#categories" className="secondary-btn">
                            Explore Flavours
                        </a>
                    </div>

                    <div className="hero-note">

                        Fresh flavours. Endless happiness.
                    </div>
                </div>

                <div className="hero-image">
                    <img
                        src="https://images.unsplash.com/photo-1560008581-09826d1de69e?w=1000"
                        alt="Delicious ice cream"
                    />

                    <div className="floating-card">

                        <div>
                            <strong>100% Happiness</strong>
                            <small>In every scoop</small>
                        </div>
                    </div>
                </div>

                <div className="hero-decoration">SWEET</div>
            </section>

            {/* SECTION 2: CATEGORIES */}
            <section className="categories section" id="categories">
                <div className="section-heading">
                    <span className="eyebrow">FIND YOUR FAVOURITE</span>
                    <h2>Something for <span>Everyone.</span></h2>
                    <p>Explore our delicious world of ice cream.</p>
                </div>

                <div className="category-grid">
                    {categories.map((category) => (
                        <a
                            href="#products"
                            className="category-card"
                            key={category.name}
                        >
                            <div className="category-emoji">
                                {category.emoji}
                            </div>

                            <h3>{category.name}</h3>
                            <p>{category.count}</p>
                            <span className="category-arrow">→</span>
                        </a>
                    ))}
                </div>
            </section>

            {/* SECTION 3: BEST SELLERS */}
            <section className="products section" id="products">
                <div className="section-heading">
                    <span className="eyebrow">CUSTOMER FAVOURITES</span>
                    <h2>Our Best <span>Sellers.</span></h2>
                    <p>The flavours everyone keeps coming back for.</p>
                </div>

                <div className="product-grid">
                    {products.map((product) => (
                        <article className="product-card" key={product.id}>
                            <div className="product-image">
                                <img src={product.image} alt={product.name} />
                                <span className="product-tag">{product.tag}</span>

                                <button
                                    className="quick-add"
                                    onClick={addToCart}
                                    aria-label={`Add ${product.name} to cart`}
                                >
                                    +
                                </button>
                            </div>

                            <div className="product-info">
                                <div className="product-rating">
                                    ⭐ {product.rating}
                                </div>

                                <h3>{product.name}</h3>

                                <div className="product-bottom">
                                    <div className="price">
                                        ₹{product.price}
                                        <del>₹{product.oldPrice}</del>
                                    </div>

                                    <button
                                        className="add-btn"
                                        onClick={addToCart}
                                    >
                                        Add +
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>

                <div className="center-button">
                    <button className="outline-btn">
                        Explore All Flavours →
                    </button>
                </div>
            </section>

            {/* SECTION 4: BRAND STORY */}
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
                    <span className="eyebrow">THE KONFiZ EXPERIENCE</span>

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

                            <div>
                                <strong>Delicious Flavours</strong>
                                <small>Something special in every bite.</small>
                            </div>
                        </div>

                        <div>

                            <div>
                                <strong>Quality Ingredients</strong>
                                <small>Carefully selected ingredients.</small>
                            </div>
                        </div>

                        <div>

                            <div>
                                <strong>Made for Happiness</strong>
                                <small>Sweet memories start here.</small>
                            </div>
                        </div>
                    </div>

                    <a href="#products" className="primary-btn">
                        Discover Our Flavours →
                    </a>
                </div>
            </section>

            {/* SECTION 5: PROMOTION + FOOTER */}
            <section className="promotion">
                <div className="promotion-content">
                    <span className="eyebrow">A LITTLE EXTRA SWEETNESS</span>

                    <h2>
                        Happiness is
                        <br />
                        <span>Just a Scoop Away!</span>
                    </h2>

                    <p>
                        Find your favourite flavour and make today
                        a little more delicious.
                    </p>

                    <a href="#products" className="primary-btn">
                        Order Your Happiness →
                    </a>
                </div>
            </section>

            <footer className="footer">
                <div className="footer-main">
                    <div className="footer-brand">
                        <a href="#home" className="logo">
                            KONFiZ<span>.</span>
                            <small>ICE CREAM & HAPPINESS</small>
                        </a>

                        <p>
                            Spreading smiles, one scoop at a time.
                            Welcome to the sweeter side of life.
                        </p>
                    </div>

                    <div className="footer-links">
                        <h3>Explore</h3>
                        <a href="#home">Home</a>
                        <a href="#categories">Categories</a>
                        <a href="#products">Shop</a>
                        <a href="#story">Our Story</a>
                    </div>

                    <div className="footer-links">
                        <h3>Customer Care</h3>
                        <a href="#footer">Contact Us</a>
                        <a href="#footer">Privacy Policy</a>
                        <a href="#footer">Terms & Conditions</a>
                        <a href="#footer">Delivery Information</a>
                    </div>

                    <div className="newsletter" id="footer">
                        <h3>Stay in the Sweet Loop!</h3>
                        <p>Get updates on new flavours and special offers.</p>

                        <form onSubmit={subscribe}>
                            <input
                                type="email"
                                placeholder="Your email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />

                            <button type="submit">→</button>
                        </form>

                        {message && <small className="success-message">{message}</small>}
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>© 2026 KONFiZ. All rights reserved.</p>
                    <p>Made with love and lots of ice cream.</p>
                </div>
            </footer>

        </div>
    );
}

export default Home;
