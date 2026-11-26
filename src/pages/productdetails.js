
import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";


import Navbar from "../components/navber";
import { useAuth } from "../context/authContext";
import { useCart } from "../context/cartcontext";

import "../style/product-details.css";

// =====================================
// HELPERS
// =====================================

const getId = (p) =>
    String(p?.id ?? p?._id ?? p?.name ?? "");

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

    // Latest AddProduct structure
    if (Array.isArray(p?.sizes) && p.sizes.length) {
        return p.sizes.map(size => Number(size.weight));
    }

    // Older product structure
    const list =
        p?.weightOptions ||
        p?.pricing?.weightOptions;

    return Array.isArray(list) && list.length
        ? list
        : [null];
};

// Find the saved size object matching the selected weight
const getSelectedSize = (p, weight) => {

    if (!Array.isArray(p?.sizes)) return null;

    return p.sizes.find(
        size => Number(size.weight) === Number(weight)
    ) || null;
};

// Actual selling price for the selected size
const basePrice = (p, weight) => {

    const selectedSize = getSelectedSize(p, weight);

    if (selectedSize) {

        const offerPrice = Number(selectedSize.offerPrice);

        if (offerPrice > 0) {
            return offerPrice;
        }

        return Number(selectedSize.price) || 0;
    }

    // Older pricing structure
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

// Regular price for discount calculation
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
    String(a?.id ?? a?._id ?? a?.name ?? "");

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

// =====================================
// COMPONENT
// =====================================

function ProductDetails() {
    const [showFullDescription, setShowFullDescription] = useState(false);
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
    // PRODUCT STORAGE
    // =====================================

    const [products, setProducts] = useState([]);
    const [loaded, setLoaded] = useState(false);

    const loadProducts = () => {
        const saved = parseStorage(
            localStorage.getItem("konfizProducts"),
            []
        );

        setProducts(
            Array.isArray(saved)
                ? saved
                : Array.isArray(saved?.products)
                    ? saved.products
                    : []
        );

        setLoaded(true);
    };

    useEffect(() => {
        loadProducts();

        window.addEventListener("storage", loadProducts);
        window.addEventListener("focus", loadProducts);

        window.addEventListener(
            "konfizStoreUpdated",
            loadProducts
        );

        return () => {
            window.removeEventListener("storage", loadProducts);
            window.removeEventListener("focus", loadProducts);

            window.removeEventListener(
                "konfizStoreUpdated",
                loadProducts
            );
        };
    }, []);

    const product = useMemo(
        () => products.find(p => getId(p) === String(productId)),
        [products, productId]
    );

    // =====================================
    // IMAGE GALLERY
    // =====================================

    const images = useMemo(
        () => productImages(product || {}),
        [product]
    );

    const [activeImage, setActiveImage] = useState(0);

    useEffect(() => {
        setActiveImage(0);
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
    }, [productId, product, weightOptions]);

    const addons = product?.addons || [];
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

    const discount = regularPrice > unitPrice
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

        const load = () => {
            setWishlist(
                parseStorage(
                    localStorage.getItem(wishlistKey),
                    []
                )
            );
        };

        load();

        window.addEventListener("storage", load);
        window.addEventListener("konfiz-wishlist-updated", load);

        return () => {
            window.removeEventListener("storage", load);
            window.removeEventListener("konfiz-wishlist-updated", load);
        };
    }, [wishlistKey]);

    const inWishlist = product
        ? wishlist.some(item =>
            String(item.id) === getId(product)
        )
        : false;

    const toggleWishlist = () => {
        if (!customerId) {
            navigate("/login");
            return;
        }

        const id = getId(product);

        const updated = inWishlist
            ? wishlist.filter(item => String(item.id) !== id)
            : [
                ...wishlist,
                {
                    id,
                    name: product.name,
                    image: product.image || "",
                    category: categoryName(product),
                    subcategory: subcategoryName(product),
                    price: currentBasePrice,
                    addedAt: new Date().toISOString()
                }
            ];

        localStorage.setItem(
            wishlistKey,
            JSON.stringify(updated)
        );

        setWishlist(updated);

        window.dispatchEvent(
            new Event("konfiz-wishlist-updated")
        );
    };

    // =====================================
    // CART
    // =====================================

    const handleCart = (buyNow = false, addonsToAdd = selectedAddons) => {
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
            image: product.image || null,
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
    // delivery pin 
    // =====
    // const [pinCode, setPinCode] = useState("");
    // const [deliveryMessage, setDeliveryMessage] = useState("");
    // const [deliveryDate, setDeliveryDate] = useState("");

    // const checkDelivery = () => {
    //     if (pinCode.length !== 6) {
    //         setDeliveryMessage("Please enter a valid 6-digit PIN code.");
    //         setDeliveryDate("");
    //         return;
    //     }

    //     // Approximate delivery estimation
    //     const firstDigit = Number(pinCode.charAt(0));

    //     let deliveryDays;

    //     if ([7, 8].includes(firstDigit)) {
    //         deliveryDays = 3;
    //     } else if ([1, 2, 3, 4, 5, 6].includes(firstDigit)) {
    //         deliveryDays = 4;
    //     } else {
    //         deliveryDays = 5;
    //     }

    //     // Calculate estimated delivery date
    //     const estimatedDate = new Date();
    //     estimatedDate.setDate(estimatedDate.getDate() + deliveryDays);

    //     const formattedDate = estimatedDate.toLocaleDateString("en-IN", {
    //         weekday: "short",
    //         day: "numeric",
    //         month: "short"
    //     });

    //     setDeliveryDate(formattedDate);

    //     setDeliveryMessage(
    //         `Great news! Delivery is available to ${pinCode}.`
    //     );
    // };
    // =====================================
    // SIMILAR PRODUCTS - MINIMUM 8 TARGET
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
    // DETAILS / SPECIFICATIONS
    // =====================================

    // const specifications = product
    //     ? [
    //         ["Product Name", product.name],
    //         ["Product ID", getId(product)],
    //         ["Category", categoryName(product)],
    //         ["Subcategory", subcategoryName(product)],
    //         ["Flavour", product.flavour || product.flavor || product.taste],
    //         ["Unit", unit(product)],
    //         ["SKU", product.sku || product.SKU],
    //         ["Brand", product.brand || "KONFiZ"],
    //         ["Stock Status", stockAvailable(product) ? "Available" : "Out of Stock"],
    //         ["Shelf Life", product.shelfLife],
    //         ["Storage Instructions", product.storageInstructions || product.storage],
    //         ["Manufacturer", product.manufacturer]
    //     ].filter(([, value]) =>
    //         value !== undefined && value !== null && value !== ""
    //     )
    //     : [];

    // =====================================
    // LOADING
    // =====================================

    if (!loaded) {
        return (
            <div className="pd-loading">
                Preparing your happiness...
            </div>
        );
    }

    if (!product) {
        return (
            <>
                <Navbar />
                <div className="pd-not-found">
                    <span>🍨</span>
                    <h2>Product Not Found</h2>
                    <p>This ice cream may have been removed.</p>
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

                    {/* LEFT IMAGE AREA */}


                    {/* LEFT PRODUCT SHOWCASE */}

                    <div className="pd-gallery">

                        <div className="pd-image-panel">

                            <div className="pd-gallery-topline">
                                <span>
                                    {String(activeImage + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
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

                        {/* THUMBNAIL GALLERY */}

                        {images.length > 1 && (
                            <div className="pd-image-thumbnails">
                                {images.map((image, index) => (
                                    <button
                                        type="button"
                                        key={index}
                                        className={activeImage === index ? "active" : ""}
                                        onClick={() => setActiveImage(index)}
                                        aria-label={`View product image ${index + 1}`}
                                    >
                                        <img src={image} alt={`${product.name} view ${index + 1}`} />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* EDITORIAL PRODUCT INTRODUCTION */}



                    </div>

                    {/* RIGHT PRODUCT DATA */}

                    <div className="pd-information">

                        <div className="pd-brand-line">
                            <span className={inStock ? "in-stock" : "out-stock"}>
                                ● {inStock ? "Available" : "Out of Stock"}
                            </span>
                        </div>

                        <h1>{product.name}</h1>



                        <div className="pd-description-wrapper">
                            <p className={`pd-long-description ${showFullDescription ? "expanded" : ""}`}>
                                {product.description ||
                                    "Enjoy the delightful taste of this KONFiZ creation."}
                            </p>

                            {product.description?.length > 150 && (
                                <button
                                    type="button"
                                    className="pd-see-more-btn"
                                    onClick={() => setShowFullDescription(!showFullDescription)}
                                >
                                    {showFullDescription ? "See Less" : "See More"}
                                </button>
                            )}

                        </div>
                        {/* rating  */}
                        <div className="pd-rating-row">
                            <span className="pd-rating">
                                ★ {Number(product.rating || 0).toFixed(1)}
                            </span>
                            <span className="pd-flavourChoco Mint Delight Ice Cream">

                                {product.flavour || product.flavor || "Freshly made with love"}
                            </span>
                        </div>
                        <div className="pd-divider"></div>
                        {/* WEIGHT */}
                        <div className="pd-selection-section-wrap">

                            <div className="pd-selection-section">

                                <h3>Choose Your Pack Size</h3>

                                <div className="pd-weight-options">
                                    {weightOptions.map((weight, index) => (
                                        <button
                                            type="button"
                                            key={index}
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

                            {/* ADDONS */}

                            {/* {addons.length > 0 && (
                                <div className="pd-selection-section">

                                    <h3>Customize Your Ice Cream</h3>

                                    <div className="pd-addon-grid">
                                        {addons.map((addon, index) => {
                                            const id = addonId(addon);

                                            return (
                                                <label
                                                    className="pd-addon-item"
                                                    key={`${id}-${index}`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedAddons.includes(id)}
                                                        onChange={e =>
                                                            setSelectedAddons(previous =>
                                                                e.target.checked
                                                                    ? [...previous, id]
                                                                    : previous.filter(
                                                                        item => item !== id
                                                                    )
                                                            )
                                                        }
                                                    />

                                                    <span>{addon.name}</span>

                                                    <strong>
                                                        +₹{formatPrice(addon.price)}
                                                    </strong>
                                                </label>
                                            );
                                        })}
                                    </div>

                                </div>
                            )} */}
                        </div>
                        <div className="pd-divider"></div>

                        <div className="pd-rating-price-wrap">

                            {/* PRICE */}

                            <div className="pd-price-section">

                                <div className="pd-current-price">
                                    ₹{formatPrice(unitPrice)}
                                </div>

                                {regularPrice > unitPrice && (
                                    <>
                                        <del>₹{formatPrice(regularPrice)}</del>
                                        <span className="pd-save">  {discount}% OFF </span>
                                    </>
                                )}

                                <p>Price per selected unit, excluding any separately applicable charges.</p>

                            </div>

                            <div className="wrap">



                                {/* QUANTITY */}

                                <div className="pd-quantity-row">
                                    <strong>Quantity</strong>
                                    <div className="pd-quantity-control">
                                        <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))}> − </button>
                                        <span>{quantity}</span>
                                        <button type="button" onClick={() => setQuantity(q => q + 1)} > + </button>
                                    </div>
                                </div>
                            </div>
                        </div>



                        <div className="total-action-wrap">
                            {/* TOTAL */}

                            <div className="pd-total-box">
                                <div>
                                    <span>Base price</span>
                                    <strong>₹{formatPrice(currentBasePrice)}</strong>
                                </div>

                                <div>
                                    <span>Add-ons</span>
                                    <strong>₹{formatPrice(currentAddonPrice)}</strong>
                                </div>

                                <div>
                                    <span>Quantity</span>
                                    <strong>{quantity}</strong>
                                </div>

                                <div className="pd-grand-total">
                                    <span>Total Amount</span>
                                    <strong>₹{formatPrice(totalPrice)}</strong>
                                </div>
                            </div>

                            {/* BUTTONS */}

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
                        {/* ------------------------- */}
                        {/* <div className="delivery-check">

                            <h4>Check Delivery Availability</h4>

                            <div className="delivery-input-group">

                                <input
                                    type="text"
                                    value={pinCode}
                                    onChange={(e) => {
                                        setPinCode(
                                            e.target.value.replace(/\D/g, "").slice(0, 6)
                                        );

                                        setDeliveryMessage("");
                                        setDeliveryDate("");
                                    }}
                                    placeholder="Enter 6-digit PIN code"
                                    maxLength={6}
                                    inputMode="numeric"
                                />

                                <button
                                    type="button"
                                    onClick={checkDelivery}
                                >
                                    Check
                                </button>

                            </div>

                            {deliveryMessage && (
                                <div className="delivery-result">

                                    <span className="delivery-success-icon">✓</span>

                                    <div>
                                        <p className="delivery-success-text">
                                            {deliveryMessage}
                                        </p>

                                        {deliveryDate && (
                                            <p className="delivery-estimate">
                                                <i className="fa fa-truck"></i>
                                                Estimated delivery by <strong>{deliveryDate}</strong>
                                            </p>
                                        )}
                                    </div>

                                </div>
                            )}

                        </div> */}
                        {/* ------------------------- */}

                    </div>

                </section>







                {/* SIMILAR PRODUCTS */}

                <section className="pd-similar-section">

                    <div className="pd-similar-heading">
                        <div>
                            <span>MORE TO EXPLORE</span>
                            <h2>Our others products</h2>
                            <p>Discover more delicious KONFiZ flavours.</p>
                        </div>

                        <Link to="/products">
                            View All Products →
                        </Link>
                    </div>

                    {similarProducts.length > 0 ? (

                        <div className="pd-similar-grid">

                            {similarProducts.map(item => {

                                const itemPrice = basePrice(
                                    item,
                                    weights(item)[0]
                                );

                                return (

                                    <article
                                        className="pd-product-card"
                                        key={getId(item)}
                                    >
                                        {/* PRODUCT IMAGE */}
                                        <Link
                                            to={`/products/details/${getId(item)}`}
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
                                                <span className="pd-card-new">NEW</span>
                                            )}

                                            {/* <span className="pd-card-heart">♥</span> */}
                                        </Link>

                                        {/* PRODUCT INFORMATION */}
                                        <div className="pd-card-content">

                                            <Link
                                                to={`/products/details/${getId(item)}`}
                                                className="pd-card-name"
                                            >
                                                {item.name}
                                            </Link>

                                            {/* PRODUCT TAGS */}
                                            <div className="pd-card-tags">
                                                <span>{categoryName(item) || "Ice Cream"}</span>

                                                {item.flavour && (
                                                    <span>{item.flavour}</span>
                                                )}

                                                {item.isNew && (
                                                    <span>New Arrival</span>
                                                )}
                                            </div>

                                            {/* DESCRIPTION */}
                                            <p className="pd-card-description">
                                                {item.description ||
                                                    item.flavour ||
                                                    "A delicious treat crafted for your happiness."}
                                            </p>

                                            {/* ADDONS / TOPPINGS */}
                                            {Array.isArray(item.addons) && item.addons.length > 0 && (
                                                <div className="pd-card-toppings">
                                                    <span className="pd-card-topping-label">
                                                        Toppings
                                                    </span>

                                                    {item.addons.slice(0, 3).map((addon, index) => (
                                                        <span
                                                            className="pd-card-topping"
                                                            key={addon._id || addon.id || index}
                                                        >
                                                            {addon.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* PRICE AND BUTTON */}
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
                                                    to={`/products/details/${getId(item)}`}
                                                    className="pd-card-button"
                                                    aria-label={`View ${item.name}`}
                                                >
                                                    <span>View Details</span>
                                                    <span className="pd-card-arrow">↗</span>
                                                </Link>

                                            </div>

                                        </div>
                                    </article>

                                );
                            })}

                        </div>

                    ) : (
                        <div className="pd-no-similar">
                            <p>Add more products from your Admin Dashboard to discover similar flavours.</p>
                        </div>
                    )}

                </section>
                {/* HIGHLIGHTS */}

                <section className="pd-highlights">

                    <div className="pd-section-title">
                        <span>WHY YOU WILL LOVE IT</span>
                        <h2>Product Highlights</h2>
                    </div>

                    <div className="pd-highlight-grid">

                        <div className="pd-highlight-card">
                            <span className="pd-highlight-number">01</span>
                            <div className="pd-highlight-content">
                                <span className="pd-highlight-label">THE TASTE</span>
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
                                <span className="pd-highlight-label">YOUR CHOICE</span>
                                <h3>Flexible Sizes</h3>
                                <p>Choose the perfect pack size for every craving.</p>
                            </div>
                            <span className="pd-highlight-line"></span>
                        </div>

                        <div className="pd-highlight-card">
                            <span className="pd-highlight-number">03</span>
                            <div className="pd-highlight-content">
                                <span className="pd-highlight-label">MAKE IT YOURS</span>
                                <h3>Customize Your Treat</h3>
                                <p>Add your favourite toppings and make it special.</p>
                            </div>
                            <span className="pd-highlight-line"></span>
                        </div>

                        <div className="pd-highlight-card">
                            <span className="pd-highlight-number">04</span>
                            <div className="pd-highlight-content">
                                <span className="pd-highlight-label">THE KONFiZ WAY</span>
                                <h3>Made for Happiness</h3>
                                <p>A little indulgence and a lot of happiness in every scoop.</p>
                            </div>
                            <span className="pd-highlight-line"></span>
                        </div>

                    </div>

                </section>
            </div>

            {/* STICKY CART BAR */}

            {/* =====================================
    BUY NOW ADDON POPUP
===================================== */}

            {showAddonPopup && (
                <div
                    className="pd-addon-overlay"
                    onClick={() => setShowAddonPopup(false)}
                >
                    <div
                        className="pd-addon-modal"
                        onClick={(e) => e.stopPropagation()}
                    >

                        {/* HEADER */}

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

                        {/* PRODUCT INFORMATION */}

                        <div className="pd-addon-product">

                            <div className="pd-addon-product-image">
                                {images.length > 0 && (
                                    <img src={images[0]} alt={product.name} />
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

                        {/* ADDONS */}

                        <div className="pd-addon-content">

                            <h3>Available Add-ons</h3>

                            {addons.length > 0 ? (

                                <div className="pd-addon-list">

                                    {addons.map((addon, index) => {

                                        const id = addonId(addon);

                                        const checked = selectedAddons.includes(id);

                                        return (
                                            <label
                                                key={`${id}-${index}`}
                                                className={`pd-addon-option ${checked ? "selected" : ""}`}
                                            >

                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={() => toggleAddon(addon)}
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

                        {/* PRICE SUMMARY */}

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
                                    ₹{formatPrice(currentBasePrice + currentAddonPrice)}
                                </strong>
                            </div>

                        </div>

                        {/* FOOTER */}

                        <div className="pd-addon-footer">

                            <button
                                type="button"
                                className="pd-addon-skip"
                                onClick={() => {
                                    handleCart(true, []);
                                }}
                            >
                                Skip Add-ons
                            </button>

                            <button
                                type="button"
                                className="pd-addon-confirm"
                                onClick={() => {
                                    handleCart(true, selectedAddons);
                                }}
                            >
                                Continue · ₹{formatPrice(
                                    (currentBasePrice + currentAddonPrice) * quantity
                                )}
                            </button>

                        </div>

                    </div>
                </div>
            )}

            <div className="pd-sticky-cart">

                <div>
                    <span>{cartCount} Different Products</span>
                    <strong>{totalQuantity} Items in Cart</strong>
                </div>

                <Link to="/cart">
                    View Cart ({totalQuantity}) →
                </Link>

            </div>

            <footer className="pd-footer">
                <h2>KONFiZ</h2>
                <p>ICE CREAM & HAPPINESS</p>
                <span>© 2026 KONFiZ. All rights reserved.</span>
            </footer>

        </div>
    );
}

export default ProductDetails;
