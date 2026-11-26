
import React, { useState, useEffect, useMemo } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext";
import "../style/product.css";
import Navbar from "../components/navber";
import { useCart } from "../context/cartcontext";

// =====================================
// HELPERS
// =====================================


const makeSlug = (value = "") =>
    String(value)
        .toLowerCase()
        .trim()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

const getProductId = (product) =>
    String(product?.id ?? product?._id ?? product?.name ?? "");

// CATEGORY HELPERS

const getCategoryName = (category) => {
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

const getCategoryId = (category) => {
    if (!category || typeof category !== "object") {
        return "";
    }

    return String(
        category.id ??
        category._id ??
        category.categoryId ??
        ""
    );
};

const getProductCategoryName = (product) =>
    getCategoryName(product?.category) ||
    product?.categoryName ||
    "";

// SUBCATEGORY HELPERS

const getSubcategoryName = (subcategory) => {
    if (!subcategory) return "";

    if (typeof subcategory === "string") {
        return subcategory;
    }

    return (
        subcategory.name ||
        subcategory.subcategoryName ||
        subcategory.title ||
        ""
    );
};

const getSubcategoryId = (subcategory) => {
    if (!subcategory || typeof subcategory !== "object") {
        return "";
    }

    return String(
        subcategory.id ??
        subcategory._id ??
        subcategory.subcategoryId ??
        ""
    );
};

const getProductSubcategoryName = (product) =>
    getSubcategoryName(product?.subcategory) ||
    product?.subcategoryName ||
    "";

const getProductSubcategoryId = (product) =>
    String(
        product?.subcategoryId ??
        getSubcategoryId(product?.subcategory) ??
        ""
    );

// ADD-ON HELPERS

const getAddonId = (addon) =>
    String(addon?.id ?? addon?._id ?? addon?.name ?? "");

// WEIGHT HELPERS

const getWeightOptions = (product) => {
    const options =
        product?.pricing?.sizes ||
        product?.sizes ||
        product?.pricing?.weightOptions ||
        product?.weightOptions ||
        [];

    if (!Array.isArray(options) || options.length === 0) {
        return [null];
    }

    return options.map(option => {
        if (typeof option === "object" && option !== null) {
            return Number(
                option.weight ??
                option.quantity ??
                option.size
            );
        }

        return Number(option);
    });
};

const getUnit = (product) =>
    product?.pricing?.unit ||
    product?.unit ||
    "ml";

// get price 
const getBasePrice = (product, weight = null) => {
    if (!product) return 0;

    const sizes =
        product?.pricing?.sizes ||
        product?.sizes ||
        [];

    if (Array.isArray(sizes) && sizes.length > 0) {
        const selectedOption =
            sizes.find(
                (option) =>
                    Number(option.weight) === Number(weight)
            ) || (weight === null ? sizes[0] : null);

        if (selectedOption) {
            return Number(
                selectedOption.offerPrice ??
                selectedOption.price ??
                0
            );
        }
    }

    return Number(product.offerPrice ?? product.price ?? 0);
};
// =====================================
// REGULAR PRICE AND OFFER PRICE
// =====================================

const getPriceDetails = (product, weight) => {
    const regularBasePrice = getBasePrice(product, weight);

    const weightOptions =
        product?.pricing?.sizes ||
        product?.sizes ||
        [];

    // Find the selected size's price information
    const selectedOption = weightOptions.find(option => {
        const optionWeight =
            typeof option === "object"
                ? option.weight ?? option.quantity ?? option.size
                : option;

        return Number(optionWeight) === Number(weight);
    });

    const regularPrice = Number(
        selectedOption?.regularPrice ??
        selectedOption?.mrp ??
        selectedOption?.price ??
        product?.regularPrice ??
        product?.mrp ??
        regularBasePrice
    );

    const possibleOfferPrice =
        selectedOption?.offerPrice ??
        selectedOption?.salePrice ??
        product?.offerPrice ??
        product?.discountPrice ??
        product?.salePrice ??
        product?.pricing?.offerPrice;

    const offerPrice = Number(possibleOfferPrice);

    // Only show an offer when it is valid and lower than regular price
    const hasOffer =
        Number.isFinite(offerPrice) &&
        offerPrice > 0 &&
        offerPrice < regularPrice;

    const sellingPrice = hasOffer
        ? offerPrice
        : regularPrice;

    const discount = hasOffer
        ? Math.round(
            ((regularPrice - offerPrice) / regularPrice) * 100
        )
        : 0;

    return {
        regularPrice,
        offerPrice: hasOffer ? offerPrice : null,
        sellingPrice,
        hasOffer,
        discount
    };
};


// FLAVOUR HELPERS

const getFlavour = (product) =>
    product?.flavour ||
    product?.flavor ||
    product?.taste ||
    "";

// STOCK HELPERS

const getStock = (product) => {
    if (product?.inStock !== undefined) {
        return Boolean(product.inStock);
    }

    if (product?.available !== undefined) {
        return Boolean(product.available);
    }

    if (product?.stock !== undefined) {
        return Number(product.stock) > 0;
    }

    if (product?.quantity !== undefined) {
        return Number(product.quantity) > 0;
    }

    return true;
};

// STORAGE HELPERS

const safeParse = (value, fallback = []) => {
    try {
        return JSON.parse(
            value || JSON.stringify(fallback)
        );
    } catch {
        return fallback;
    }
};

const normalizeList = (data, property) => {
    if (Array.isArray(data)) {
        return data;
    }

    if (Array.isArray(data?.[property])) {
        return data[property];
    }

    return [];
};

// =====================================
// PRODUCT COMPONENT
// =====================================

function Product() {
    const { categorySlug } = useParams();
    const navigate = useNavigate();

    const {
        addToCart: addProductToCart,
        totalQuantity,
        cartCount,
        subTotal
    } = useCart();

    const { user } = useAuth();

    const customerId =
        user?.customerId ||
        user?.id ||
        user?._id;



    // =====================================
    // WISHLIST
    // =====================================

    const [wishlist, setWishlist] = useState([]);

    useEffect(() => {
        if (!customerId) {
            setWishlist([]);
            return;
        }

        const wishlistKey = `konfiz_wishlist_${customerId}`;

        const loadWishlist = () => {
            const saved = safeParse(
                localStorage.getItem(wishlistKey),
                []
            );

            setWishlist(
                Array.isArray(saved) ? saved : []
            );
        };

        loadWishlist();

        window.addEventListener("storage", loadWishlist);

        window.addEventListener(
            "konfiz-wishlist-updated",
            loadWishlist
        );

        return () => {
            window.removeEventListener(
                "storage",
                loadWishlist
            );

            window.removeEventListener(
                "konfiz-wishlist-updated",
                loadWishlist
            );
        };
    }, [customerId]);

    // =====================================
    // STORE DATA
    // =====================================

    const [productData, setProductData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);

    const [storeLoaded, setStoreLoaded] = useState(false);

    // =====================================
    // FILTER STATES
    // =====================================

    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("default");

    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedSubcategory, setSelectedSubcategory] = useState("");
    const [selectedFlavour, setSelectedFlavour] = useState("");
    const [selectedSize, setSelectedSize] = useState("");

    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");

    const [inStockOnly, setInStockOnly] = useState(false);
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

    // =====================================
    // PRODUCT SELECTION
    // =====================================

    const [selections, setSelections] = useState({});

    // =====================================
    // ADD-ON POPUP
    // =====================================

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
            const savedProducts = safeParse(
                localStorage.getItem("konfizProducts"),
                []
            );

            const savedCategories = safeParse(
                localStorage.getItem("konfizCategories"),
                []
            );

            const savedSubcategories = safeParse(
                localStorage.getItem("konfizSubcategories"),
                []
            );

            setProductData(
                normalizeList(savedProducts, "products")
            );

            setCategories(
                normalizeList(savedCategories, "categories")
            );

            setSubcategories(
                normalizeList(
                    savedSubcategories,
                    "subcategories"
                )
            );

            setStoreLoaded(true);
        };

        loadStoreData();

        window.addEventListener("storage", loadStoreData);
        window.addEventListener("focus", loadStoreData);

        window.addEventListener(
            "konfizStoreUpdated",
            loadStoreData
        );

        window.addEventListener(
            "konfizSubcategoriesUpdated",
            loadStoreData
        );

        return () => {
            window.removeEventListener(
                "storage",
                loadStoreData
            );

            window.removeEventListener(
                "focus",
                loadStoreData
            );

            window.removeEventListener(
                "konfizStoreUpdated",
                loadStoreData
            );

            window.removeEventListener(
                "konfizSubcategoriesUpdated",
                loadStoreData
            );
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

                return {
                    id:
                        getCategoryId(item) ||
                        `category_${index}`,

                    name,

                    slug: makeSlug(
                        item.slug || name
                    ),

                    description:
                        item.description ||
                        item.details ||
                        ""
                };
            })
            .filter(Boolean);
    }, [categories]);

    // =====================================
    //location
    // =====================================
    const location = useLocation();

    useEffect(() => {
        const categoryId = location.hash.slice(1);

        if (!categoryId) return;

        let attempts = 0;
        let timer;

        const scrollToCategory = () => {
            const categoryElement = document.getElementById(categoryId);

            if (categoryElement) {
                categoryElement.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });

                return;
            }

            attempts++;

            if (attempts < 30) {
                timer = setTimeout(scrollToCategory, 100);
            }
        };

        timer = setTimeout(scrollToCategory, 100);

        return () => clearTimeout(timer);
    }, [location.hash]);


    const normalizedSubcategories = useMemo(() => {
        // Get subcategories nested inside admin categories
        const nestedSubcategories = categories.flatMap(category => {
            if (!category || typeof category !== "object") {
                return [];
            }

            const categoryId = getCategoryId(category);
            const categoryName = getCategoryName(category);

            const children = Array.isArray(category.subcategories)
                ? category.subcategories
                : [];

            return children.map((item, index) => {
                const name = getSubcategoryName(item);

                if (!name) return null;

                const id =
                    getSubcategoryId(item) ||
                    `${categoryId || makeSlug(categoryName)}-${index}`;

                return {
                    id,
                    name,
                    slug: makeSlug(item?.slug || name),
                    categoryId,
                    categoryName,
                    image:
                        item?.image ||
                        item?.imageUrl ||
                        item?.thumbnail ||
                        ""
                };
            }).filter(Boolean);
        });

        // Also support subcategories stored separately
        const separateSubcategories = subcategories.map((item, index) => {
            const name = getSubcategoryName(item);

            if (!name) return null;

            return {
                id:
                    getSubcategoryId(item) ||
                    `subcategory_${index}`,

                name,
                slug: makeSlug(item.slug || name),

                categoryId: String(
                    item.categoryId ??
                    getCategoryId(item.category) ??
                    ""
                ),

                categoryName: getCategoryName(item.category),

                image:
                    item.image ||
                    item.imageUrl ||
                    item.thumbnail ||
                    ""
            };
        }).filter(Boolean);

        // Combine both sources and prevent duplicates
        const combined = [
            ...nestedSubcategories,
            ...separateSubcategories
        ];

        const unique = new Map();

        combined.forEach(item => {
            const key = `${item.categoryId}__${item.slug}`;

            if (!unique.has(key)) {
                unique.set(key, item);
            }
        });

        return Array.from(unique.values());
    }, [categories, subcategories]);

    // =====================================
    // CURRENT URL CATEGORY
    // =====================================

    const normalizedUrlSlug = makeSlug(
        categorySlug || ""
    );

    const currentCategory = useMemo(() => {
        if (!normalizedUrlSlug) return null;

        return (
            normalizedCategories.find(
                category =>
                    category.slug === normalizedUrlSlug
            ) || null
        );
    }, [
        normalizedCategories,
        normalizedUrlSlug
    ]);

    // =====================================
    // CATEGORY MATCHING
    // =====================================

    const productMatchesCategory = (
        product,
        category
    ) => {
        if (!category) return true;

        const name = getProductCategoryName(product);

        const categoryId =
            product.categoryId ||
            getCategoryId(product.category);

        if (
            categoryId &&
            String(categoryId) === String(category.id)
        ) {
            return true;
        }

        return makeSlug(name) === category.slug;
    };

    // =====================================
    // SUBCATEGORY MATCHING
    // =====================================

    const productMatchesSubcategory = (
        product,
        subcategory
    ) => {
        if (!subcategory) return true;

        const productSubcategoryId =
            getProductSubcategoryId(product);

        const productSubcategoryName =
            getProductSubcategoryName(product);

        // Match using permanent ID first
        if (productSubcategoryId) {
            return (
                String(productSubcategoryId) ===
                String(subcategory.id)
            );
        }

        // Fallback for older products using names
        return (
            makeSlug(productSubcategoryName) ===
            subcategory.slug
        );
    };

    const currentSubcategory = useMemo(() => {
        if (!selectedSubcategory) return null;

        return (
            normalizedSubcategories.find(
                item => item.slug === selectedSubcategory
            ) || null
        );
    }, [
        normalizedSubcategories,
        selectedSubcategory
    ]);

    // =====================================
    // DYNAMIC FLAVOURS
    // =====================================

    const availableFlavours = useMemo(() => {
        return [
            ...new Set(
                productData
                    .map(getFlavour)
                    .filter(Boolean)
            )
        ].sort();
    }, [productData]);

    // =====================================
    // DYNAMIC SIZES
    // =====================================

    const availableSizes = useMemo(() => {
        return [
            ...new Set(
                productData.flatMap(product =>
                    getWeightOptions(product)
                        .filter(weight =>
                            weight !== null &&
                            weight !== undefined
                        )
                        .map(weight =>
                            `${weight} ${getUnit(product)}`
                        )
                )
            )
        ].sort();
    }, [productData]);

    // =====================================
    // PRICE LIMITS
    // =====================================

    const priceLimits = useMemo(() => {
        const prices = productData.map(product => {
            const options = getWeightOptions(product);

            return Math.min(
                ...options.map(weight =>
                    getBasePrice(product, weight)
                )
            );
        }).filter(Number.isFinite);

        return {
            min: prices.length
                ? Math.floor(Math.min(...prices))
                : 0,

            max: prices.length
                ? Math.ceil(Math.max(...prices))
                : 500
        };
    }, [productData]);

    // =====================================
    // FILTER RESET
    // =====================================

    const clearFilters = () => {
        setSearch("");
        setSelectedCategory("");
        setSelectedSubcategory("");
        setSelectedFlavour("");
        setSelectedSize("");
        setMinPrice("");
        setMaxPrice("");
        setInStockOnly(false);
        setSort("default");
    };

    const activeFilterCount = [
        selectedCategory,
        selectedSubcategory,
        selectedFlavour,
        selectedSize,
        minPrice,
        maxPrice,
        inStockOnly
    ].filter(Boolean).length;

    // =====================================
    // WEIGHT AND QUANTITY
    // =====================================

    const handleWeightChange = (
        productId,
        weight
    ) => {
        setSelections(previous => ({
            ...previous,

            [productId]: {
                ...previous[productId],

                weight:
                    weight === ""
                        ? null
                        : Number(weight)
            }
        }));
    };

    const handleQuantityChange = (
        productId,
        quantity
    ) => {
        setSelections(previous => ({
            ...previous,

            [productId]: {
                ...previous[productId],

                quantity: Math.max(
                    1,
                    Number(quantity) || 1
                )
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
    // ADD TO CART
    // =====================================

    const completeAddToCart = (
        product,
        weight,
        quantity,
        selectedAddonIds = []
    ) => {
        const availableAddons = Array.isArray(product.addons)
            ? product.addons
            : [];

        // Get selected add-on details
        const addons = availableAddons
            .filter(addon =>
                selectedAddonIds.includes(getAddonId(addon))
            )
            .map(addon => ({
                id: getAddonId(addon),
                name: addon.name,
                price: Number(addon.price) || 0
            }));

        // Calculate prices
        const priceDetails = getPriceDetails(product, weight);

        const basePrice = priceDetails.sellingPrice;

        const addonPrice = addons.reduce(
            (total, addon) => total + addon.price,
            0
        );

        const unitPrice = basePrice + addonPrice;

        const productId = getProductId(product);

        // Different add-on combinations become separate cart items
        const cartItemId = [
            productId,
            weight ?? "standard",
            addons
                .map(addon => addon.id)
                .sort()
                .join("-") || "no-addon"
        ].join("__");

        // Submit product and add-on information to CartContext
        addProductToCart({
            id: cartItemId,
            cartItemId,
            productId,

            name: product.name,
            image: product.image || null,

            category: getProductCategoryName(product),
            subcategory: getProductSubcategoryName(product),
            subcategoryId: getProductSubcategoryId(product),

            weight,
            unit: getUnit(product),

            addons,

            basePrice,
            addonPrice,

            price: unitPrice,
            quantity,

            totalPrice: unitPrice * quantity
        });

        closeAddonPopup();
    };

    const handleAddToCart = (product) => {

        // If customer is not logged in, redirect to login
        if (!user || !user.authenticated) {
            navigate("/login", {
                state: {
                    from: location.pathname + location.search + location.hash
                }
            });
            return;
        }

        const productId = getProductId(product);

        const selected = selections[productId] || {};

        const options = getWeightOptions(product);

        const weight =
            selected.weight !== undefined
                ? selected.weight
                : options[0];

        const quantity = Math.max(
            1,
            Number(selected.quantity || 1)
        );

        if (!getStock(product)) return;

        const availableAddons = Array.isArray(product.addons)
            ? product.addons
            : [];

        if (availableAddons.length > 0) {
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
    // WISHLIST
    // =====================================

    const isInWishlist = (productId) => {
        return wishlist.some(
            item =>
                String(item.id) === String(productId)
        );
    };

    const toggleWishlist = (product) => {
        if (!customerId) {
            navigate("/login");
            return;
        }

        const productId = getProductId(product);

        const wishlistKey =
            `konfiz_wishlist_${customerId}`;

        const exists = isInWishlist(productId);

        const updatedWishlist = exists
            ? wishlist.filter(
                item =>
                    String(item.id) !== productId
            )
            : [
                ...wishlist,
                {
                    id: productId,
                    name: product.name,
                    image: product.image || "",
                    category: getProductCategoryName(product),
                    subcategory: getProductSubcategoryName(product),
                    price: Number(product.price) || 0,
                    addedAt: new Date().toISOString()
                }
            ];

        try {
            localStorage.setItem(
                wishlistKey,
                JSON.stringify(updatedWishlist)
            );

            setWishlist(updatedWishlist);

            window.dispatchEvent(
                new Event("konfiz-wishlist-updated")
            );
        } catch (error) {
            console.error(
                "Wishlist update failed:",
                error
            );
        }
    };

    // =====================================
    // FILTER AND SORT PRODUCTS
    // =====================================

    const filteredProducts = useMemo(() => {
        if (
            categorySlug &&
            storeLoaded &&
            !currentCategory
        ) {
            return [];
        }

        let result = productData.filter(product => {
            const name = String(
                product.name || ""
            ).toLowerCase();

            const description = String(
                product.description || ""
            ).toLowerCase();

            const category =
                getProductCategoryName(product);

            const subcategory =
                getProductSubcategoryName(product);

            const flavour = String(
                getFlavour(product)
            );

            const searchTerm =
                search.trim().toLowerCase();

            const matchesSearch =
                !searchTerm ||
                name.toLowerCase().includes(searchTerm) ||
                description.toLowerCase().includes(searchTerm) ||
                category.toLowerCase().includes(searchTerm) ||
                subcategory.toLowerCase().includes(searchTerm) ||
                flavour.toLowerCase().includes(searchTerm);

            const matchesUrlCategory =
                productMatchesCategory(
                    product,
                    currentCategory
                );

            const matchesSelectedCategory =
                !selectedCategory ||
                makeSlug(category) === selectedCategory;

            const matchesSelectedSubcategory =
                !currentSubcategory ||
                productMatchesSubcategory(
                    product,
                    currentSubcategory
                );

            const matchesFlavour =
                !selectedFlavour ||
                flavour.toLowerCase() ===
                selectedFlavour.toLowerCase();

            const weights =
                getWeightOptions(product);

            const matchesPrice = weights.some(weight => {
                const price = getBasePrice(
                    product,
                    weight
                );

                return (
                    (!minPrice ||
                        price >= Number(minPrice)) &&
                    (!maxPrice ||
                        price <= Number(maxPrice))
                );
            });

            const matchesSize =
                !selectedSize ||
                weights.some(weight =>
                    `${weight} ${getUnit(product)}` === selectedSize
                );

            const matchesStock =
                !inStockOnly || getStock(product);

            return (
                matchesSearch &&
                matchesUrlCategory &&
                matchesSelectedCategory &&
                matchesSelectedSubcategory &&
                matchesFlavour &&
                matchesPrice &&
                matchesSize &&
                matchesStock
            );
        });

        result = [...result];

        if (sort === "low-high") {
            result.sort((a, b) =>
                getBasePrice(a, getWeightOptions(a)[0]) -
                getBasePrice(b, getWeightOptions(b)[0])
            );
        } else if (sort === "high-low") {
            result.sort((a, b) =>
                getBasePrice(b, getWeightOptions(b)[0]) -
                getBasePrice(a, getWeightOptions(a)[0])
            );
        } else if (sort === "rating") {
            result.sort(
                (a, b) =>
                    Number(b.rating || 0) -
                    Number(a.rating || 0)
            );
        } else if (sort === "name") {
            result.sort(
                (a, b) =>
                    String(a.name || "").localeCompare(
                        String(b.name || "")
                    )
            );
        }

        return result;
    }, [
        productData,
        search,
        sort,
        currentCategory,
        currentSubcategory,
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
        Boolean(categorySlug) &&
        storeLoaded &&
        !currentCategory;

    // =====================================
    // ADD-ON POPUP TOTALS
    // =====================================

    const popupBasePrice = addonPopup.product
        ? getPriceDetails(
            addonPopup.product,
            addonPopup.weight
        ).sellingPrice
        : 0;

    const popupAddonPrice = addonPopup.product
        ? (addonPopup.product.addons || [])
            .filter(addon =>
                addonPopup.addons.includes(
                    getAddonId(addon)
                )
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
    // FILTER CONTENT
    // =====================================

    const FilterContent = () => (
        <>
            <div className="filter-heading">
                <h3>Filters</h3>

                <button
                    type="button"
                    onClick={clearFilters}
                >
                    Clear All
                </button>
            </div>

            <div className="filter-group">
                <h4>Category</h4>

                {normalizedCategories.map(category => (
                    <label
                        className="filter-option"
                        key={category.id}
                    >
                        <input
                            type="radio"
                            name="filter-category"
                            checked={
                                selectedCategory === category.slug
                            }
                            onChange={() => {
                                setSelectedCategory(
                                    selectedCategory === category.slug
                                        ? ""
                                        : category.slug
                                );

                                setSelectedSubcategory("");
                            }}
                        />

                        <span>{category.name}</span>
                    </label>
                ))}
            </div>


            <div className="filter-group">
                <h4>Subcategory</h4>

                {normalizedSubcategories.length > 0 ? (
                    normalizedSubcategories
                        .filter(subcategory =>
                            !selectedCategory ||
                            subcategory.categoryId ===
                            normalizedCategories.find(
                                category => category.slug === selectedCategory
                            )?.id
                        )
                        .map(subcategory => (
                            <label
                                className="filter-option"
                                key={subcategory.id}
                            >
                                <input
                                    type="radio"
                                    name="filter-subcategory"
                                    checked={
                                        selectedSubcategory === subcategory.slug
                                    }
                                    onChange={() =>
                                        setSelectedSubcategory(
                                            selectedSubcategory === subcategory.slug
                                                ? ""
                                                : subcategory.slug
                                        )
                                    }
                                />

                                <span>{subcategory.name}</span>
                            </label>
                        ))
                ) : (
                    <p className="filter-hint">
                        No subcategories available. Add them in Admin Dashboard.
                    </p>
                )}
            </div>


            <div className="filter-group">
                <h4>Flavour</h4>

                {availableFlavours.length ? (
                    availableFlavours.map(flavour => (
                        <label
                            className="filter-option"
                            key={flavour}
                        >
                            <input
                                type="radio"
                                name="filter-flavour"
                                checked={
                                    selectedFlavour === flavour
                                }
                                onChange={() =>
                                    setSelectedFlavour(
                                        selectedFlavour === flavour
                                            ? ""
                                            : flavour
                                    )
                                }
                            />

                            <span>{flavour}</span>
                        </label>
                    ))
                ) : (
                    <p className="filter-hint">
                        Add flavour details in admin.
                    </p>
                )}
            </div>

            <div className="filter-group">
                <h4>Price Range (₹)</h4>

                <div className="price-inputs">
                    <input
                        type="number"
                        min="0"
                        placeholder="Min"
                        value={minPrice}
                        onChange={e =>
                            setMinPrice(e.target.value)
                        }
                    />

                    <span>–</span>

                    <input
                        type="number"
                        min="0"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={e =>
                            setMaxPrice(e.target.value)
                        }
                    />
                </div>

                <p className="filter-hint">
                    Available range: ₹{priceLimits.min} – ₹
                    {priceLimits.max}
                </p>
            </div>

            <div className="filter-group">
                <h4>Size</h4>

                {availableSizes.map(size => (
                    <label
                        className="filter-option"
                        key={size}
                    >
                        <input
                            type="radio"
                            name="filter-size"
                            checked={selectedSize === size}
                            onChange={() =>
                                setSelectedSize(
                                    selectedSize === size
                                        ? ""
                                        : size
                                )
                            }
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
                        onChange={e =>
                            setInStockOnly(e.target.checked)
                        }
                    />

                    <span>Our best selling products</span>
                </label>
            </div>
        </>
    );


    // UI----------------------


    return (
        <div className="product-page">

            <Navbar />

            {/* PAGE BANNER */}

            <section className="product-banner">
                <div className="product-container">

                    <span className="banner-eyebrow">
                        A LITTLE SCOOP OF HAPPINESS
                    </span>

                    <h1>
                        {currentCategory
                            ? currentCategory.name
                            : "Explore a World of Delicious Flavours"}
                    </h1>

                    <p>
                        {currentCategory?.description ||
                            "Discover delicious flavours made to make every moment sweeter."}
                    </p>

                </div>
            </section>

            <main className="product-container product-main">

                {/* CATEGORY SECTION */}

                {/* <section className="category-section">

                    <div className="section-heading">
                        <div>
                            <span className="section-eyebrow">
                                EXPLORE
                            </span>

                            <h2>Shop By Category</h2>
                        </div>

                        <Link to="/products">
                            View All Products →
                        </Link>
                    </div>

                </section> */}

                {/* =====================================
                    ADMIN CREATED SUBCATEGORIES
                ===================================== */}

                <section className="subcategory-section">

                    <div className="section-heading">
                        <div>
                            <span className="section-eyebrow">
                                DISCOVER MORE
                            </span>

                            <h2>Explore Our Collections</h2>
                        </div>
                    </div>

                    {/* {normalizedSubcategories.length > 0 ? (

                        <div className="subcategory-grid">

                            {normalizedSubcategories.map(subcategory => {

                                const isSelected =
                                    selectedSubcategory === subcategory.slug;

                                return (
                                    <button
                                        type="button"
                                        key={subcategory.id}
                                        className={`subcategory-card ${isSelected ? "active" : ""
                                            }`}
                                        onClick={() => {
                                            setSelectedSubcategory(
                                                isSelected
                                                    ? ""
                                                    : subcategory.slug
                                            );

                                            setSelectedFlavour("");
                                        }}
                                    >

                                        {subcategory.image ? (
                                            <img
                                                src={subcategory.image}
                                                alt={subcategory.name}
                                                loading="lazy"
                                            />
                                        ) : (
                                            <span className="subcategory-icon">
                                                🍨
                                            </span>
                                        )}

                                        <span className="subcategory-name">
                                            {subcategory.name}
                                        </span>

                                    </button>
                                );
                            })}

                        </div>

                    ) : (
                        <p className="filter-hint">
                            No subcategories available yet.
                        </p>
                    )} */}

                </section>

                {/* SEARCH */}

                <section className="product-search-section">

                    <div className="search-box">
                        <span>⌕</span>

                        <input
                            type="search"
                            placeholder="Search ice cream, flavours..."
                            value={search}
                            onChange={e =>
                                setSearch(e.target.value)
                            }
                        />

                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch("")}
                            >
                                ×
                            </button>
                        )}
                    </div>

                </section>

                {/* QUICK FILTERS */}

                <section className="quick-filter-section">

                    <span>Popular:</span>

                    {["Chocolate", "Vanilla", "Strawberry"]
                        .filter(flavour =>
                            availableFlavours.some(
                                item =>
                                    item.toLowerCase() ===
                                    flavour.toLowerCase()
                            )
                        )
                        .map(flavour => (
                            <button
                                type="button"
                                key={flavour}
                                className={`quick-filter ${selectedFlavour === flavour
                                    ? "active"
                                    : ""
                                    }`}
                                onClick={() =>
                                    setSelectedFlavour(
                                        selectedFlavour === flavour
                                            ? ""
                                            : flavour
                                    )
                                }
                            >
                                {flavour}
                            </button>
                        ))}

                    <button
                        type="button"
                        className={`quick-filter ${inStockOnly ? "active" : ""
                            }`}
                        onClick={() =>
                            setInStockOnly(!inStockOnly)
                        }
                    >
                        Best selling
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
                                    {currentSubcategory?.name ||
                                        currentCategory?.name ||
                                        "All Ice Creams"}
                                </h2>

                                <p>
                                    Showing {filteredProducts.length} products
                                </p>
                            </div>

                            <div className="results-actions">

                                <button
                                    type="button"
                                    className="mobile-filter-button"
                                    onClick={() =>
                                        setMobileFilterOpen(true)
                                    }
                                >
                                    ☷ Filter
                                    {activeFilterCount > 0 &&
                                        ` (${activeFilterCount})`}
                                </button>

                                <label className="sort-control">

                                    <span>Sort By</span>

                                    <select
                                        value={sort}
                                        onChange={e =>
                                            setSort(e.target.value)
                                        }
                                    >
                                        <option value="default">
                                            Recommended
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

                                        <option value="name">
                                            Name: A to Z
                                        </option>
                                    </select>

                                </label>

                            </div>

                        </div>

                        {/* ACTIVE FILTER CHIPS */}

                        {(selectedCategory ||
                            selectedSubcategory ||
                            selectedFlavour ||
                            selectedSize ||
                            minPrice ||
                            maxPrice ||
                            inStockOnly) && (

                                <div className="active-filter-list">

                                    {selectedCategory && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setSelectedCategory("")
                                            }
                                        >
                                            {normalizedCategories.find(
                                                c => c.slug === selectedCategory
                                            )?.name || selectedCategory} ×
                                        </button>
                                    )}

                                    {selectedSubcategory && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setSelectedSubcategory("")
                                            }
                                        >
                                            {currentSubcategory?.name ||
                                                selectedSubcategory} ×
                                        </button>
                                    )}

                                    {selectedFlavour && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setSelectedFlavour("")
                                            }
                                        >
                                            {selectedFlavour} ×
                                        </button>
                                    )}

                                    {selectedSize && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setSelectedSize("")
                                            }
                                        >
                                            {selectedSize} ×
                                        </button>
                                    )}

                                    {(minPrice || maxPrice) && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setMinPrice("");
                                                setMaxPrice("");
                                            }}
                                        >
                                            Price ×
                                        </button>
                                    )}

                                    {inStockOnly && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setInStockOnly(false)
                                            }
                                        >
                                            In Stock ×
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        className="clear-active"
                                        onClick={clearFilters}
                                    >
                                        Clear All
                                    </button>

                                </div>
                            )}

                        {/* PRODUCT GRID - CATEGORY WISE */}

                        <div className="category-products-container">

                            {Object.entries(
                                filteredProducts.reduce(
                                    (groups, product) => {
                                        const categoryName =
                                            getProductCategoryName(product) ||
                                            "Other";

                                        if (!groups[categoryName]) {
                                            groups[categoryName] = [];
                                        }

                                        groups[categoryName].push(product);

                                        return groups;
                                    },
                                    {}
                                )
                            ).map(([categoryName, categoryProducts]) => (

                                <section
                                    id={`${categoryName.toLowerCase().replace(/\s+/g, "-")}`}
                                    className="product-category-section"
                                    key={categoryName}
                                >

                                    <div className="product-category-heading">
                                        <h2>{categoryName}</h2>

                                        <span>
                                            {categoryProducts.length} Products
                                        </span>
                                    </div>

                                    <div className="product-grid">

                                        {categoryProducts.map(product => {

                                            const productId =
                                                getProductId(product);

                                            const weightOptions =
                                                getWeightOptions(product);

                                            const selectedWeight =
                                                selections[productId]?.weight !== undefined
                                                    ? selections[productId].weight
                                                    : weightOptions[0];

                                            const quantity =
                                                selections[productId]?.quantity || 1;

                                            const priceDetails = getPriceDetails(
                                                product,
                                                selectedWeight
                                            );

                                            const basePrice = priceDetails.sellingPrice;

                                            // const productCategoryName =
                                            //     getProductCategoryName(product);

                                            const inWishlist =
                                                isInWishlist(productId);

                                            return (

                                                <article
                                                    className="product-card"
                                                    key={productId}
                                                >

                                                    {/* PRODUCT IMAGE */}

                                                    <div className="product-image-wrapper">

                                                        <button
                                                            type="button"
                                                            className={`wishlist-btn ${inWishlist ? "active" : ""
                                                                }`}
                                                            onClick={() =>
                                                                toggleWishlist(product)
                                                            }
                                                            aria-label={
                                                                inWishlist
                                                                    ? "Remove from wishlist"
                                                                    : "Add to wishlist"
                                                            }
                                                        >
                                                            {inWishlist ? "♥" : "♡"}
                                                        </button>

                                                        {product.image ? (
                                                            <img
                                                                src={product.image}
                                                                alt={
                                                                    product.name ||
                                                                    "KONFiZ ice cream"
                                                                }
                                                                loading="lazy"
                                                            />
                                                        ) : (
                                                            <div className="product-image-placeholder">
                                                                🍨
                                                            </div>
                                                        )}

                                                        {(
                                                            product.isPremium ||
                                                            product.premium ||
                                                            product.featured
                                                        ) && (
                                                                <span className="product-premium-badge">
                                                                    ★ PREMIUM
                                                                </span>
                                                            )}

                                                        {product.isNew && (
                                                            <span className="product-badge">
                                                                New
                                                            </span>
                                                        )}

                                                    </div>

                                                    {/* PRODUCT INFO */}

                                                    <div className="product-info">

                                                        <div className="product-title-row">

                                                            <Link
                                                                to={`/products/details/${productId}`}
                                                                className="product-details-link"
                                                            >
                                                                <h3>{product.name}</h3>
                                                            </Link>

                                                            {Number(product.rating) > 0 && (
                                                                <span className="product-rating">
                                                                    ★ {Number(
                                                                        product.rating
                                                                    ).toFixed(1)}
                                                                </span>
                                                            )}

                                                        </div>

                                                        <p className="product-description card-description">
                                                            {product.description ||
                                                                "A delicious KONFiZ treat."}
                                                        </p>

                                                        {/* WEIGHT */}

                                                        <div className="product-selection">

                                                            <label>Select Size</label>

                                                            <select
                                                                value={selectedWeight ?? ""}
                                                                onChange={e =>
                                                                    handleWeightChange(
                                                                        productId,
                                                                        e.target.value
                                                                    )
                                                                }
                                                            >

                                                                {weightOptions.map(
                                                                    (weight, index) => (
                                                                        <option
                                                                            key={`${productId}-${index}`}
                                                                            value={weight ?? ""}
                                                                        >
                                                                            {weight === null
                                                                                ? "Standard"
                                                                                : `${weight} ${getUnit(product)}`}
                                                                        </option>
                                                                    )
                                                                )}

                                                            </select>

                                                        </div>

                                                        {/* PRICE AND QUANTITY */}

                                                        <div className="product-card-bottom">


                                                            <div className="product-price">

                                                                <span className="price-label">
                                                                    {priceDetails.hasOffer ? "Special Offer Price" : "Price"}
                                                                </span>

                                                                <div className="product-price-line">

                                                                    <strong className="product-price-current">
                                                                        ₹{priceDetails.sellingPrice.toFixed(2)}
                                                                    </strong>

                                                                    {priceDetails.hasOffer && (
                                                                        <>
                                                                            <del className="product-price-original">
                                                                                ₹{priceDetails.regularPrice.toFixed(2)}
                                                                            </del>

                                                                            <span className="product-discount-badge">
                                                                                {priceDetails.discount}% OFF
                                                                            </span>
                                                                        </>
                                                                    )}

                                                                </div>

                                                            </div>


                                                            <div className="quantity-controls">

                                                                <button
                                                                    type="button"
                                                                    aria-label="Decrease quantity"
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
                                                                    aria-label="Increase quantity"
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

                                                        {/* TOTAL */}

                                                        <div className="product-total">

                                                            Total: <strong>
                                                                ₹{(
                                                                    basePrice * quantity
                                                                ).toFixed(2)}
                                                            </strong>

                                                        </div>

                                                        <div className="pro-button-wrapper">
                                                            <div className="pro-details-button">
                                                                <Link
                                                                    to={`/products/details/${productId}`}
                                                                    className="product-details-link"
                                                                >
                                                                    View Product
                                                                </Link>
                                                            </div>
                                                            {/* ADD TO CART */}
                                                            <button
                                                                type="button"
                                                                className="add-cart-btn"
                                                                disabled={!getStock(product)}
                                                                onClick={() => handleAddToCart(product)}
                                                            // onClick={() => {
                                                            //     console.log("ADD TO CART CLICKED", product);
                                                            //     handleAddToCart(product);
                                                            // }}
                                                            >
                                                                {!getStock(product)
                                                                    ? "Out of Stock"
                                                                    : "+ Add to Cart"}
                                                            </button>
                                                        </div>
                                                    </div>

                                                </article>

                                            );
                                        })}

                                    </div>

                                </section>

                            ))}

                            {filteredProducts.length === 0 && (
                                <div className="no-products">
                                    <h3>We are cooked for you!</h3>
                                    <p>try with ours others products</p>
                                </div>
                            )}

                        </div>

                        {/* EMPTY STATE */}

                        {filteredProducts.length === 0 && (

                            <div className="empty-products">

                                <div>🍦</div>

                                <h3>
                                    {invalidCategory
                                        ? "Category Not Found"
                                        : "we are cooked for you!"}
                                </h3>

                                <p>
                                    Try changing your search or filters
                                    to discover more flavours.
                                </p>

                                <button
                                    type="button"
                                    onClick={clearFilters}
                                >
                                    Clear Filters
                                </button>

                                {invalidCategory && (
                                    <Link to="/products">
                                        View All Products
                                    </Link>
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
                    onClick={() =>
                        setMobileFilterOpen(false)
                    }
                >

                    <div
                        className="filter-drawer"
                        onClick={e => e.stopPropagation()}
                    >

                        <div className="filter-drawer-header">

                            <h2>Filter Products</h2>

                            <button
                                type="button"
                                onClick={() =>
                                    setMobileFilterOpen(false)
                                }
                            >
                                ×
                            </button>

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
                                onClick={() =>
                                    setMobileFilterOpen(false)
                                }
                            >
                                Show {filteredProducts.length} Products
                            </button>

                        </div>

                    </div>

                </div>

            )}

            {/* ADD-ON POPUP */}

            {addonPopup.open && addonPopup.product && (

                <div
                    className="addon-modal-overlay"
                    onClick={closeAddonPopup}
                >

                    <div
                        className="addon-modal"
                        onClick={e => e.stopPropagation()}
                    >

                        <button
                            type="button"
                            className="addon-modal-close"
                            onClick={closeAddonPopup}
                        >
                            ×
                        </button>

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

                        <h3>Choose Your Add-ons</h3>

                        <div className="addon-modal-list">

                            {(addonPopup.product.addons || []).map(
                                (addon, index) => {

                                    const addonId =
                                        getAddonId(addon);

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
                                                onChange={e => {
                                                    setAddonPopup(previous => ({
                                                        ...previous,

                                                        addons: e.target.checked
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
                                                + ₹{Number(
                                                    addon.price || 0
                                                ).toFixed(2)}
                                            </strong>

                                        </label>

                                    );
                                }
                            )}

                        </div>

                        {/* ADD-ON TOTAL */}

                        <div className="addon-modal-total">

                            <span>Base price</span>

                            <strong>
                                ₹{popupBasePrice.toFixed(2)}
                            </strong>

                            <span>Add-ons</span>

                            <strong>
                                ₹{popupAddonPrice.toFixed(2)}
                            </strong>

                            <span>Quantity</span>

                            <strong>{addonPopup.quantity}</strong>

                            <span>Order Total</span>

                            <strong>
                                ₹{(
                                    popupUnitPrice *
                                    addonPopup.quantity
                                ).toFixed(2)}
                            </strong>

                        </div>

                        {/* ACTIONS */}

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
                        Cart Total: ₹{Number(
                            subTotal || 0
                        ).toFixed(2)}
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

            <footer className="product-footer">

                <h2>KONFiZ</h2>

                <p>ICE CREAM & HAPPINESS</p>

                <p>
                    © 2026 KONFiZ. All rights reserved.
                </p>

            </footer>

        </div>
    );
}

export default Product;





