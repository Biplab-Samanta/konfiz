
import { useEffect, useState } from "react";

// =====================================================
// KONFiZ CENTRAL PRODUCT STORE
// All product data operations should go through this file
// =====================================================

const STORAGE_KEY = "konfizProducts";
const UPDATE_EVENT = "konfiz-products-updated";

// =====================================================
// DEFAULT PRODUCTS
// Used only when localStorage has no product data
// =====================================================

const initialProducts = [
    {
        id: "KONFIZ-001",
        name: "Belgian Chocolate",
        sku: "KON-CHO-001",
        category: "Ice Cream",
        categoryId: "",
        subcategory: "Chocolate",
        description:
            "Rich and creamy Belgian chocolate ice cream made with premium cocoa and fresh dairy ingredients.",
        shortDescription: "Rich Belgian chocolate flavour.",
        flavour: "Chocolate",
        ingredients: "Milk, cream, sugar, cocoa powder, chocolate.",
        allergens: ["Milk"],
        storageInstructions: "Keep frozen at -18°C or below.",
        shelfLife: "6 months",
        servingSuggestion: "Serve chilled with chocolate chips.",
        rating: 4.8,

        price: 120,
        baseWeight: 100,
        baseUnit: "ml",
        basePrice: 120,

        sizes: [
            { id: 1, weight: 100, unit: "ml", price: 120 },
            { id: 2, weight: 250, unit: "ml", price: 280 },
            { id: 3, weight: 500, unit: "ml", price: 520 },
            { id: 4, weight: 1000, unit: "ml", price: 990 }
        ],

        weightOptions: [100, 250, 500, 1000],
        weightUnit: "ml",

        image: "/images/products/chocolate.jpg",
        images: [],

        addons: [
            { id: 1, name: "Chocolate Chips", price: 20 },
            { id: 2, name: "Extra Toppings", price: 30 }
        ],

        stock: 50,
        inStock: true,
        available: true,
        status: "active",
        featured: true,

        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },

    {
        id: "KONFIZ-002",
        name: "Strawberry Bliss",
        sku: "KON-STR-002",
        category: "Ice Cream",
        categoryId: "",
        subcategory: "Fruit",
        description:
            "A refreshing strawberry ice cream prepared with creamy dairy and delicious strawberry flavour.",
        shortDescription: "Fresh and fruity strawberry flavour.",
        flavour: "Strawberry",
        ingredients: "Milk, cream, sugar, strawberry pulp.",
        allergens: ["Milk"],
        storageInstructions: "Keep frozen at -18°C or below.",
        shelfLife: "6 months",
        servingSuggestion: "Enjoy with fresh strawberry pieces.",
        rating: 4.6,

        price: 110,
        baseWeight: 100,
        baseUnit: "ml",
        basePrice: 110,

        sizes: [
            { id: 1, weight: 100, unit: "ml", price: 110 },
            { id: 2, weight: 250, unit: "ml", price: 260 },
            { id: 3, weight: 500, unit: "ml", price: 490 },
            { id: 4, weight: 1000, unit: "ml", price: 950 }
        ],

        weightOptions: [100, 250, 500, 1000],
        weightUnit: "ml",

        image: "/images/products/strawberry.jpg",
        images: [],

        addons: [],
        stock: 40,
        inStock: true,
        available: true,
        status: "active",
        featured: true,

        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },

    {
        id: "KONFIZ-003",
        name: "Vanilla Dream",
        sku: "KON-VAN-003",
        category: "Ice Cream",
        categoryId: "",
        subcategory: "Vanilla",
        description:
            "Smooth and delicious vanilla ice cream made with creamy milk and rich vanilla flavour.",
        shortDescription: "Classic creamy vanilla flavour.",
        flavour: "Vanilla",
        ingredients: "Milk, cream, sugar, vanilla extract.",
        allergens: ["Milk"],
        storageInstructions: "Keep frozen at -18°C or below.",
        shelfLife: "6 months",
        servingSuggestion: "Serve with fruits or chocolate sauce.",
        rating: 4.7,

        price: 100,
        baseWeight: 100,
        baseUnit: "ml",
        basePrice: 100,

        sizes: [
            { id: 1, weight: 100, unit: "ml", price: 100 },
            { id: 2, weight: 250, unit: "ml", price: 240 },
            { id: 3, weight: 500, unit: "ml", price: 460 },
            { id: 4, weight: 1000, unit: "ml", price: 900 }
        ],

        weightOptions: [100, 250, 500, 1000],
        weightUnit: "ml",

        image: "/images/products/vanilla.jpg",
        images: [],

        addons: [],
        stock: 60,
        inStock: true,
        available: true,
        status: "active",
        featured: true,

        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

// =====================================================
// READ PRODUCTS
// =====================================================

const readProducts = () => {
    try {
        const storedProducts = localStorage.getItem(STORAGE_KEY);

        if (storedProducts !== null) {
            const parsedProducts = JSON.parse(storedProducts);

            return Array.isArray(parsedProducts) ? parsedProducts : [];
        }

        // Initialize default products only on first use
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(initialProducts)
        );

        return initialProducts;

    } catch (error) {
        console.error("KONFiZ: Unable to read products:", error);
        return [];
    }
};

// =====================================================
// SAVE PRODUCTS
// All product changes pass through this function
// =====================================================

const saveProducts = (products) => {
    try {
        if (!Array.isArray(products)) {
            throw new Error("Product data must be an array.");
        }

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(products)
        );

        // Notify components in the same browser tab
        window.dispatchEvent(
            new Event(UPDATE_EVENT)
        );

        return true;

    } catch (error) {
        console.error("KONFiZ: Unable to save products:", error);
        return false;
    }
};

