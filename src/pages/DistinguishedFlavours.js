
import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/navber";
import { useCart } from "../context/cartcontext";
import "../style/distinguishedFlavours.css";

// Sample flavours – replace with your existing product data
const flavours = [
    {
        id: 1,
        name: "Belgian Chocolate",
        category: "Chocolate",
        description: "Rich Belgian chocolate blended into a smooth and creamy delight.",
        price: 180,
        rating: 5,
        image: "/images/belgian-chocolate.jpg",
        tag: "Bestseller"
    },
    {
        id: 2,
        name: "Strawberry Bliss",
        category: "Fruit",
        description: "A refreshing strawberry experience made with fruity goodness.",
        price: 150,
        rating: 5,
        image: "/images/strawberry.jpg",
        tag: "Popular"
    },
    {
        id: 3,
        name: "Vanilla Dream",
        category: "Classic",
        description: "Classic vanilla flavour with a rich, velvety texture.",
        price: 130,
        rating: 5,
        image: "/images/vanilla.jpg",
        tag: "Classic"
    },
    {
        id: 4,
        name: "Mango Magic",
        category: "Fruit",
        description: "Experience the tropical sweetness of delicious mangoes.",
        price: 160,
        rating: 5,
        image: "/images/mango.jpg",
        tag: "Seasonal"
    },
    {
        id: 5,
        name: "Butterscotch Crunch",
        category: "Special",
        description: "Creamy butterscotch ice cream with crunchy caramel pieces.",
        price: 170,
        rating: 5,
        image: "/images/butterscotch.jpg",
        tag: "Special"
    },
    {
        id: 6,
        name: "Cookies & Cream",
        category: "Chocolate",
        description: "A perfect combination of creamy ice cream and cookie chunks.",
        price: 190,
        rating: 5,
        image: "/images/cookies-cream.jpg",
        tag: "Favourite"
    },
    {
        id: 7,
        name: "Pistachio Royale",
        category: "Special",
        description: "A luxurious nutty flavour with the goodness of pistachios.",
        price: 220,
        rating: 5,
        image: "/images/pistachio.jpg",
        tag: "Premium"
    },
    {
        id: 8,
        name: "Black Currant",
        category: "Fruit",
        description: "A deliciously tangy and fruity ice cream experience.",
        price: 175,
        rating: 5,
        image: "/images/blackcurrant.jpg",
        tag: "Popular"
    }
];

const categories = [
    "All Flavours",
    "Chocolate",
    "Fruit",
    "Classic",
    "Special"
];

function DistinguishedFlavours() {

    const { addToCart } = useCart();

    const [activeCategory, setActiveCategory] = useState("All Flavours");
    const [search, setSearch] = useState("");

    const filteredFlavours = useMemo(() => {
        return flavours.filter((item) => {
            const categoryMatch =
                activeCategory === "All Flavours" ||
                item.category === activeCategory;

            const searchMatch =
                item.name.toLowerCase().includes(search.toLowerCase());

            return categoryMatch && searchMatch;
        });
    }, [activeCategory, search]);

    const handleAddToCart = (product) => {
        addToCart({
            ...product,
            quantity: 1,
            selectedSize: "100 ml"
        });
    };

    return (
        <>
            <Navbar />

            <main className="distinguished-page">

                {/* Hero Section */}
                <section className="flavour-hero">
                    <div className="flavour-hero-content">
                        <span className="flavour-eyebrow">
                            KONFiZ ICE CREAM & HAPPINESS
                        </span>

                        <h1>
                            Our Distinguished <span>Flavours</span>
                        </h1>

                        <p>
                            Every scoop tells a story. Discover our delightful
                            collection of handcrafted flavours, made to turn
                            every moment into something special.
                        </p>

                        <a href="#all-flavours" className="flavour-hero-btn">
                            Explore Our Flavours ↓
                        </a>
                    </div>
                </section>

                {/* Introduction */}
                <section className="flavour-intro">
                    <span className="section-subtitle">A WORLD OF TASTE</span>

                    <h2>Something Special in Every Scoop</h2>

                    <p>
                        From timeless classics to exciting new creations,
                        explore flavours that bring happiness to every bite.
                    </p>
                </section>

                {/* Flavours Section */}
                <section className="flavour-collection" id="all-flavours">

                    <div className="flavour-heading">
                        <div>
                            <span className="section-subtitle">
                                FIND YOUR FAVOURITE
                            </span>
                            <h2>Explore Our Collection</h2>
                        </div>

                        <span className="flavour-count">
                            {filteredFlavours.length} Flavours
                        </span>
                    </div>

                    {/* Search */}
                    <div className="flavour-search">
                        <input
                            type="text"
                            placeholder="Search your favourite flavour..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Filters */}
                    <div className="flavour-filters">
                        {categories.map((category) => (
                            <button
                                key={category}
                                className={
                                    activeCategory === category ? "active" : ""
                                }
                                onClick={() => setActiveCategory(category)}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    {/* Product Grid */}
                    <div className="flavour-grid">

                        {filteredFlavours.length > 0 ? (
                            filteredFlavours.map((product) => (
                                <article
                                    className="flavour-card"
                                    key={product.id}
                                >
                                    <div className="flavour-image">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            onError={(e) => {
                                                e.currentTarget.style.display = "none";
                                            }}
                                        />

                                        <span className="flavour-tag">
                                            {product.tag}
                                        </span>
                                    </div>

                                    <div className="flavour-card-content">

                                        <div className="flavour-rating">
                                            {"★".repeat(product.rating)}
                                        </div>

                                        <span className="flavour-category">
                                            {product.category}
                                        </span>

                                        <h3>{product.name}</h3>

                                        <p>{product.description}</p>

                                        <div className="flavour-card-bottom">
                                            <strong>
                                                ₹{product.price}
                                            </strong>

                                            <button
                                                onClick={() =>
                                                    handleAddToCart(product)
                                                }
                                            >
                                                + Add to Cart
                                            </button>
                                        </div>

                                    </div>
                                </article>
                            ))
                        ) : (
                            <div className="no-flavours">
                                <h3>No flavours found!</h3>
                                <p>Try searching for another flavour.</p>
                            </div>
                        )}

                    </div>
                </section>

                {/* Closing Banner */}
                <section className="flavour-cta">
                    <h2>Happiness is Just One Scoop Away!</h2>
                    <p>
                        Find your favourite flavour and make today sweeter.
                    </p>

                    <Link to="/products">
                        Discover All Products →
                    </Link>
                </section>

            </main>
        </>
    );
}

export default DistinguishedFlavours;
