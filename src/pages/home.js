
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../components/navber";
import HeroSlider from "../components/heroSlider";
import DynamicVideo from "../components/DynamicVideo";
import videoSchema from "../data/videoschema";
import Footer from "../components/footer";
import ProductGallery from "../components/productGallery/productGallery";
import TestimonialSection from "../components/testimonials/testimonial_components";
import { BrandPartnersStrip } from "../components/testimonials/testimonial_components";
import WhyChooseUs from "../components/whyChooseUs";
import FAQ from "../components/faq";

import "../../src/App.css";


const categories = [
    {
        name: "Ice Cream Cones",
        count: "12 Flavours",
        emoji: "🍦",
        image: "images/categories/images.jpg"
    },
     {
        name: "Family Packs",
        count: "8 Products",
        emoji: "👨‍👩‍👧‍👦",
        image: "images/categories/family_cube.jpg"
    },
    {
        name: "Ice Cream Tubs",
        count: "18 Products",
        emoji: "🍨",
        image: "images/categories/tubs.jpg"
    },
    {
        name: "Sundaes",
        count: "10 Products",
        emoji: "🍧",
        image: "images/categories/sundeas.jpg"
    }
];


function Home() {

    const [popularProducts, setPopularProducts] = useState([]);
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    // const [products, setProducts] = useState(() => {
    //     try {
    //         return JSON.parse(
    //             localStorage.getItem("konfizProducts")
    //         ) || [];
    //     } catch {
    //         return [];
    //     }
    // });


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
            {/*  POPULAR PRODUCTS*/}

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


            {/* VIDEO SECTION */}

            <DynamicVideo video={videoSchema.home} />

            {/* brands  */}
            <BrandPartnersStrip
                title="Our Partners who Trusted Us"
                speed={40}
                className="home-brand-strip"
            />

            <TestimonialSection
                type="brand"
                layout="full"
                limit={8}
            />


            {/* ================================
    CATEGORIES SECTION  ================================ */}

            <section className="categories section" id="categories">

                <div className="section-heading">
                    <span className="eyebrow">
                        FIND YOUR FAVOURITE
                    </span>

                    <h2>
                        Something for <span>Everyone.</span>
                    </h2>

                    <p>
                        From classic favourites to exciting new flavours,
                        discover something delicious for every moment.
                    </p>
                </div>

                <div className="category-grid">

                    {categories.map((category, index) => (

                        <Link
                            to={`/products?category=${encodeURIComponent(category.name)}`}
                            className="category-card"
                            key={category.name}
                        >

                            <div className="category-card-image">

                                {category.image ? (
                                    <img
                                        src={category.image}
                                        alt={category.name}
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="category-placeholder">
                                        {category.emoji}
                                    </div>
                                )}

                                <span className="category-number">
                                    0{index + 1}
                                </span>

                                <span className="category-arrow">
                                    ↗
                                </span>

                            </div>

                            <div className="category-card-content">

                                <div>
                                    <h3>{category.name}</h3>
                                    <p>{category.count}</p>
                                </div>

                                <span className="category-explore">
                                    Explore Collection
                                </span>

                            </div>

                        </Link>

                    ))}

                </div>

            </section>

            
            {/* testimonials */}



            <TestimonialSection
                type="b2b"
                layout="cards"
                limit={8}
            />





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
            <TestimonialSection
                type="b2c"
                layout="cards"
                limit={8}
            />


            <ProductGallery />

            {/* why choose us section  */}
            <WhyChooseUs />


            {/* faq section  */}
            <FAQ
                heading="Frequently Asked Questions"
                subheading="Everything you need to know about enjoying KONFiZ."
                limit={5}
            />

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

                        <Link to="/franchise" className="primary-btn">
                            Become a Franchise Partner →
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
