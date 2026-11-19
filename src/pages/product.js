
import React, { useState, useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import "../style/product.css";
import Navbar from "../components/navber";
import { useCart } from "../context/cartcontext";

// =====================================
// HELPERS
// =====================================

const makeSlug = (value = "") =>
  String(value).toLowerCase().trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const getCategoryName = category => {
  if (!category) return "";
  if (typeof category === "string") return category;

  return category.name ||
    category.categoryName ||
    category.title || "";
};

const getCategoryId = category => {
  if (!category || typeof category !== "object") return "";
  return category.id || category.categoryId || "";
};

const getProductCategoryName = product =>
  getCategoryName(product.category) ||
  product.categoryName || "";

const getAddonId = addon =>
  String(addon.id ?? addon.name ?? "");

const getWeightOptions = product => {
  const options = product.pricing?.weightOptions;
  return Array.isArray(options) && options.length
    ? options : [null];
};

const getUnit = product => product.pricing?.unit || "ml";

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

    return rate * Number(weight) / Number(pricing.baseQuantity);
  }

  return Number(product.price) || 0;
};

const getFlavour = product =>
  product.flavour ||
  product.flavor ||
  product.taste ||
  "";

const getStock = product => {
  if (product.inStock !== undefined) return Boolean(product.inStock);
  if (product.available !== undefined) return Boolean(product.available);
  if (product.stock !== undefined) return Number(product.stock) > 0;
  if (product.quantity !== undefined) return Number(product.quantity) > 0;
  return true;
};

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

  // STORE DATA
  const [productData, setProductData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [storeLoaded, setStoreLoaded] = useState(false);

  // SEARCH AND FILTERS
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedFlavour, setSelectedFlavour] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // PRODUCT SELECTION
  const [selections, setSelections] = useState({});

  // ADD-ON POPUP
  const [addonPopup, setAddonPopup] = useState({
    open: false,
    product: null,
    weight: null,
    quantity: 1,
    addons: []
  });

  // =====================================
  // LOAD LOCAL STORAGE
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

        setProductData(
          Array.isArray(savedProducts)
            ? savedProducts
            : savedProducts?.products || []
        );

        setCategories(
          Array.isArray(savedCategories)
            ? savedCategories
            : savedCategories?.categories || []
        );
      } catch (error) {
        console.error("KONFiZ loading error:", error);
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
    return categories.map((item, index) => {
      const name = getCategoryName(item);
      if (!name) return null;

      return {
        id: String(getCategoryId(item) || `category_${index}`),
        name,
        slug: makeSlug(item.slug || name),
        description: item.description || item.details || ""
      };
    }).filter(Boolean);
  }, [categories]);

  const normalizedUrlSlug = makeSlug(categorySlug || "");

  const currentCategory = useMemo(() => {
    if (!normalizedUrlSlug) return null;

    return normalizedCategories.find(
      category => category.slug === normalizedUrlSlug
    ) || null;
  }, [normalizedCategories, normalizedUrlSlug]);

  // =====================================
  // CATEGORY MATCHING
  // =====================================

  const productMatchesCategory = (product, category) => {
    if (!category) return true;

    const name = getProductCategoryName(product);
    const id = product.categoryId || getCategoryId(product.category);

    if (id && String(id) === String(category.id)) return true;

    return makeSlug(name) === category.slug;
  };

  // =====================================
  // DYNAMIC FLAVOURS AND SIZES
  // =====================================

  const availableFlavours = useMemo(() => {
    return [...new Set(
      productData.map(getFlavour).filter(Boolean)
    )].sort();
  }, [productData]);

  const availableSizes = useMemo(() => {
    return [...new Set(
      productData.flatMap(product =>
        getWeightOptions(product)
          .filter(weight => weight !== null && weight !== undefined)
          .map(weight => `${weight} ${getUnit(product)}`)
      )
    )].sort();
  }, [productData]);

  // =====================================
  // PRODUCT PRICE RANGE
  // =====================================

  const priceLimits = useMemo(() => {
    const prices = productData.map(p => Number(p.price) || 0);
    return {
      min: prices.length ? Math.floor(Math.min(...prices)) : 0,
      max: prices.length ? Math.ceil(Math.max(...prices)) : 500
    };
  }, [productData]);

  // =====================================
  // FILTER RESET
  // =====================================

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setSelectedFlavour("");
    setSelectedSize("");
    setMinPrice("");
    setMaxPrice("");
    setInStockOnly(false);
    setSort("default");
  };

  const activeFilterCount = [
    selectedCategory,
    selectedFlavour,
    selectedSize,
    minPrice,
    maxPrice,
    inStockOnly
  ].filter(Boolean).length;

  // =====================================
  // WEIGHT AND QUANTITY
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
  // ADD TO CART
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

  const completeAddToCart = (
    product,
    weight,
    quantity,
    selectedAddonIds = []
  ) => {
    const addons = (product.addons || [])
      .filter(addon => selectedAddonIds.includes(getAddonId(addon)))
      .map(addon => ({
        id: getAddonId(addon),
        name: addon.name,
        price: Number(addon.price) || 0
      }));

    const basePrice = getBasePrice(product, weight);

    const addonPrice = addons.reduce(
      (total, addon) => total + addon.price, 0
    );

    const totalPrice = basePrice + addonPrice;

    const cartItemId = [
      product.id || product.name,
      weight ?? "standard",
      addons.map(a => a.id).sort().join("-")
    ].join("__");

    addProductToCart({
      id: cartItemId,
      cartItemId,
      productId: product.id,
      name: product.name,
      image: product.image || null,
      category: getProductCategoryName(product),
      weight,
      unit: getUnit(product),
      addons,
      basePrice,
      addonPrice,
      price: totalPrice,
      quantity
    });

    closeAddonPopup();
  };

  const handleAddToCart = product => {
    const productId = product.id || product.name;
    const selected = selections[productId] || {};
    const options = getWeightOptions(product);

    const weight = selected.weight !== undefined
      ? selected.weight
      : options[0];

    const quantity = Math.max(1, Number(selected.quantity || 1));

    if (Array.isArray(product.addons) && product.addons.length > 0) {
      setAddonPopup({
        open: true,
        product,
        weight,
        quantity,
        addons: []
      });
      return;
    }

    completeAddToCart(product, weight, quantity, []);
  };

  // =====================================
  // FILTER AND SORT PRODUCTS
  // =====================================

  const filteredProducts = useMemo(() => {
    if (categorySlug && storeLoaded && !currentCategory) return [];

    let result = productData.filter(product => {
      const name = String(product.name || "").toLowerCase();
      const description = String(product.description || "").toLowerCase();
      const category = getProductCategoryName(product);
      const flavour = getFlavour(product);

      const matchesSearch =
        !search.trim() ||
        name.includes(search.toLowerCase()) ||
        description.toLowerCase().includes(search.toLowerCase()) ||
        category.toLowerCase().includes(search.toLowerCase()) ||
        flavour.toLowerCase().includes(search.toLowerCase());

      const matchesUrlCategory =
        productMatchesCategory(product, currentCategory);

      const matchesSelectedCategory =
        !selectedCategory ||
        makeSlug(category) === selectedCategory;

      const matchesFlavour =
        !selectedFlavour ||
        flavour.toLowerCase() === selectedFlavour.toLowerCase();

      const matchesPrice =
        (!minPrice || Number(product.price) >= Number(minPrice)) &&
        (!maxPrice || Number(product.price) <= Number(maxPrice));

      const matchesSize =
        !selectedSize ||
        getWeightOptions(product).some(weight =>
          `${weight} ${getUnit(product)}` === selectedSize
        );

      const matchesStock =
        !inStockOnly || getStock(product);

      return (
        matchesSearch &&
        matchesUrlCategory &&
        matchesSelectedCategory &&
        matchesFlavour &&
        matchesPrice &&
        matchesSize &&
        matchesStock
      );
    });

    result = [...result];

    if (sort === "low-high") {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sort === "high-low") {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sort === "rating") {
      result.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    } else if (sort === "name") {
      result.sort((a, b) => String(a.name).localeCompare(String(b.name)));
    }

    return result;
  }, [
    productData,
    search,
    sort,
    currentCategory,
    categorySlug,
    storeLoaded,
    selectedCategory,
    selectedFlavour,
    selectedSize,
    minPrice,
    maxPrice,
    inStockOnly
  ]);

  const invalidCategory =
    Boolean(categorySlug) && storeLoaded && !currentCategory;

  // =====================================
  // ADD-ON POPUP TOTALS
  // =====================================

  const popupBasePrice = addonPopup.product
    ? getBasePrice(addonPopup.product, addonPopup.weight)
    : 0;

  const popupAddonPrice = addonPopup.product
    ? (addonPopup.product.addons || [])
        .filter(addon =>
          addonPopup.addons.includes(getAddonId(addon))
        )
        .reduce((total, addon) =>
          total + (Number(addon.price) || 0), 0)
    : 0;

  const popupUnitPrice = popupBasePrice + popupAddonPrice;

  // =====================================
  // FILTER SIDEBAR
  // =====================================

  const FilterContent = () => (
    <>
      <div className="filter-heading">
        <h3>Filters</h3>
        <button type="button" onClick={clearFilters}>Clear All</button>
      </div>

      <div className="filter-group">
        <h4>Category</h4>
        {normalizedCategories.map(category => (
          <label className="filter-option" key={category.id}>
            <input
              type="radio"
              name="filter-category"
              checked={selectedCategory === category.slug}
              onChange={() => setSelectedCategory(
                selectedCategory === category.slug ? "" : category.slug
              )}
            />
            <span>{category.name}</span>
          </label>
        ))}
      </div>

      <div className="filter-group">
        <h4>Flavour</h4>
        {availableFlavours.length ? availableFlavours.map(flavour => (
          <label className="filter-option" key={flavour}>
            <input
              type="radio"
              name="filter-flavour"
              checked={selectedFlavour === flavour}
              onChange={() => setSelectedFlavour(
                selectedFlavour === flavour ? "" : flavour
              )}
            />
            <span>{flavour}</span>
          </label>
        )) : <p className="filter-hint">Add flavour details in admin.</p>}
      </div>

      <div className="filter-group">
        <h4>Price Range (₹)</h4>
        <div className="price-inputs">
          <input
            type="number"
            min="0"
            placeholder="Min"
            value={minPrice}
            onChange={e => setMinPrice(e.target.value)}
          />
          <span>–</span>
          <input
            type="number"
            min="0"
            placeholder="Max"
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
          />
        </div>
        <p className="filter-hint">
          Available range: ₹{priceLimits.min} – ₹{priceLimits.max}
        </p>
      </div>

      <div className="filter-group">
        <h4>Size</h4>
        {availableSizes.map(size => (
          <label className="filter-option" key={size}>
            <input
              type="radio"
              name="filter-size"
              checked={selectedSize === size}
              onChange={() => setSelectedSize(
                selectedSize === size ? "" : size
              )}
            />
            <span>{size}</span>
          </label>
        ))}
      </div>

      <div className="filter-group">
        <h4>Availability</h4>
        <label className="filter-option">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={e => setInStockOnly(e.target.checked)}
          />
          <span>In Stock Only</span>
        </label>
      </div>
    </>
  );

  // =====================================
  // UI
  // =====================================

  return (
    <div className="product-page">
      <Navbar />

      {/* PAGE BANNER */}
      <section className="product-banner">
        <div className="product-container">
          <span className="banner-eyebrow">A LITTLE SCOOP OF HAPPINESS</span>
          <h1>
            {currentCategory
              ? currentCategory.name
              : "Explore Our Ice Creams"}
          </h1>
          <p>
            {currentCategory?.description ||
              "Discover delicious flavours made to make every moment sweeter."}
          </p>
        </div>
      </section>

      <main className="product-container product-main">

        {/* CATEGORY CARDS */}
        <section className="category-section">
          <div className="section-heading">
            <div>
              <span className="section-eyebrow">EXPLORE</span>
              <h2>Shop By Category</h2>
            </div>
            <Link to="/products">View All Products →</Link>
          </div>

          {/* <div className="category-card-list">
            {normalizedCategories.map(category => (
              <Link
                key={category.id}
                to={`/products/${category.slug}`}
                className={`category-card ${
                  normalizedUrlSlug === category.slug ? "active" : ""
                }`}
              >
                <div className="category-card-icon">
                  <span>🍨</span>
                </div>
                <h3>{category.name}</h3>
                <span>Explore Collection →</span>
              </Link>
            ))}
          </div> */}
        </section>

        {/* SEARCH */}
        <section className="product-search-section">
          <div className="search-box">
            <span>⌕</span>
            <input
              type="search"
              placeholder="Search ice cream, flavours..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button type="button" onClick={() => setSearch("")}>×</button>
            )}
          </div>
        </section>

        {/* QUICK FILTERS */}
        <section className="quick-filter-section">
          <span>Popular:</span>
          {["Chocolate", "Vanilla", "Strawberry"].filter(flavour =>
            availableFlavours.some(
              item => item.toLowerCase() === flavour.toLowerCase()
            )
          ).map(flavour => (
            <button
              type="button"
              key={flavour}
              className={`quick-filter ${
                selectedFlavour === flavour ? "active" : ""
              }`}
              onClick={() => setSelectedFlavour(
                selectedFlavour === flavour ? "" : flavour
              )}
            >
              {flavour}
            </button>
          ))}
          <button
            type="button"
            className={`quick-filter ${inStockOnly ? "active" : ""}`}
            onClick={() => setInStockOnly(!inStockOnly)}
          >
            In Stock
          </button>
        </section>

        {/* PRODUCTS AND SIDEBAR */}
        <section className="shop-layout">

          {/* DESKTOP SIDEBAR */}
          <aside className="product-filter-sidebar">
            <FilterContent />
          </aside>

          <div className="product-results">

            {/* TOOLBAR */}
            <div className="results-toolbar">
              <div>
                <h2>
                  {currentCategory?.name || "All Ice Creams"}
                </h2>
                <p>
                  Showing {filteredProducts.length} products
                </p>
              </div>

              <div className="results-actions">
                <button
                  type="button"
                  className="mobile-filter-button"
                  onClick={() => setMobileFilterOpen(true)}
                >
                  ☷ Filter {activeFilterCount > 0 && `(${activeFilterCount})`}
                </button>

                <label className="sort-control">
                  <span>Sort By</span>
                  <select
                    value={sort}
                    onChange={e => setSort(e.target.value)}
                  >
                    <option value="default">Recommended</option>
                    <option value="low-high">Price: Low to High</option>
                    <option value="high-low">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                    <option value="name">Name: A to Z</option>
                  </select>
                </label>
              </div>
            </div>

            {/* ACTIVE FILTER CHIPS */}
            {(selectedCategory || selectedFlavour || selectedSize ||
              minPrice || maxPrice || inStockOnly) && (
              <div className="active-filter-list">
                {selectedCategory && (
                  <button onClick={() => setSelectedCategory("")}>
                    {normalizedCategories.find(c =>
                      c.slug === selectedCategory
                    )?.name || selectedCategory} ×
                  </button>
                )}
                {selectedFlavour && (
                  <button onClick={() => setSelectedFlavour("")}>
                    {selectedFlavour} ×
                  </button>
                )}
                {selectedSize && (
                  <button onClick={() => setSelectedSize("")}>
                    {selectedSize} ×
                  </button>
                )}
                {(minPrice || maxPrice) && (
                  <button onClick={() => {
                    setMinPrice("");
                    setMaxPrice("");
                  }}>
                    Price ×
                  </button>
                )}
                {inStockOnly && (
                  <button onClick={() => setInStockOnly(false)}>
                    In Stock ×
                  </button>
                )}
                <button className="clear-active" onClick={clearFilters}>
                  Clear All
                </button>
              </div>
            )}

            {/* PRODUCT GRID */}
            <div className="product-grid">
              {filteredProducts.map(product => {
                const productId = product.id || product.name;
                const weightOptions = getWeightOptions(product);

                const selectedWeight =
                  selections[productId]?.weight !== undefined
                    ? selections[productId].weight
                    : weightOptions[0];

                const quantity =
                  selections[productId]?.quantity || 1;

                const basePrice = getBasePrice(product, selectedWeight);
                const categoryName = getProductCategoryName(product);

                return (
                  <article className="product-card" key={productId}>
                    <div className="product-image-wrapper">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name || "KONFiZ ice cream"}
                          loading="lazy"
                        />
                      ) : (
                        <div className="product-image-placeholder">
                          🍨
                        </div>
                      )}

                      {categoryName && (
                        <span className="product-category">
                          {categoryName}
                        </span>
                      )}

                      {product.isNew && (
                        <span className="product-badge">New</span>
                      )}
                    </div>

                    <div className="product-info">
                      <div className="product-title-row">
                        <h3>{product.name}</h3>
                        {Number(product.rating) > 0 && (
                          <span className="product-rating">
                            ★ {Number(product.rating).toFixed(1)}
                          </span>
                        )}
                      </div>

                      <p className="product-description">
                        {product.description || "A delicious KONFiZ treat."}
                      </p>

                      <div className="product-selection">
                        <label>Select Size</label>
                        <select
                          value={selectedWeight ?? ""}
                          onChange={e => handleWeightChange(
                            productId, e.target.value
                          )}
                        >
                          {weightOptions.map((weight, index) => (
                            <option
                              key={`${productId}-${index}`}
                              value={weight ?? ""}
                            >
                              {weight === null
                                ? "Standard"
                                : `${weight} ${getUnit(product)}`}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="product-card-bottom">
                        <div className="product-price">
                          <span>Starting price</span>
                          <strong>₹{basePrice.toFixed(2)}</strong>
                        </div>

                        <div className="quantity-controls">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() => handleQuantityChange(
                              productId, quantity - 1
                            )}
                          >−</button>
                          <span>{quantity}</span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() => handleQuantityChange(
                              productId, quantity + 1
                            )}
                          >+</button>
                        </div>
                      </div>

                      <div className="product-total">
                        Total: <strong>
                          ₹{(basePrice * quantity).toFixed(2)}
                        </strong>
                      </div>

                      <button
                        type="button"
                        className="add-cart-btn"
                        disabled={!getStock(product)}
                        onClick={() => handleAddToCart(product)}
                      >
                        {!getStock(product)
                          ? "Out of Stock"
                          : "+ Add to Cart"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* EMPTY STATE */}
            {filteredProducts.length === 0 && (
              <div className="empty-products">
                <div>🍦</div>
                <h3>
                  {invalidCategory
                    ? "Category Not Found"
                    : "No Ice Creams Found"}
                </h3>
                <p>
                  Try changing your search or filters to discover more flavours.
                </p>
                <button type="button" onClick={clearFilters}>
                  Clear Filters
                </button>
                {invalidCategory && (
                  <Link to="/products">View All Products</Link>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* MOBILE FILTER DRAWER */}
      {mobileFilterOpen && (
        <div
          className="filter-drawer-overlay"
          onClick={() => setMobileFilterOpen(false)}
        >
          <div
            className="filter-drawer"
            onClick={e => e.stopPropagation()}
          >
            <div className="filter-drawer-header">
              <h2>Filter Products</h2>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
              >×</button>
            </div>

            <div className="filter-drawer-content">
              <FilterContent />
            </div>

            <div className="filter-drawer-footer">
              <button
                type="button"
                className="drawer-clear"
                onClick={clearFilters}
              >
                Clear All
              </button>
              <button
                type="button"
                className="drawer-apply"
                onClick={() => setMobileFilterOpen(false)}
              >
                Show {filteredProducts.length} Products
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD-ON POPUP */}
      {addonPopup.open && addonPopup.product && (
        <div className="addon-modal-overlay" onClick={closeAddonPopup}>
          <div
            className="addon-modal"
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              className="addon-modal-close"
              onClick={closeAddonPopup}
            >×</button>

            <h2>Make It Extra Special! 🍨</h2>
            <p>Choose your favourite toppings.</p>

            <div className="addon-modal-product">
              {addonPopup.product.image && (
                <img
                  src={addonPopup.product.image}
                  alt={addonPopup.product.name}
                />
              )}
              <div>
                <h3>{addonPopup.product.name}</h3>
                <p>
                  {addonPopup.weight != null
                    ? `${addonPopup.weight} ${getUnit(addonPopup.product)}`
                    : "Standard"}
                </p>
                <p>Quantity: {addonPopup.quantity}</p>
              </div>
            </div>

            <h3>Choose Your Add-ons</h3>

            <div className="addon-modal-list">
              {(addonPopup.product.addons || []).map((addon, index) => {
                const addonId = getAddonId(addon);

                return (
                  <label
                    key={`${addonId}-${index}`}
                    className="addon-modal-option"
                  >
                    <input
                      type="checkbox"
                      checked={addonPopup.addons.includes(addonId)}
                      onChange={e => {
                        setAddonPopup(previous => ({
                          ...previous,
                          addons: e.target.checked
                            ? [...previous.addons, addonId]
                            : previous.addons.filter(id => id !== addonId)
                        }));
                      }}
                    />
                    <span>{addon.name}</span>
                    <strong>+ ₹{Number(addon.price || 0).toFixed(2)}</strong>
                  </label>
                );
              })}
            </div>

            <div className="addon-modal-total">
              <span>Base price</span>
              <strong>₹{popupBasePrice.toFixed(2)}</strong>
              <span>Add-ons</span>
              <strong>₹{popupAddonPrice.toFixed(2)}</strong>
              <span>Quantity</span>
              <strong>{addonPopup.quantity}</strong>
              <span>Order Total</span>
              <strong>
                ₹{(popupUnitPrice * addonPopup.quantity).toFixed(2)}
              </strong>
            </div>

            <div className="addon-modal-actions">
              <button
                type="button"
                className="skip-addon-btn"
                onClick={() => completeAddToCart(
                  addonPopup.product,
                  addonPopup.weight,
                  addonPopup.quantity,
                  []
                )}
              >
                Skip Add-ons
              </button>
              <button
                type="button"
                className="confirm-addon-btn"
                onClick={() => completeAddToCart(
                  addonPopup.product,
                  addonPopup.weight,
                  addonPopup.quantity,
                  addonPopup.addons
                )}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CART SUMMARY */}
      <div className="cart-summary">
        <div>
          <p>Different Items: {cartCount}</p>
          <p>Total Quantity: {totalQuantity}</p>
          <strong>Cart Total: ₹{Number(subTotal || 0).toFixed(2)}</strong>
        </div>
        <Link to="/cart" className="view-cart-btn">
          View Cart ({totalQuantity})
        </Link>
      </div>

      {/* FOOTER */}
      <footer className="product-footer">
        <h2>KONFiZ</h2>
        <p>ICE CREAM & HAPPINESS</p>
        <p>© 2026 KONFiZ. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Product;
