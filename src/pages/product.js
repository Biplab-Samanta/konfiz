import React, { useState, useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import "../style/product.css";
import Navbar from "../components/navber";
import { useCart } from "../context/cartcontext";

// =====================================
// COMMON HELPERS
// =====================================

const makeSlug = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const getCategoryName = category => {
  if (!category) return "";

  if (typeof category === "string") {
    return category;
  }

  return (
    category.name ||
    category.categoryName ||
    category.title ||
    ""
  );
};

const getCategoryId = category => {
  if (!category || typeof category !== "object") {
    return "";
  }

  return category.id || category.categoryId || "";
};

const getAddonId = addon =>
  String(addon.id ?? addon.name ?? "");

const getWeightOptions = product => {
  const options = product.pricing?.weightOptions;

  if (Array.isArray(options) && options.length > 0) {
    return options;
  }

  return [null];
};

const getUnit = product =>
  product.pricing?.unit || "ml";

const getBasePrice = (product, weight) => {
  const pricing = product.pricing;

  if (
    pricing &&
    weight !== null &&
    weight !== undefined &&
    Number(pricing.baseQuantity) > 0
  ) {
    const rate = Number(
      pricing.pricePerBaseUnit ?? product.price ?? 0
    );

    return (
      rate *
      Number(weight) /
      Number(pricing.baseQuantity)
    );
  }

  return Number(product.price) || 0;
};

const getProductCategoryName = product =>
  getCategoryName(product.category) ||
  product.categoryName ||
  "";

// =====================================
// PRODUCT COMPONENT
// =====================================

function Product() {
  const { categorySlug } = useParams();

  const {
    addToCart: addProductToCart,
    totalQuantity,
    cartCount,
    subTotal
  } = useCart();

  // =====================================
  // STATES
  // =====================================

  const [productData, setProductData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [storeLoaded, setStoreLoaded] = useState(false);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");

  const [selections, setSelections] = useState({});

  const [addonPopup, setAddonPopup] = useState({
    open: false,
    product: null,
    weight: null,
    quantity: 1,
    addons: []
  });

  // =====================================
  // LOAD PRODUCTS AND CATEGORIES
  // =====================================

  useEffect(() => {
    const loadStoreData = () => {
      try {
        const savedProducts = JSON.parse(
          localStorage.getItem("konfizProducts") || "[]"
        );

        const savedCategories = JSON.parse(
          localStorage.getItem("konfizCategories") || "[]"
        );

        // Support both array and wrapped object formats
        const products = Array.isArray(savedProducts)
          ? savedProducts
          : Array.isArray(savedProducts?.products)
            ? savedProducts.products
            : [];

        const categoryList = Array.isArray(savedCategories)
          ? savedCategories
          : Array.isArray(savedCategories?.categories)
            ? savedCategories.categories
            : [];

        setProductData(products);
        setCategories(categoryList);
      } catch (error) {
        console.error("KONFiZ store loading error:", error);

        setProductData([]);
        setCategories([]);
      } finally {
        setStoreLoaded(true);
      }
    };

    loadStoreData();

    window.addEventListener("storage", loadStoreData);
    window.addEventListener("focus", loadStoreData);
    window.addEventListener("konfizStoreUpdated", loadStoreData);

    return () => {
      window.removeEventListener("storage", loadStoreData);
      window.removeEventListener("focus", loadStoreData);
      window.removeEventListener("konfizStoreUpdated", loadStoreData);
    };
  }, []);

  // =====================================
  // NORMALIZE CATEGORIES
  // =====================================

  const normalizedCategories = useMemo(() => {
    return categories
      .map((item, index) => {
        const name = getCategoryName(item);

        if (!name) return null;

        const id =
          getCategoryId(item) ||
          `category_${index}`;

        const slug = makeSlug(
          item.slug || name
        );

        return {
          id: String(id),
          name,
          slug,
          description:
            item.description || item.details || ""
        };
      })
      .filter(Boolean)
      .filter(
        (item, index, array) =>
          array.findIndex(
            category => category.slug === item.slug
          ) === index
      );
  }, [categories]);

  // =====================================
  // GET CURRENT CATEGORY FROM URL
  // =====================================

  const normalizedUrlSlug = makeSlug(categorySlug || "");

  const currentCategory = useMemo(() => {
    if (!normalizedUrlSlug) return null;

    return (
      normalizedCategories.find(
        category => category.slug === normalizedUrlSlug
      ) || null
    );
  }, [normalizedUrlSlug, normalizedCategories]);

  // =====================================
  // PRODUCT CATEGORY MATCHING
  // =====================================

  const productMatchesCategory = (
    product,
    selectedCategory
  ) => {
    if (!selectedCategory) return true;

    const productCategoryName =
      getProductCategoryName(product);

    const productCategoryId =
      product.categoryId ||
      getCategoryId(product.category);

    // First try matching category IDs
    if (
      productCategoryId &&
      String(productCategoryId) ===
        String(selectedCategory.id)
    ) {
      return true;
    }

    // Then try matching category name or slug.
    // This also supports older products saved without categoryId.
    if (productCategoryName) {
      return (
        makeSlug(productCategoryName) ===
          selectedCategory.slug ||
        productCategoryName.trim().toLowerCase() ===
          selectedCategory.name.trim().toLowerCase()
      );
    }

    return false;
  };

  // =====================================
  // UPDATE WEIGHT
  // =====================================

  const handleWeightChange = (productId, weight) => {
    setSelections(previous => ({
      ...previous,
      [productId]: {
        ...previous[productId],
        weight: weight === "" ? null : Number(weight)
      }
    }));
  };

  // =====================================
  // UPDATE QUANTITY
  // =====================================

  const handleQuantityChange = (productId, quantity) => {
    setSelections(previous => ({
      ...previous,
      [productId]: {
        ...previous[productId],
        quantity: Math.max(1, Number(quantity) || 1)
      }
    }));
  };

  // =====================================
  // CLOSE ADD-ON POPUP
  // =====================================

  const closeAddonPopup = () => {
    setAddonPopup({
      open: false,
      product: null,
      weight: null,
      quantity: 1,
      addons: []
    });
  };

  // =====================================
  // FINAL ADD TO CART
  // =====================================

  const completeAddToCart = (
    product,
    weight,
    quantity,
    selectedAddonIds = []
  ) => {
    const addons = (product.addons || [])
      .filter(addon =>
        selectedAddonIds.includes(getAddonId(addon))
      )
      .map(addon => ({
        id: getAddonId(addon),
        name: addon.name,
        price: Number(addon.price) || 0
      }));

    const basePrice = getBasePrice(product, weight);

    const addonPrice = addons.reduce(
      (total, addon) => total + addon.price,
      0
    );

    const totalPrice = basePrice + addonPrice;

    // Same product, weight and add-ons = same cart item
    const cartItemId = [
      product.id || product.name,
      weight ?? "standard",
      addons
        .map(addon => addon.id)
        .sort()
        .join("-")
    ].join("__");

    const cartProduct = {
      id: cartItemId,
      cartItemId,

      productId: product.id,
      name: product.name,
      image: product.image,

      category:
        getProductCategoryName(product),

      weight,
      unit: getUnit(product),

      addons,

      basePrice,
      addonPrice,

      // Price is per item. CartContext should multiply by quantity.
      price: totalPrice,
      quantity
    };

    addProductToCart(cartProduct);

    closeAddonPopup();
  };

  // =====================================
  // OPEN ADD-ON POPUP OR ADD DIRECTLY
  // =====================================

  const handleAddToCart = product => {
    const productId = product.id || product.name;
    const selected = selections[productId] || {};

    const weight =
      selected.weight !== undefined
        ? selected.weight
        : getWeightOptions(product)[0];

    const quantity = Math.max(
      1,
      Number(selected.quantity || 1)
    );

    const hasAddons =
      Array.isArray(product.addons) &&
      product.addons.length > 0;

    if (hasAddons) {
      setAddonPopup({
        open: true,
        product,
        weight,
        quantity,
        addons: []
      });

      return;
    }

    completeAddToCart(
      product,
      weight,
      quantity,
      []
    );
  };

  // =====================================
  // FILTER PRODUCTS
  // CATEGORY + SEARCH + SORT
  // =====================================

  const filteredProducts = useMemo(() => {
    // If the URL has a category but it does not exist,
    // do not accidentally show all products.
    if (
      categorySlug &&
      storeLoaded &&
      !currentCategory
    ) {
      return [];
    }

    let products = productData.filter(product => {
      const productName = String(
        product.name || ""
      ).toLowerCase();

      const productDescription = String(
        product.description || ""
      ).toLowerCase();

      const productCategory = String(
        getProductCategoryName(product)
      ).toLowerCase();

      const searchText = search.trim().toLowerCase();

      const matchesSearch =
        !searchText ||
        productName.includes(searchText) ||
        productDescription.includes(searchText) ||
        productCategory.includes(searchText);

      const matchesCategory =
        productMatchesCategory(
          product,
          currentCategory
        );

      return matchesSearch && matchesCategory;
    });

    // Sort a copy, not the original state array
    products = [...products];

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
  }, [
    productData,
    search,
    sort,
    currentCategory,
    categorySlug,
    storeLoaded
  ]);

  // =====================================
  // INVALID CATEGORY
  // =====================================

  const invalidCategory =
    Boolean(categorySlug) &&
    storeLoaded &&
    !currentCategory;

  // =====================================
  // ADD-ON POPUP PRICE
  // =====================================

  const popupBasePrice = addonPopup.product
    ? getBasePrice(
        addonPopup.product,
        addonPopup.weight
      )
    : 0;

  const popupAddonPrice = addonPopup.product
    ? (addonPopup.product.addons || [])
        .filter(addon =>
          addonPopup.addons.includes(getAddonId(addon))
        )
        .reduce(
          (total, addon) =>
            total + (Number(addon.price) || 0),
          0
        )
    : 0;

  const popupUnitPrice =
    popupBasePrice + popupAddonPrice;

  // =====================================
  // UI
  // =====================================

  return (
    <div className="product-page">

      <Navbar />

      {/* =====================================
          PRODUCT BANNER
      ===================================== */}

      <section className="product-banner">
        <div className="container">

          <h1>
            {currentCategory
              ? currentCategory.name
              : "Our Ice Cream Collection"}
          </h1>

          <p>
            {currentCategory?.description ||
              "Discover your favourite flavour with KONFiZ."}
          </p>

        </div>
      </section>

      {/* =====================================
          PRODUCT SECTION
      ===================================== */}

      <section className="section">

        {/* CATEGORY FILTER LINKS */}

        <div className="product-toolbar">

          <div className="category-filters">

            <Link
              to="/products"
              className={
                !categorySlug
                  ? "filter-btn active"
                  : "filter-btn"
              }
            >
              All Products
            </Link>

            {normalizedCategories.map(category => (
              <Link
                key={category.id}
                to={`/products/${category.slug}`}
                className={
                  normalizedUrlSlug === category.slug
                    ? "filter-btn active"
                    : "filter-btn"
                }
              >
                {category.name}
              </Link>
            ))}

          </div>

          {/* SEARCH AND SORT */}

          <div className="product-controls">

            <input
              type="text"
              placeholder="Search ice cream..."
              value={search}
              onChange={event =>
                setSearch(event.target.value)
              }
            />

            <select
              value={sort}
              onChange={event =>
                setSort(event.target.value)
              }
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
          {invalidCategory
            ? "Category not found"
            : `Showing ${filteredProducts.length} products`}
        </p>

        {/* =====================================
            PRODUCT GRID
        ===================================== */}

        <div className="product-grid">

          {filteredProducts.length > 0 ? (

            filteredProducts.map(product => {
              const productId =
                product.id || product.name;

              const weightOptions =
                getWeightOptions(product);

              const selectedWeight =
                selections[productId]?.weight !== undefined
                  ? selections[productId].weight
                  : weightOptions[0];

              const quantity =
                selections[productId]?.quantity || 1;

              const basePrice = getBasePrice(
                product,
                selectedWeight
              );

              const categoryName =
                getProductCategoryName(product) ||
                currentCategory?.name ||
                "";

              return (
                <div
                  className="product-card"
                  key={productId}
                >

                  {/* PRODUCT IMAGE */}

                  <div className="product-image-wrapper">

                    <img
                      src={product.image || "/placeholder.png"}
                      alt={product.name || "KONFiZ ice cream"}
                    />

                    {categoryName && (
                      <span className="product-category">
                        {categoryName}
                      </span>
                    )}

                  </div>

                  {/* PRODUCT DETAILS */}

                  <div className="product-info">

                    <h3>{product.name}</h3>

                    <p className="product-description">
                      {product.description}
                    </p>

                    <div className="product-rating">
                      ⭐{" "}
                      {Number(product.rating || 0).toFixed(1)}
                    </div>

                    {/* WEIGHT SELECTION */}

                    <div className="product-weight-section">

                      <label>Select Weight</label>

                      <select
                        value={selectedWeight ?? ""}
                        onChange={event =>
                          handleWeightChange(
                            productId,
                            event.target.value
                          )
                        }
                      >

                        {weightOptions.map((weight, index) => (
                          <option
                            key={`${productId}-weight-${index}`}
                            value={weight ?? ""}
                          >
                            {weight === null
                              ? "Standard"
                              : `${weight} ${getUnit(product)}`}
                          </option>
                        ))}

                      </select>

                    </div>

                    {/* QUANTITY SELECTION */}

                    <div className="product-quantity-section">

                      <label>Quantity</label>

                      <div className="quantity-controls">

                        <button
                          type="button"
                          onClick={() =>
                            handleQuantityChange(
                              productId,
                              quantity - 1
                            )
                          }
                        >
                          −
                        </button>

                        <span>{quantity}</span>

                        <button
                          type="button"
                          onClick={() =>
                            handleQuantityChange(
                              productId,
                              quantity + 1
                            )
                          }
                        >
                          +
                        </button>

                      </div>

                    </div>

                    {/* PRICE */}

                    <div className="product-price-section">

                      <div className="price-breakdown">

                        <span>Price per item</span>

                        <strong>
                          ₹{basePrice.toFixed(2)}
                        </strong>

                      </div>

                      <div className="total-price">

                        <span>Product Total</span>

                        <h3>
                          ₹{(
                            basePrice * quantity
                          ).toFixed(2)}
                        </h3>

                      </div>

                    </div>

                    {/* ADD TO CART */}

                    <button
                      type="button"
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

              <h3>
                {invalidCategory
                  ? "Category not found"
                  : "No products found"}
              </h3>

              <p>
                {invalidCategory
                  ? "This category may have been renamed or deleted."
                  : "Try another search or select a different category."}
              </p>

              <Link
                to="/products"
                className="filter-btn"
              >
                View All Products
              </Link>

            </div>

          )}

        </div>
      </section>

      {/* =====================================
          ADD-ON POPUP
      ===================================== */}

      {addonPopup.open && addonPopup.product && (

        <div
          className="addon-modal-overlay"
          onClick={closeAddonPopup}
        >

          <div
            className="addon-modal"
            onClick={event => event.stopPropagation()}
          >

            <button
              type="button"
              className="addon-modal-close"
              onClick={closeAddonPopup}
            >
              ×
            </button>

            <h2>Make It Extra Special! 🍨</h2>

            <p>
              Choose your favourite toppings or skip this step.
            </p>

            {/* SELECTED PRODUCT */}

            <div className="addon-modal-product">

              <img
                src={
                  addonPopup.product.image ||
                  "/placeholder.png"
                }
                alt={addonPopup.product.name}
              />

              <div>

                <h3>
                  {addonPopup.product.name}
                </h3>

                <p>
                  {addonPopup.weight !== null &&
                  addonPopup.weight !== undefined
                    ? `${addonPopup.weight} ${getUnit(
                        addonPopup.product
                      )}`
                    : "Standard"}
                </p>

                <p>
                  Quantity: {addonPopup.quantity}
                </p>

              </div>
            </div>

            {/* AVAILABLE ADD-ONS */}

            <h3>Choose Your Add-ons</h3>

            <div className="addon-modal-list">

              {(addonPopup.product.addons || []).map(
                (addon, index) => {
                  const addonId = getAddonId(addon);

                  return (
                    <label
                      key={`${addonId}-${index}`}
                      className="addon-modal-option"
                    >

                      <input
                        type="checkbox"
                        checked={addonPopup.addons.includes(
                          addonId
                        )}
                        onChange={event => {
                          setAddonPopup(previous => ({
                            ...previous,

                            addons: event.target.checked
                              ? [
                                  ...previous.addons,
                                  addonId
                                ]
                              : previous.addons.filter(
                                  id => id !== addonId
                                )
                          }));
                        }}
                      />

                      <span>{addon.name}</span>

                      <strong>
                        + ₹{(
                          Number(addon.price) || 0
                        ).toFixed(2)}
                      </strong>

                    </label>
                  );
                }
              )}

            </div>

            {/* POPUP PRICE SUMMARY */}

            <div className="addon-modal-total">

              <span>Base price per item</span>

              <strong>
                ₹{popupBasePrice.toFixed(2)}
              </strong>

              <span>Add-ons per item</span>

              <strong>
                ₹{popupAddonPrice.toFixed(2)}
              </strong>

              <span>Price per item</span>

              <strong>
                ₹{popupUnitPrice.toFixed(2)}
              </strong>

              <span>Quantity</span>

              <strong>
                {addonPopup.quantity}
              </strong>

              <span>Order total</span>

              <strong>
                ₹{(
                  popupUnitPrice * addonPopup.quantity
                ).toFixed(2)}
              </strong>

            </div>

            {/* POPUP BUTTONS */}

            <div className="addon-modal-actions">

              <button
                type="button"
                className="skip-addon-btn"
                onClick={() =>
                  completeAddToCart(
                    addonPopup.product,
                    addonPopup.weight,
                    addonPopup.quantity,
                    []
                  )
                }
              >
                Skip Add-ons
              </button>

              <button
                type="button"
                className="confirm-addon-btn"
                onClick={() =>
                  completeAddToCart(
                    addonPopup.product,
                    addonPopup.weight,
                    addonPopup.quantity,
                    addonPopup.addons
                  )
                }
              >
                Add to Cart
              </button>

            </div>

          </div>
        </div>
      )}

      {/* =====================================
          CART SUMMARY
      ===================================== */}

      <div className="cart-summary">

        <div>

          <p>
            Different Items: {cartCount}
          </p>

          <p>
            Total Quantity: {totalQuantity}
          </p>

          <strong>
            Cart Total: ₹{Number(subTotal || 0).toFixed(2)}
          </strong>

        </div>

        <Link
          to="/cart"
          className="view-cart-btn"
        >
          View Cart ({totalQuantity})
        </Link>

      </div>

      {/* =====================================
          FOOTER
      ===================================== */}

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