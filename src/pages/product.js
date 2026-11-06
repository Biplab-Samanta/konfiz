

import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../style/product.css";
import Navbar from "../components/navber";


const productData = [
  {
    id: 1,
    name: "Belgian Chocolate",
    category: "Chocolate",
    description: "wow",
    price: 250,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600",
  },
  {
    id: 2,
    name: "Strawberry Bliss",
    category: "Fruit",
    description: "wow",
    price: 220,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=600",
  },
  {
    id: 3,
    name: "Vanilla Dream",
    category: "Classic",
    description: "wow",
    price: 180,
    rating: 4.5,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJGFc_i_JH35DZpkCrb-WYUksSR9hdT1ls9JT6n0UR8mJyA_z9IFLYwCTYlQVwsCaE97Xz9jiLUtDfGscaq7AQ0vn3GMPy7aukSD1iiis&s=10",
  },
  {
    id: 4,
    name: "Mango Magic",
    category: "Fruit",
    description: "wow",
    price: 200,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1488900128323-21503983a07e?w=600",
  },
  {
    id: 5,
    name: "Dark Chocolate",
    category: "Chocolate",
    description: "wow",
    price: 280,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1560008581-09826d1de69e?w=600",
  },
  {
    id: 6,
    name: "Butterscotch",
    category: "Classic",
    description: "wow",
    price: 190,
    rating: 4.4,
    image:
      "https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?w=600",
  },
];

function Product() {
  const [cart, setCart] = useState(0);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("default");

  // Filter products
  let filteredProducts = productData.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      category === "All" || product.category === category;

    return matchesSearch && matchesCategory;
  });

  // Sort products
  if (sort === "low-high") {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sort === "high-low") {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sort === "rating") {
    filteredProducts.sort((a, b) => b.rating - a.rating);
  }

  // Add to cart
  const addToCart = () => {
    setCart((previousCart) => previousCart + 1);
  };

  return (
    <div className="product-page">
<Navbar />
      
      {/* Product Banner */}
      <section className="product-banner">
        <h1>Our Ice Cream Collection</h1>
        <p>Discover your favourite flavour with KONFiZ.</p>
      </section>

      {/* Product Controls */}
      <section className="section">

        <div className="product-toolbar">

          {/* Category Filter */}
          <div className="category-filters">
            {["All", "Chocolate", "Fruit", "Classic"].map((item) => (
              <button
                key={item}
                className={
                  category === item ? "filter-btn active" : "filter-btn"
                }
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>

          {/* Search and Sort */}
          <div className="product-controls">
            <input
              type="text"
              placeholder="Search ice cream..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="default">Default Sorting</option>
              <option value="low-high">Price: Low to High</option>
              <option value="high-low">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>

        </div>

        {/* Product Count */}
        <p>Showing {filteredProducts.length} products</p>

        {/* Product Grid */}
        <div className="product-grid">

          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div className="product-card" key={product.id}>

                <img
                  src={product.image}
                  alt={product.name}
                />

                <div className="product-info">
                  <h3>{product.name}</h3>

                  <p>{product.category}</p>
                  <p>{product.description}</p>

                  <p>⭐ {product.rating}</p>

                  <h4>₹{product.price}</h4>

                  <button onClick={addToCart}>
                    Add to Cart
                  </button>
                </div>

              </div>
            ))
          ) : (
            <div className="empty-products">
              <h3>No products found</h3>
              <p>Try another search or category.</p>
            </div>
          )}

        </div>

      </section>

      {/* Cart Summary */}
      <div className="cart-summary">
        <p>Items in Cart: {cart}</p>
      </div>

      {/* Footer */}
      <footer className="footer">
        <h2>KONFiZ</h2>
        <p>Taste the Happiness!</p>
        <p>© 2026 KONFiZ. All rights reserved.</p>
      </footer>

    </div>
  );
}

export default Product;
