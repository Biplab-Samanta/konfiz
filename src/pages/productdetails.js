import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

import Navbar from "../components/navber";
import { useAuth } from "../context/authContext";
import { useCart } from "../context/cartcontext";

import "../style/product-details.css";

// =====================================
// CONFIGURATION
// =====================================

const API_URL =
    process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// =====================================
// HELPERS
// =====================================

// Always prefer MongoDB _id, then support older IDs.
const getId = (p) =>
    String(p?._id ?? p?.id ?? p?.sku ?? p?.productId ?? p?.name ?? "");

const slug = (value = "") =>
    String(value).toLowerCase().trim()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

const categoryName = (p) => {
    const c = p?.category;

    return typeof c === "string"
        ? c
        : c?.name || c?.categoryName || c?.title ||
        p?.categoryName || "";
};

const subcategoryName = (p) => {
    const s = p?.subcategory;

    return typeof s === "string"
        ? s
        : s?.name || s?.subcategoryName ||
        p?.subcategoryName || "";
};

const unit = (p) =>
    p?.weightUnit ||
    p?.pricing?.unit ||
    p?.sizes?.[0]?.unit ||
    p?.baseUnit ||
    p?.unit ||
    "ml";

const weights = (p) => {
    if (Array.isArray(p?.sizes) && p.sizes.length) {
        return p.sizes.map(size =>
            Number(typeof size === "object" ? size.weight : size)
        );
    }

    const list = p?.weightOptions || p?.pricing?.weightOptions;

    return Array.isArray(list) && list.length
        ? list.map(item =>
            Number(typeof item === "object" ? item.weight : item)
        )
        : [null];
};

const getSelectedSize = (p, weight) => {
    if (!Array.isArray(p?.sizes)) return null;

    return p.sizes.find(
        size => Number(size.weight) === Number(weight)
    ) || null;
};

const basePrice = (p, weight) => {
    const selectedSize = getSelectedSize(p, weight);

    if (selectedSize) {
        const offerPrice = Number(selectedSize.offerPrice);

        return offerPrice > 0
            ? offerPrice
            : Number(selectedSize.price) || 0;
    }

    const pricing = p?.pricing;

    if (
        pricing &&
        weight !== null &&
        weight !== undefined &&
        Number(pricing.baseQuantity) > 0
    ) {
        return (
            Number(pricing.pricePerBaseUnit ?? p.price ?? 0) *
            Number(weight) /
            Number(pricing.baseQuantity)
        );
    }

    return Number(p?.price) || 0;
};

const getRegularPrice = (p, weight) => {
    const selectedSize = getSelectedSize(p, weight);

    if (selectedSize) {
        return Number(selectedSize.price) || 0;
    }

    return Number(
        p?.originalPrice ??
        p?.mrp ??
        p?.compareAtPrice ??
        p?.price ??
        0
    );
};

const addonId = (a) =>
    String(a?._id ?? a?.id ?? a?.name ?? "");

const stockAvailable = (p) => {
    if (p?.inStock !== undefined) return Boolean(p.inStock);
    if (p?.available !== undefined) return Boolean(p.available);
    if (p?.stock !== undefined) return Number(p.stock) > 0;
    if (p?.quantity !== undefined) return Number(p.quantity) > 0;
    return true;
};

const parseStorage = (value, fallback = []) => {
    try {
        return JSON.parse(value || JSON.stringify(fallback));
    } catch {
        return fallback;
    }
};

const productImages = (p) => {
    const sources = [
        ...(Array.isArray(p?.images) ? p.images : []),
        p?.image,
        p?.imageUrl
    ];

    return [...new Set(
        sources.map(item =>
            typeof item === "string"
                ? item
                : item?.url || item?.image || ""
        ).filter(Boolean)
    )];
};

