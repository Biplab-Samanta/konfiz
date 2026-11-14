
import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import "../style/product.css";
import Navbar from "../components/navber";
import { useCart } from "../context/cartcontext";

function Product() {

  // =====================================
  // CART CONTEXT
  // =====================================

  const {
    addToCart: addProductToCart,
    totalQuantity,
    cartCount,
    subTotal
  } = useCart();

  // =====================================
  // STATES
  // =====================================

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("default");

  const [productData, setProductData] = useState([]);

  // Store selected weight and addons for each product
  const [selections, setSelections] = useState({});

  // =====================================
  // LOAD PRODUCTS FROM LOCAL STORAGE
  // =====================================

  useEffect(() => {

    const loadProducts = () => {
      try {
        const savedProducts = JSON.parse(
          localStorage.getItem("konfizProducts") || "[]"
        );

        setProductData(
          Array.isArray(savedProducts) ? savedProducts : []
        );

      } catch (error) {
        console.error("Product loading error:", error);
        setProductData([]);
      }
    };

    loadProducts();

    window.addEventListener("storage", loadProducts);
    window.addEventListener("focus", loadProducts);

    return () => {
      window.removeEventListener("storage", loadProducts);
      window.removeEventListener("focus", loadProducts);
    };

  }, []);

  // =====================================
  // PRODUCT PRICE FUNCTIONS
  // =====================================

  const getWeightOptions = (product) => {

    const options = product.pricing?.weightOptions;

    if (Array.isArray(options) && options.length > 0) {
      return options;
    }

    return [null];
  };

  const getDefaultWeight = (product) => {

    const options = getWeightOptions(product);

    if (options[0] === null) return null;

    return options[0];
  };

  const getUnit = (product) => {
    return product.pricing?.unit || "ml";
  };

  // =====================================
  // BASE PRICE CALCULATION
  // =====================================

  const getBasePrice = (product, weight) => {

    if (
      product.pricing &&
      weight !== null &&
      weight !== undefined &&
      Number(product.pricing.baseQuantity) > 0
    ) {

      const rate = Number(
        product.pricing.pricePerBaseUnit ?? product.price
      );

      return (
        (rate * Number(weight)) /
        Number(product.pricing.baseQuantity)
      );
    }

    return Number(product.price) || 0;
  };

  // =====================================
  // TOTAL PRODUCT PRICE
  // =====================================

  const getSelectedPrice = (product) => {

    const selected = selections[product.id] || {};

    const weight =
      selected.weight !== undefined
        ? selected.weight
        : getDefaultWeight(product);

    const selectedAddons = selected.addons || [];

    const basePrice = getBasePrice(product, weight);

    const addonPrice = (product.addons || [])
      .filter((addon) =>
        selectedAddons.includes(addon.id)
      )
      .reduce(
        (total, addon) =>
          total + Number(addon.price || 0),
        0
      );

    return basePrice + addonPrice;
  };

  // =====================================
  // UPDATE WEIGHT
  // =====================================

  const handleWeightChange = (productId, weight) => {

    setSelections((prev) => ({
      ...prev,

      [productId]: {
        ...prev[productId],

        weight:
          weight === "" ? null : Number(weight)
      }
    }));
  };

  // =====================================
  // UPDATE ADDONS
  // =====================================

  const handleAddonChange = (
    productId,
    addonId,
    checked
  ) => {

    setSelections((prev) => {

      const current = prev[productId] || {};

      const currentAddons = current.addons || [];

      const updatedAddons = checked
        ? [...currentAddons, addonId]
        : currentAddons.filter(
            (id) => id !== addonId
          );

      return {
        ...prev,

        [productId]: {
          ...current,
          addons: updatedAddons
        }
      };

    });
  };

  // =====================================
  // ADD TO CART
  // =====================================

  const handleAddToCart = (product) => {

    const selected = selections[product.id] || {};

    const weight =
      selected.weight !== undefined
        ? selected.weight
        : getDefaultWeight(product);

    const selectedAddons = selected.addons || [];

    // Get selected addon details
    const addons = (product.addons || [])
      .filter((addon) =>
        selectedAddons.includes(addon.id)
      )
      .map((addon) => ({
        id: addon.id,
        name: addon.name,
        price: Number(addon.price || 0)
      }));

    // Calculate base price
    const basePrice = getBasePrice(product, weight);

    // Calculate addon price
    const addonPrice = addons.reduce(
      (total, addon) => total + addon.price,
      0
    );

    // Final price
    const totalPrice = basePrice + addonPrice;

    // Unique combination:
    // Same product + same weight + same addons
    // will be treated as the same cart item.

    const cartItemId = [
      product.id,
      weight ?? "standard",
      selectedAddons.slice().sort().join("-")
    ].join("__");

    // Prepare cart product
    const cartProduct = {
      id: cartItemId,
      cartItemId,

      productId: product.id,
      name: product.name,
      image: product.image,
      category: product.category,

      weight,
      unit: getUnit(product),

      addons,

      basePrice,
      addonPrice,

      price: totalPrice,
      quantity: 1
    };

    // Add using CartContext
    addProductToCart(cartProduct);

    console.log(
      "Added to customer cart:",
      cartProduct
    );
  };

  // =====================================
  // FILTER PRODUCTS
  // =====================================

  const filteredProducts = useMemo(() => {

    let products = productData.filter((product) => {

      const matchesSearch =
        (product.name || "")
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =
        category === "All" ||
        product.category === category;

      return matchesSearch && matchesCategory;
    });

    if (sort === "low-high") {

      products.sort(
        (a, b) =>
          Number(a.price || 0) -
          Number(b.price || 0)
      );

    } else if (sort === "high-low") {

      products.sort(
        (a, b) =>
          Number(b.price || 0) -
          Number(a.price || 0)
      );

    } else if (sort === "rating") {

      products.sort(
        (a, b) =>
          Number(b.rating || 0) -
          Number(a.rating || 0)
      );
    }

    return products;

  }, [productData, search, category, sort]);

  // =====================================
  // UI
  // =====================================

  return (

    <div className="product-page">

      <Navbar />

      {/* PRODUCT BANNER */}

      <section className="product-banner">

        <div className="container">

          <h1>Our Ice Cream Collection</h1>

          <p>
            Discover your favourite flavour with KONFiZ.
          </p>

        </div>

      </section>

      {/* PRODUCT CONTROLS */}

      <section className="section">

        <div className="product-toolbar">

          {/* CATEGORY FILTERS */}

          <div className="category-filters">

            {[
              "All",
              ...new Set(
                productData
                  .map((product) => product.category)
                  .filter(Boolean)
              )
            ].map((item) => (

              <button
                key={item}
                className={
                  category === item
                    ? "filter-btn active"
                    : "filter-btn"
                }
                onClick={() => setCategory(item)}
              >
                {item}
              </button>

            ))}

          </div>

          {/* SEARCH AND SORT */}

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

              <option value="default">
                Default Sorting
              </option>

              <option value="low-high">
                Price: Low to High
              </option>

              <option value="high-low">
                Price: High to Low
              </option>

              <option value="rating">
                Top Rated
              </option>

            </select>

          </div>

        </div>

        {/* PRODUCT COUNT */}

        <p className="product-count">
          Showing {filteredProducts.length} products
        </p>

        {/* PRODUCT GRID */}

        <div className="product-grid">

          {filteredProducts.length > 0 ? (

            filteredProducts.map((product) => {

              const weightOptions =
                getWeightOptions(product);

              const selectedWeight =
                selections[product.id]?.weight ??
                getDefaultWeight(product);

              const selectedAddons =
                selections[product.id]?.addons || [];

              const totalPrice =
                getSelectedPrice(product);

              const basePrice =
                getBasePrice(product, selectedWeight);

              return (

                <div
                  className="product-card"
                  key={product.id}
                >

                  {/* PRODUCT IMAGE */}

                  <div className="product-image-wrapper">

                    <img
                      src={product.image}
                      alt={product.name}
                    />

                    <span className="product-category">
                      {product.category}
                    </span>

                  </div>

                  {/* PRODUCT INFORMATION */}

                  <div className="product-info">

                    <h3>{product.name}</h3>

                    <p className="product-description">
                      {product.description}
                    </p>

                    {/* PRODUCT RATING */}

                    <div className="product-rating">
                      ⭐ {Number(product.rating || 0).toFixed(1)}
                    </div>

                    {/* WEIGHT SELECTION */}

                    <div className="product-weight-section">

                      <label>Select Weight</label>

                      <select
                        value={selectedWeight ?? ""}
                        onChange={(e) =>
                          handleWeightChange(
                            product.id,
                            e.target.value
                          )
                        }
                      >

                        {weightOptions.map((weight, index) => (

                          <option
                            key={weight ?? index}
                            value={weight ?? ""}
                          >

                            {weight === null
                              ? "Standard"
                              : `${weight} ${getUnit(product)}`}

                          </option>

                        ))}

                      </select>

                    </div>

                    {/* ADDONS SELECTION */}

                    {product.addons?.length > 0 && (

                      <div className="product-addon-section">

                        <h4>Customize Your Ice Cream</h4>

                        {product.addons.map((addon) => (

                          <label
                            className="product-addon-option"
                            key={addon.id}
                          >

                            <input
                              type="checkbox"
                              checked={selectedAddons.includes(
                                addon.id
                              )}
                              onChange={(e) =>
                                handleAddonChange(
                                  product.id,
                                  addon.id,
                                  e.target.checked
                                )
                              }
                            />

                            <span>{addon.name}</span>

                            <strong>
                              + ₹
                              {Number(addon.price || 0).toFixed(2)}
                            </strong>

                          </label>

                        ))}

                      </div>

                    )}

                    {/* PRICE DETAILS */}

                    <div className="product-price-section">

                      <div className="price-breakdown">

                        <span>Product Price</span>

                        <strong>
                          ₹{basePrice.toFixed(2)}
                        </strong>

                      </div>

                      {selectedAddons.length > 0 && (

                        <div className="price-breakdown">

                          <span>Add-ons</span>

                          <strong>
                            + ₹
                            {(totalPrice - basePrice).toFixed(2)}
                          </strong>

                        </div>

                      )}

                      <div className="total-price">

                        <span>Total Price</span>

                        <h3>
                          ₹{totalPrice.toFixed(2)}
                        </h3>

                      </div>

                    </div>

                    {/* ADD TO CART */}

                    <button
                      className="add-cart-btn"
                      onClick={() =>
                        handleAddToCart(product)
                      }
                    >
                      + Add to Cart
                    </button>

                  </div>

                </div>

              );

            })

          ) : (

            <div className="empty-products">

              <h3>No products found</h3>

              <p>
                Try another search or category.
              </p>

            </div>

          )}

        </div>

      </section>

      {/* CART SUMMARY */}

      <div className="cart-summary">

        <div>

          <p>
            Different Items: {cartCount}
          </p>

          <p>
            Total Quantity: {totalQuantity}
          </p>

          <strong>
            Cart Total: ₹
            {Number(subTotal || 0).toFixed(2)}
          </strong>

        </div>

        <Link
          to="/cart"
          className="view-cart-btn"
        >
          View Cart ({totalQuantity})
        </Link>

      </div>

      {/* FOOTER */}

      <footer className="footer">

        <h2>KONFiZ</h2>

        <p>Taste the Happiness!</p>

        <p>
          © 2026 KONFiZ. All rights reserved.
        </p>

      </footer>

    </div>

  );

}

export default Product;