// =====================================================
// GET ALL PRODUCTS
// =====================================================

export const getProducts = () => {
    return readProducts();
};

// =====================================================
// GET PRODUCT BY ID
// =====================================================

export const getProductById = (id) => {
    return readProducts().find(
        product => String(product.id) === String(id)
    ) || null;
};

// =====================================================
// ADD PRODUCT
// =====================================================

export const addProduct = (productData) => {
    try {
        if (!productData || typeof productData !== "object") {
            return null;
        }

        const products = readProducts();

        const newProduct = {
            ...productData,

            id: productData.id || `KONFIZ-${Date.now()}`,

            createdAt:
                productData.createdAt || new Date().toISOString(),

            updatedAt: new Date().toISOString(),

            status: productData.status || "active",

            featured:
                typeof productData.featured === "boolean"
                    ? productData.featured
                    : false,

            stock: Number(productData.stock || 0),

            inStock: Number(productData.stock || 0) > 0,

            available: productData.available !== false
        };

        const duplicate = products.some(
            product =>
                String(product.id) === String(newProduct.id)
        );

        if (duplicate) {
            console.error("KONFiZ: Product ID already exists.");
            return null;
        }

        const updatedProducts = [...products, newProduct];

        const saved = saveProducts(updatedProducts);

        return saved ? newProduct : null;

    } catch (error) {
        console.error("KONFiZ: Add product failed:", error);
        return null;
    }
};

// =====================================================
// UPDATE PRODUCT
// =====================================================

export const updateProduct = (id, updatedData) => {
    try {
        const products = readProducts();

        const productExists = products.some(
            product => String(product.id) === String(id)
        );

        if (!productExists) {
            console.error("KONFiZ: Product not found.");
            return null;
        }

        let updatedProduct = null;

        const updatedProducts = products.map(product => {
            if (String(product.id) !== String(id)) {
                return product;
            }

            updatedProduct = {
                ...product,
                ...updatedData,

                id: product.id,

                createdAt: product.createdAt,

                updatedAt: new Date().toISOString()
            };

            if (updatedData.stock !== undefined) {
                updatedProduct.stock = Number(updatedData.stock);
                updatedProduct.inStock = Number(updatedData.stock) > 0;
            }

            return updatedProduct;
        });

        const saved = saveProducts(updatedProducts);

        return saved ? updatedProduct : null;

    } catch (error) {
        console.error("KONFiZ: Update product failed:", error);
        return null;
    }
};

// =====================================================
// DELETE PRODUCT
// =====================================================

export const deleteProduct = (id) => {
    try {
        const products = readProducts();

        const updatedProducts = products.filter(
            product => String(product.id) !== String(id)
        );

        if (updatedProducts.length === products.length) {
            return false;
        }

        return saveProducts(updatedProducts);

    } catch (error) {
        console.error("KONFiZ: Delete product failed:", error);
        return false;
    }
};

// =====================================================
// UPDATE PRODUCT STOCK
// =====================================================

export const updateProductStock = (id, stock) => {
    const numericStock = Number(stock);

    if (!Number.isFinite(numericStock) || numericStock < 0) {
        return null;
    }

    return updateProduct(id, {
        stock: numericStock,
        inStock: numericStock > 0
    });
};

// =====================================================
// FEATURED PRODUCTS
// =====================================================

export const getFeaturedProducts = () => {
    return readProducts().filter(
        product =>
            product.featured === true &&
            product.status === "active" &&
            product.available !== false
    );
};

// =====================================================
// ACTIVE PRODUCTS
// =====================================================

export const getActiveProducts = () => {
    return readProducts().filter(
        product =>
            product.status === "active" &&
            product.available !== false
    );
};

// =====================================================
// PRODUCTS BY CATEGORY
// =====================================================

export const getProductsByCategory = (category) => {
    return readProducts().filter(
        product =>
            String(product.category).toLowerCase() ===
            String(category).toLowerCase()
    );
};

// =====================================================
// SEARCH PRODUCTS
// =====================================================

export const searchProducts = (searchText) => {
    const search = String(searchText || "").toLowerCase().trim();

    if (!search) {
        return readProducts();
    }

    return readProducts().filter(product =>
        [
            product.name,
            product.sku,
            product.category,
            product.subcategory,
            product.flavour,
            product.description
        ]
            .filter(Boolean)
            .some(value =>
                String(value).toLowerCase().includes(search)
            )
    );
};

// =====================================================
// REACT HOOK
// Automatically refreshes when products change
// =====================================================

export const useProducts = () => {
    const [products, setProducts] = useState(() => readProducts());

    useEffect(() => {
        const refreshProducts = () => {
            setProducts(readProducts());
        };

        window.addEventListener(UPDATE_EVENT, refreshProducts);
        window.addEventListener("storage", refreshProducts);

        return () => {
            window.removeEventListener(UPDATE_EVENT, refreshProducts);
            window.removeEventListener("storage", refreshProducts);
        };
    }, []);

    return products;
};

// =====================================================
// REFRESH PRODUCTS MANUALLY
// =====================================================

export const refreshProducts = () => {
    window.dispatchEvent(new Event(UPDATE_EVENT));
};