const formatPrice = (price) =>
    Number(price || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

// Supports several common API response formats.
const extractProducts = (responseData) => {
    if (Array.isArray(responseData)) return responseData;
    if (Array.isArray(responseData?.products)) return responseData.products;
    if (Array.isArray(responseData?.data)) return responseData.data;
    if (Array.isArray(responseData?.data?.products)) {
        return responseData.data.products;
    }

    return [];
};

// =====================================
// COMPONENT
// =====================================

function ProductDetails() {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const {
        addToCart,
        cartCount,
        totalQuantity
    } = useCart();

    const customerId =
        user?.customerId || user?.id || user?._id;

    // =====================================
    // PRODUCT DATA
    // =====================================

    const [products, setProducts] = useState([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const loadProducts = async () => {
            try {
                const response = await fetch(`${API_URL}/products`);

                if (!response.ok) {
                    throw new Error(`Products API error: ${response.status}`);
                }

                const result = await response.json();
                const apiProducts = extractProducts(result);

                if (!cancelled) {
                    // A successful API response is the source of truth,
                    // including when the returned array is empty.
                    setProducts(apiProducts);
                    setLoaded(true);
                }
            } catch (error) {
                console.warn(
                    "Could not load products from API. Trying local backup.",
                    error
                );

                const saved = parseStorage(
                    localStorage.getItem("konfizProducts"),
                    []
                );

                const localProducts = Array.isArray(saved)
                    ? saved
                    : Array.isArray(saved?.products)
                        ? saved.products
                        : [];

                if (!cancelled) {
                    setProducts(localProducts);
                    setLoaded(true);
                }
            }
        };

        const reloadProducts = () => {
            loadProducts();
        };

        loadProducts();

        window.addEventListener("focus", reloadProducts);
        window.addEventListener("konfizStoreUpdated", reloadProducts);
        window.addEventListener("storage", reloadProducts);

        return () => {
            cancelled = true;
            window.removeEventListener("focus", reloadProducts);
            window.removeEventListener("konfizStoreUpdated", reloadProducts);
            window.removeEventListener("storage", reloadProducts);
        };
    }, []);

    // =====================================
    // FIND PRODUCT BY MONGODB OR OLD ID
    // =====================================

    const product = useMemo(() => {
        const requestedId = String(productId || "");

        return products.find((p) => {
            const possibleIds = [
                p?._id,
                p?.id,
                p?.sku,
                p?.productId
            ];

            return possibleIds.some(
                id =>
                    id !== undefined &&
                    id !== null &&
                    String(id) === requestedId
            );
        }) || null;
    }, [products, productId]);

    // =====================================
    // IMAGE GALLERY
    // =====================================

    const images = useMemo(
        () => productImages(product || {}),
        [product]
    );

    const [activeImage, setActiveImage] = useState(0);
    const [showFullDescription, setShowFullDescription] = useState(false);

    useEffect(() => {
        setActiveImage(0);
        setShowFullDescription(false);
    }, [productId]);

    // =====================================
    // CUSTOMIZATION
    // =====================================

    const [selectedWeight, setSelectedWeight] = useState(null);
    const [selectedAddons, setSelectedAddons] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [showAddonPopup, setShowAddonPopup] = useState(false);

    const weightOptions = useMemo(
        () => product ? weights(product) : [null],
        [product]
    );

    useEffect(() => {
        if (!product) return;

        setSelectedWeight(weightOptions[0]);
        setSelectedAddons([]);
        setQuantity(1);
        setShowAddonPopup(false);
    }, [productId, product, weightOptions]);

    const addons = Array.isArray(product?.addons)
        ? product.addons
        : [];

    const toggleAddon = (addon) => {
        const id = addonId(addon);

        setSelectedAddons(previous =>
            previous.includes(id)
                ? previous.filter(item => item !== id)
                : [...previous, id]
        );
    };

    const currentBasePrice = product
        ? basePrice(product, selectedWeight)
        : 0;

    const currentAddonPrice = addons
        .filter(a => selectedAddons.includes(addonId(a)))
        .reduce((sum, a) => sum + (Number(a.price) || 0), 0);

    const unitPrice = currentBasePrice + currentAddonPrice;
    const totalPrice = unitPrice * quantity;

    // =====================================
    // DISCOUNT
    // =====================================

    const regularPrice = product
        ? getRegularPrice(product, selectedWeight)
        : 0;

    const discount = regularPrice > unitPrice && regularPrice > 0
        ? Math.round(
            ((regularPrice - unitPrice) / regularPrice) * 100
        )
        : 0;

    // =====================================
    // WISHLIST
    // =====================================

    const [wishlist, setWishlist] = useState([]);

    const wishlistKey = customerId
        ? `konfiz_wishlist_${customerId}`
        : "";

    useEffect(() => {
        if (!wishlistKey) {
            setWishlist([]);
            return;
        }

        const loadWishlist = () => {
            setWishlist(
                parseStorage(
                    localStorage.getItem(wishlistKey),
                    []
                )
            );
        };

        loadWishlist();

        window.addEventListener("storage", loadWishlist);
        window.addEventListener("konfiz-wishlist-updated", loadWishlist);

        return () => {
            window.removeEventListener("storage", loadWishlist);
            window.removeEventListener(
                "konfiz-wishlist-updated",
                loadWishlist
            );
        };
    }, [wishlistKey]);

    const inWishlist = product
        ? wishlist.some(item =>
            String(item.id) === getId(product) ||
            String(item.productId) === getId(product)
        )
        : false;

    const toggleWishlist = () => {
        if (!customerId) {
            navigate("/login");
            return;
        }

        if (!product) return;

        const id = getId(product);

        const updated = inWishlist
            ? wishlist.filter(item =>
                String(item.id) !== id &&
                String(item.productId) !== id
            )
            : [
                ...wishlist,
                {
                    id,
                    productId: id,
                    name: product.name,
                    image: product.image || product.imageUrl || "",
                    category: categoryName(product),
                    subcategory: subcategoryName(product),
                    price: currentBasePrice,
                    addedAt: new Date().toISOString()
                }
            ];

        localStorage.setItem(wishlistKey, JSON.stringify(updated));
        setWishlist(updated);

        window.dispatchEvent(
            new Event("konfiz-wishlist-updated")
        );
    };

    // =====================================
    // CART
    // =====================================

    const handleCart = (
        buyNow = false,
        addonsToAdd = selectedAddons
    ) => {
        if (!product || !stockAvailable(product)) return;

        const selectedAddonObjects = addons
            .filter(a => addonsToAdd.includes(addonId(a)))
            .map(a => ({
                id: addonId(a),
                name: a.name,
                price: Number(a.price) || 0
            }));

        const addonTotal = selectedAddonObjects.reduce(
            (sum, addon) => sum + addon.price,
            0
        );

        const finalUnitPrice = currentBasePrice + addonTotal;
        const id = getId(product);

        const cartItemId = [
            id,
            selectedWeight ?? "standard",
            selectedAddonObjects
                .map(a => a.id)
                .sort()
                .join("-")
        ].join("__");

        addToCart({
            id: cartItemId,
            cartItemId,
            productId: id,
            name: product.name,
            image: product.image || product.imageUrl || null,
            category: categoryName(product),
            subcategory: subcategoryName(product),
            weight: selectedWeight,
            unit: unit(product),
            addons: selectedAddonObjects,
            basePrice: currentBasePrice,
            addonPrice: addonTotal,
            price: finalUnitPrice,
            quantity
        });

        setShowAddonPopup(false);

        if (buyNow) {
            navigate("/cart");
        }
    };

    // =====================================
    // SIMILAR PRODUCTS
    // =====================================

    const similarProducts = useMemo(() => {
        if (!product) return [];

        const currentId = getId(product);
        const currentCategory = slug(categoryName(product));
        const currentSubcategory = slug(subcategoryName(product));

        const remaining = products.filter(
            p => getId(p) !== currentId
        );

        const sameSubcategory = remaining.filter(
            p =>
                currentSubcategory &&
                slug(subcategoryName(p)) === currentSubcategory
        );

        const sameCategory = remaining.filter(
            p =>
                currentCategory &&
                slug(categoryName(p)) === currentCategory &&
                !sameSubcategory.some(
                    item => getId(item) === getId(p)
                )
        );

        const otherProducts = remaining.filter(
            p =>
                !sameSubcategory.some(item => getId(item) === getId(p)) &&
                !sameCategory.some(item => getId(item) === getId(p))
        );

        return [
            ...sameSubcategory,
            ...sameCategory,
            ...otherProducts
        ].slice(0, 8);
    }, [products, product]);

    // =====================================
    // LOADING AND NOT FOUND
    // All hooks are above these conditions.
    // =====================================

    if (!loaded) {
        return (
            <>
                <Navbar />
                <div className="pd-loading">
                    Preparing your happiness...
                </div>
            </>
        );
    }

    if (!product) {
        return (
            <>
                <Navbar />
                <div className="pd-not-found">
                    <span>🍨</span>
                    <h2>Product Not Found</h2>
                    <p>
                        This ice cream may have been removed or its
                        product link may be outdated.
                    </p>
                    <Link to="/products">Explore Products</Link>
                </div>
            </>
        );
    }

    const inStock = stockAvailable(product);

    // =====================================
    // MAIN UI
    // =====================================

    return (
        <div className="pd-page">

            <Navbar />

            <div className="pd-container container">

                {/* BREADCRUMB */}

                <div className="pd-breadcrumb">
                    <Link to="/">Home</Link>
                    <span>/</span>
                    <Link to="/products">Products</Link>
                    <span>/</span>
                    <span>{product.name}</span>
                </div>

                {/* MAIN PRODUCT AREA */}

                <section className="pd-main">

                    {/* IMAGE GALLERY */}

                    <div className="pd-gallery">

                        <div className="pd-image-panel">

                            <div className="pd-gallery-topline">
                                <span>
                                    {String(activeImage + 1).padStart(2, "0")}
                                    {" / "}
                                    {String(images.length).padStart(2, "0")}
                                </span>
                            </div>

                            <button
                                type="button"
                                className={`pd-wishlist ${inWishlist ? "active" : ""}`}
                                onClick={toggleWishlist}
                                aria-label="Toggle wishlist"
                            >
                                {inWishlist ? "♥" : "♡"}
                            </button>

                            {discount > 0 && (
                                <span className="pd-discount-badge">
                                    {discount}% OFF
                                </span>
                            )}

                            <div className="pd-main-image">
                                {images.length > 0 ? (
                                    <img
                                        src={images[activeImage]}
                                        alt={product.name}
                                    />
                                ) : (
                                    <div className="pd-no-image">
                                        Product Image
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* THUMBNAILS */}

                        {images.length > 1 && (
                            <div className="pd-image-thumbnails">
                                {images.map((image, index) => (
                                    <button
                                        type="button"
                                        key={`${image}-${index}`}
                                        className={
                                            activeImage === index ? "active" : ""
                                        }
                                        onClick={() => setActiveImage(index)}
                                        aria-label={`View product image ${index + 1}`}
                                    >
                                        <img
                                            src={image}
                                            alt={`${product.name} view ${index + 1}`}
                                        />
                                    </button>
                                ))}
                            </div>
                        )}

                    </div>

                    {/* PRODUCT INFORMATION */}

                    <div className="pd-information">

                        <div className="pd-brand-line">
                            <span className={inStock ? "in-stock" : "out-stock"}>
                                ● {inStock ? "Available" : "Out of Stock"}
                            </span>
                        </div>

                        <h1>{product.name}</h1>

                        <div className="pd-description-wrapper">
                            <p
                                className={`pd-long-description ${
                                    showFullDescription ? "expanded" : ""
                                }`}
                            >
                                {product.description ||
                                    "Enjoy the delightful taste of this KONFiZ creation."}
                            </p>

                            {product.description?.length > 150 && (
                                <button
                                    type="button"
                                    className="pd-see-more-btn"
                                    onClick={() =>
                                        setShowFullDescription(previous => !previous)
                                    }
                                >
                                    {showFullDescription ? "See Less" : "See More"}
                                </button>
                            )}
                        </div>

                        {/* RATING AND FLAVOUR */}

                        <div className="pd-rating-row">
                            <span className="pd-rating">
                                ★ {Number(product.rating || 0).toFixed(1)}
                            </span>

                            <span className="pd-flavourChoco Mint Delight Ice Cream">
                                {product.flavour ||
                                    product.flavor ||
                                    "Freshly made with love"}
                            </span>
                        </div>

                        <div className="pd-divider"></div>

                        {/* WEIGHT SELECTION */}

                        <div className="pd-selection-section-wrap">

                            <div className="pd-selection-section">

                                <h3>Choose Your Pack Size</h3>

                                <div className="pd-weight-options">
                                    {weightOptions.map((weight, index) => (
                                        <button
                                            type="button"
                                            key={`${weight}-${index}`}
                                            className={
                                                String(selectedWeight) === String(weight)
                                                    ? "active"
                                                    : ""
                                            }
                                            onClick={() => setSelectedWeight(weight)}
                                        >
                                            <strong>
                                                {weight === null
                                                    ? "Standard"
                                                    : `${weight} ${unit(product)}`}
                                            </strong>

                                            <span>
                                                ₹{formatPrice(
                                                    basePrice(product, weight)
                                                )}
                                            </span>
                                        </button>
                                    ))}
                                </div>

                            </div>

                        </div>

                        <div className="pd-divider"></div>

                        {/* PRICE */}

                        <div className="pd-rating-price-wrap">

                            <div className="pd-price-section">

                                <div className="pd-current-price">
                                    ₹{formatPrice(unitPrice)}
                                </div>

                                {regularPrice > unitPrice && (
                                    <>
                                        <del>₹{formatPrice(regularPrice)}</del>
                                        <span className="pd-save">
                                            {discount}% OFF
                                        </span>
                                    </>
                                )}

                                <p>
                                    Price per selected unit, excluding any
                                    separately applicable charges.
                                </p>

                            </div>

                            {/* QUANTITY */}

                            <div className="wrap">
                                <div className="pd-quantity-row">
                                    <strong>Quantity</strong>

                                    <div className="pd-quantity-control">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setQuantity(q => Math.max(1, q - 1))
                                            }
                                        >
                                            −
                                        </button>

                                        <span>{quantity}</span>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setQuantity(q => q + 1)
                                            }
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* TOTAL AND ACTIONS */}

                        <div className="total-action-wrap">

                            <div className="pd-total-box">

                                <div>
                                    <span>Base price</span>
                                    <strong>
                                        ₹{formatPrice(currentBasePrice)}
                                    </strong>
                                </div>

                                <div>
                                    <span>Add-ons</span>
                                    <strong>
                                        ₹{formatPrice(currentAddonPrice)}
                                    </strong>
                                </div>

                                <div>
                                    <span>Quantity</span>
                                    <strong>{quantity}</strong>
                                </div>

                                <div className="pd-grand-total">
                                    <span>Total Amount</span>
                                    <strong>
                                        ₹{formatPrice(totalPrice)}
                                    </strong>
                                </div>

                            </div>

                            <div className="pd-action-buttons">

                                <button
                                    type="button"
                                    className="pd-add-cart"
                                    disabled={!inStock}
                                    onClick={() => handleCart(false)}
                                >
                                    <span>🛒</span> Add to Cart
                                </button>

                                <button
                                    type="button"
                                    className="pd-buy-now"
                                    disabled={!inStock}
                                    onClick={() => {
                                        setSelectedAddons([]);
                                        setShowAddonPopup(true);
                                    }}
                                >
                                    Buy Now
                                </button>

                            </div>

                        </div>

                    </div>

                </section>

                {/* SIMILAR PRODUCTS */}

                <section className="pd-similar-section">

                    <div className="pd-similar-heading">
                        <div>
                            <span>MORE TO EXPLORE</span>
                            <h2>Our other products</h2>
                            <p>
                                Discover more delicious KONFiZ flavours.
                            </p>
                        </div>

                        <Link to="/products">
                            View All Products →
                        </Link>
                    </div>

                    {similarProducts.length > 0 ? (

                        <div className="pd-similar-grid">

                            {similarProducts.map(item => {
                                const itemId = getId(item);
                                const itemPrice = basePrice(
                                    item,
                                    weights(item)[0]
                                );

                                return (
                                    <article
                                        className="pd-product-card"
                                        key={itemId}
                                    >

                                        <Link
                                            to={`/products/details/${encodeURIComponent(itemId)}`}
                                            className="pd-card-image"
                                        >
                                            {item.image || item.imageUrl ? (
                                                <img
                                                    src={item.image || item.imageUrl}
                                                    alt={item.name}
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="pd-card-placeholder">
                                                    🍨
                                                </div>
                                            )}

                                            {item.isNew && (
                                                <span className="pd-card-new">
                                                    NEW
                                                </span>
                                            )}
                                        </Link>

                                        <div className="pd-card-content">

                                            <Link
                                                to={`/products/details/${encodeURIComponent(itemId)}`}
                                                className="pd-card-name"
                                            >
                                                {item.name}
                                            </Link>

                                            <div className="pd-card-tags">
                                                <span>
                                                    {categoryName(item) || "Ice Cream"}
                                                </span>

                                                {item.flavour && (
                                                    <span>{item.flavour}</span>
                                                )}

                                                {item.isNew && (
                                                    <span>New Arrival</span>
                                                )}
                                            </div>

                                            <p className="pd-card-description">
                                                {item.description ||
                                                    item.flavour ||
                                                    "A delicious treat crafted for your happiness."}
                                            </p>

                                            {Array.isArray(item.addons) &&
                                                item.addons.length > 0 && (
                                                    <div className="pd-card-toppings">
                                                        <span className="pd-card-topping-label">
                                                            Toppings
                                                        </span>

                                                        {item.addons.slice(0, 3).map(
                                                            (addon, index) => (
                                                                <span
                                                                    className="pd-card-topping"
                                                                    key={
                                                                        addon._id ||
                                                                        addon.id ||
                                                                        index
                                                                    }
                                                                >
                                                                    {addon.name}
                                                                </span>
                                                            )
                                                        )}
                                                    </div>
                                                )}

                                            <div className="pd-card-bottom">

                                                <div className="pd-card-price-wrap">
                                                    <span className="pd-card-price">
                                                        ₹{formatPrice(itemPrice)}
                                                    </span>

                                                    <span className="pd-card-price-label">
                                                        Starting price
                                                    </span>
                                                </div>

                                                <Link
                                                    to={`/products/details/${encodeURIComponent(itemId)}`}
                                                    className="pd-card-button"
                                                    aria-label={`View ${item.name}`}
                                                >
                                                    <span>View Details</span>
                                                    <span className="pd-card-arrow">
                                                        ↗
                                                    </span>
                                                </Link>

                                            </div>

                                        </div>

                                    </article>
                                );
                            })}

                        </div>

                    ) : (
                        <div className="pd-no-similar">
                            <p>
                                Add more products from your Admin Dashboard
                                to discover similar flavours.
                            </p>
                        </div>
                    )}

                </section>

                {/* PRODUCT HIGHLIGHTS */}

                <section className="pd-highlights">

                    <div className="pd-section-title">
                        <span>WHY YOU WILL LOVE IT</span>
                        <h2>Product Highlights</h2>
                    </div>

                    <div className="pd-highlight-grid">

                        <div className="pd-highlight-card">
                            <span className="pd-highlight-number">01</span>
                            <div className="pd-highlight-content">
                                <span className="pd-highlight-label">
                                    THE TASTE
                                </span>
                                <h3>Delicious Flavour</h3>
                                <p>
                                    {product.flavour ||
                                        product.flavor ||
                                        "Made for ice cream lovers"}
                                </p>
                            </div>
                            <span className="pd-highlight-line"></span>
                        </div>

                        <div className="pd-highlight-card">
                            <span className="pd-highlight-number">02</span>
                            <div className="pd-highlight-content">
                                <span className="pd-highlight-label">
                                    YOUR CHOICE
                                </span>
                                <h3>Flexible Sizes</h3>
                                <p>
                                    Choose the perfect pack size for every craving.
                                </p>
                            </div>
                            <span className="pd-highlight-line"></span>
                        </div>

                        <div className="pd-highlight-card">
                            <span className="pd-highlight-number">03</span>
                            <div className="pd-highlight-content">
                                <span className="pd-highlight-label">
                                    MAKE IT YOURS
                                </span>
                                <h3>Customize Your Treat</h3>
                                <p>
                                    Add your favourite toppings and make it special.
                                </p>
                            </div>
                            <span className="pd-highlight-line"></span>
                        </div>

                        <div className="pd-highlight-card">
                            <span className="pd-highlight-number">04</span>
                            <div className="pd-highlight-content">
                                <span className="pd-highlight-label">
                                    THE KONFiZ WAY
                                </span>
                                <h3>Made for Happiness</h3>
                                <p>
                                    A little indulgence and a lot of happiness
                                    in every scoop.
                                </p>
                            </div>
                            <span className="pd-highlight-line"></span>
                        </div>

                    </div>

                </section>

            </div>

            {/* BUY NOW ADD-ON POPUP */}

            {showAddonPopup && (
                <div
                    className="pd-addon-overlay"
                    onClick={() => setShowAddonPopup(false)}
                >
                    <div
                        className="pd-addon-modal"
                        onClick={e => e.stopPropagation()}
                    >

                        <div className="pd-addon-header">
                            <div>
                                <span>MAKE IT SPECIAL</span>
                                <h2>Customize Your Ice Cream</h2>
                                <p>Choose your favourite toppings</p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowAddonPopup(false)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="pd-addon-product">

                            <div className="pd-addon-product-image">
                                {images.length > 0 && (
                                    <img
                                        src={images[0]}
                                        alt={product.name}
                                    />
                                )}
                            </div>

                            <div>
                                <h3>{product.name}</h3>
                                <p>
                                    {selectedWeight
                                        ? `${selectedWeight} ${unit(product)}`
                                        : "Standard"}
                                </p>
                                <strong>
                                    ₹{formatPrice(currentBasePrice)}
                                </strong>
                            </div>

                        </div>

                        <div className="pd-addon-content">

                            <h3>Available Add-ons</h3>

                            {addons.length > 0 ? (

                                <div className="pd-addon-list">

                                    {addons.map((addon, index) => {
                                        const id = addonId(addon);
                                        const checked =
                                            selectedAddons.includes(id);

                                        return (
                                            <label
                                                key={`${id}-${index}`}
                                                className={`pd-addon-option ${
                                                    checked ? "selected" : ""
                                                }`}
                                            >

                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={() =>
                                                        toggleAddon(addon)
                                                    }
                                                />

                                                <span className="pd-addon-check">
                                                    {checked ? "✓" : "+"}
                                                </span>

                                                <span className="pd-addon-name">
                                                    {addon.name}
                                                </span>

                                                <strong>
                                                    + ₹{formatPrice(addon.price)}
                                                </strong>

                                            </label>
                                        );
                                    })}

                                </div>

                            ) : (
                                <div className="pd-addon-empty">
                                    <span>🍨</span>
                                    <p>No additional toppings available.</p>
                                </div>
                            )}

                        </div>

                        <div className="pd-addon-summary">

                            <div>
                                <span>Base Price</span>
                                <strong>
                                    ₹{formatPrice(currentBasePrice)}
                                </strong>
                            </div>

                            <div>
                                <span>Selected Add-ons</span>
                                <strong>
                                    ₹{formatPrice(currentAddonPrice)}
                                </strong>
                            </div>

                            <div className="pd-addon-total">
                                <span>Total per item</span>
                                <strong>
                                    ₹{formatPrice(
                                        currentBasePrice + currentAddonPrice
                                    )}
                                </strong>
                            </div>

                        </div>

                        <div className="pd-addon-footer">

                            <button
                                type="button"
                                className="pd-addon-skip"
                                onClick={() => handleCart(true, [])}
                            >
                                Skip Add-ons
                            </button>

                            <button
                                type="button"
                                className="pd-addon-confirm"
                                onClick={() =>
                                    handleCart(true, selectedAddons)
                                }
                            >
                                Continue · ₹{formatPrice(
                                    (currentBasePrice + currentAddonPrice) *
                                    quantity
                                )}
                            </button>

                        </div>

                    </div>
                </div>
            )}

            {/* STICKY CART BAR */}

            <div className="pd-sticky-cart">
                <div>
                    <span>{cartCount} Different Products</span>
                    <strong>{totalQuantity} Items in Cart</strong>
                </div>

                <Link to="/cart">
                    View Cart ({totalQuantity}) →
                </Link>
            </div>

            {/* FOOTER */}

            <footer className="pd-footer">
                <h2>KONFiZ</h2>
                <p>ICE CREAM & HAPPINESS</p>
                <span>© 2026 KONFiZ. All rights reserved.</span>
            </footer>

        </div>
    );
}

export default ProductDetails;