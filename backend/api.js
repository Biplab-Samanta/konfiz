
const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

// =====================================
// PRODUCT MODEL
// =====================================

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        sku: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true
        }
    },
    {
        strict: false,
        timestamps: true,
        collection: "products"
    }
);

const Product =
    mongoose.models.Product ||
    mongoose.model("Product", productSchema);

// =====================================
// COMMON HELPERS
// =====================================

const checkDatabase = (res) => {
    if (mongoose.connection.readyState !== 1) {
        res.status(503).json({
            success: false,
            message: "Database is not connected."
        });
        return false;
    }

    return true;
};

const getDocumentSize = (data) =>
    Buffer.byteLength(JSON.stringify(data), "utf8");

const MAX_PRODUCT_SIZE = 12 * 1024 * 1024;

// =====================================
// HEALTH CHECK
// GET /api/health
// =====================================

router.get("/health", (req, res) => {
    res.json({
        success: true,
        server: "Running",
        mongodb:
            mongoose.connection.readyState === 1
                ? "Connected"
                : "Disconnected",
        database: mongoose.connection.name
    });
});

// =====================================
// GET ALL PRODUCTS
// GET /api/products
// =====================================

router.get("/products", async (req, res) => {
    try {
        if (!checkDatabase(res)) return;

        const products = await Product.find().sort({
            createdAt: -1,
            _id: -1
        });

        return res.json({
            success: true,
            count: products.length,
            products
        });

    } catch (error) {
        console.error("Get products error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve products."
        });
    }
});

// =====================================
// ADD PRODUCT
// POST /api/products
// =====================================

router.post("/products", async (req, res) => {
    try {
        if (!checkDatabase(res)) return;

        const productData = req.body;

        if (
            !productData ||
            typeof productData.name !== "string" ||
            !productData.name.trim() ||
            typeof productData.sku !== "string" ||
            !productData.sku.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Product name and SKU are required."
            });
        }

        if (getDocumentSize(productData) > MAX_PRODUCT_SIZE) {
            return res.status(413).json({
                success: false,
                message: "Product data or images are too large."
            });
        }

        const sku = productData.sku.trim().toUpperCase();

        const product = await Product.create({
            ...productData,
            name: productData.name.trim(),
            sku
        });

        return res.status(201).json({
            success: true,
            message: "Product added successfully.",
            product
        });

    } catch (error) {
        console.error("Add product error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "This SKU already exists."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Unable to save product.",
            error: error.message
        });
    }
});

// =====================================
// MIGRATE LOCALSTORAGE PRODUCTS
// POST /api/products/migrate
// =====================================

router.post("/products/migrate", async (req, res) => {
    try {
        if (!checkDatabase(res)) return;

        const incomingProducts = req.body.products;

        if (!Array.isArray(incomingProducts)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a products array."
            });
        }

        if (incomingProducts.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No products were provided for migration."
            });
        }

        let inserted = 0;
        let alreadyExists = 0;
        let invalid = 0;
        let duplicateInUpload = 0;

        const seenSkus = new Set();
        const errors = [];

        for (let index = 0; index < incomingProducts.length; index++) {
            const original = incomingProducts[index];

            try {
                if (
                    !original ||
                    typeof original.name !== "string" ||
                    !original.name.trim() ||
                    typeof original.sku !== "string" ||
                    !original.sku.trim()
                ) {
                    invalid++;
                    errors.push({
                        index,
                        message: "Product name or SKU is missing."
                    });
                    continue;
                }

                const sku = original.sku.trim().toUpperCase();

                if (seenSkus.has(sku)) {
                    duplicateInUpload++;
                    continue;
                }

                seenSkus.add(sku);

                const productData = {
                    ...original,
                    name: original.name.trim(),
                    sku
                };

                if (getDocumentSize(productData) > MAX_PRODUCT_SIZE) {
                    invalid++;
                    errors.push({
                        index,
                        sku,
                        message: "Product document is too large."
                    });
                    continue;
                }

                // Insert only when SKU does not already exist.
                // Existing MongoDB products are never overwritten.
                const result = await Product.updateOne(
                    { sku },
                    { $setOnInsert: productData },
                    { upsert: true }
                );

                if (result.upsertedCount === 1) {
                    inserted++;
                } else {
                    alreadyExists++;
                }

            } catch (itemError) {
                if (itemError.code === 11000) {
                    alreadyExists++;
                } else {
                    invalid++;
                    errors.push({
                        index,
                        message: itemError.message
                    });
                }
            }
        }

        return res.json({
            success: true,
            message: "Product migration completed.",
            summary: {
                received: incomingProducts.length,
                inserted,
                alreadyExists,
                duplicateInUpload,
                invalid
            },
            errors
        });

    } catch (error) {
        console.error("Product migration error:", error);

        return res.status(500).json({
            success: false,
            message: "Product migration failed.",
            error: error.message
        });
    }
});

// =====================================
// EDIT PRODUCT
// PUT /api/products/:id
// =====================================

router.put("/products/:id", async (req, res) => {
    try {
        if (!checkDatabase(res)) return;

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID."
            });
        }

        const updates = { ...req.body };

        // MongoDB manages these fields.
        delete updates._id;
        delete updates.__v;
        delete updates.createdAt;

        if (updates.name !== undefined) {
            if (!String(updates.name).trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Product name cannot be empty."
                });
            }

            updates.name = String(updates.name).trim();
        }

        if (updates.sku !== undefined) {
            if (!String(updates.sku).trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Product SKU cannot be empty."
                });
            }

            updates.sku = String(updates.sku).trim().toUpperCase();
        }

        if (getDocumentSize(updates) > MAX_PRODUCT_SIZE) {
            return res.status(413).json({
                success: false,
                message: "Product data or images are too large."
            });
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            {
                new: true,
                runValidators: true
            }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found."
            });
        }

        return res.json({
            success: true,
            message: "Product updated successfully.",
            product
        });

    } catch (error) {
        console.error("Update product error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "This SKU already exists."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Unable to update product."
        });
    }
});

// =====================================
// UPDATE PRODUCT STOCK
// PATCH /api/products/:id/stock
// =====================================

router.patch("/products/:id/stock", async (req, res) => {
    try {
        if (!checkDatabase(res)) return;

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID."
            });
        }

        const stock = Number(req.body.stock);

        if (!Number.isFinite(stock) || stock < 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid stock quantity."
            });
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { $set: { stock } },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found."
            });
        }

        return res.json({
            success: true,
            message: "Stock updated successfully.",
            product
        });

    } catch (error) {
        console.error("Update stock error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to update stock."
        });
    }
});

// =====================================
// DELETE PRODUCT
// DELETE /api/products/:id
// =====================================

router.delete("/products/:id", async (req, res) => {
    try {
        if (!checkDatabase(res)) return;

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID."
            });
        }

        const product = await Product.findByIdAndDelete(
            req.params.id
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found."
            });
        }

        return res.json({
            success: true,
            message: "Product deleted successfully.",
            product
        });

    } catch (error) {
        console.error("Delete product error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to delete product."
        });
    }
});

module.exports = router;
