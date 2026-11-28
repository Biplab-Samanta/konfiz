
const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();
// const Blog = require("./models/Blog");
const Blog = require("./models/Blog.js");

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

const MAX_BLOG_SIZE = 12 * 1024 * 1024;

const getDocumentSize = (data) =>
    Buffer.byteLength(JSON.stringify(data), "utf8");

const createSlug = (title) =>
    String(title || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

const validateBlog = (data) => {
    if (
        !data ||
        typeof data.title !== "string" ||
        !data.title.trim()
    ) {
        return "Blog title is required.";
    }

    if (
        typeof data.content !== "string" ||
        !data.content.trim()
    ) {
        return "Blog content is required.";
    }

    if (
        data.status !== undefined &&
        !["draft", "published"].includes(data.status)
    ) {
        return "Invalid blog status.";
    }

    return null;
};

// =====================================
// GET PUBLISHED BLOGS
// GET /api/blogs
// Customer website
// =====================================

router.get("/", async (req, res) => {
    try {
        if (!checkDatabase(res)) return;

        const blogs = await Blog.find({
            status: "published"
        })
            .sort({ publishedAt: -1, createdAt: -1 })
            .select("-content");

        return res.json({
            success: true,
            count: blogs.length,
            blogs
        });

    } catch (error) {
        console.error("Get published blogs error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve blogs."
        });
    }
});

// =====================================
// GET ALL BLOGS
// GET /api/blogs/admin/all
// Admin dashboard
// =====================================

router.get("/admin/all", async (req, res) => {
    try {
        if (!checkDatabase(res)) return;

        const blogs = await Blog.find().sort({
            createdAt: -1,
            _id: -1
        });

        return res.json({
            success: true,
            count: blogs.length,
            blogs
        });

    } catch (error) {
        console.error("Get all blogs error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve blogs."
        });
    }
});

// =====================================
// GET BLOG BY SEO SLUG
// GET /api/blogs/slug/:slug
// Blog details page
// =====================================

router.get("/slug/:slug", async (req, res) => {
    try {
        if (!checkDatabase(res)) return;

        const blog = await Blog.findOne({
            slug: req.params.slug,
            status: "published"
        });

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found."
            });
        }

        return res.json({
            success: true,
            blog
        });

    } catch (error) {
        console.error("Get blog by slug error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve blog."
        });
    }
});

// =====================================
// CREATE BLOG
// POST /api/blogs
// =====================================

router.post("/", async (req, res) => {
    try {
        if (!checkDatabase(res)) return;

        const validationError = validateBlog(req.body);

        if (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError
            });
        }

        const blogData = { ...req.body };

        delete blogData._id;
        delete blogData.__v;
        delete blogData.createdAt;
        delete blogData.updatedAt;

        blogData.title = blogData.title.trim();
        blogData.slug = createSlug(blogData.slug || blogData.title);

        if (!blogData.slug) {
            return res.status(400).json({
                success: false,
                message: "A valid blog slug is required."
            });
        }

        if (!["draft", "published"].includes(blogData.status)) {
            blogData.status = "draft";
        }

        if (blogData.status === "published" && !blogData.publishedAt) {
            blogData.publishedAt = new Date();
        }

        if (blogData.status === "draft") {
            blogData.publishedAt = null;
        }

        if (getDocumentSize(blogData) > MAX_BLOG_SIZE) {
            return res.status(413).json({
                success: false,
                message: "Blog data is too large. Store images separately."
            });
        }

        const blog = await Blog.create(blogData);

        return res.status(201).json({
            success: true,
            message: "Blog created successfully.",
            blog
        });

    } catch (error) {
        console.error("Create blog error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "This blog URL slug already exists."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Unable to create blog.",
            error: error.message
        });
    }
});

// =====================================
// UPDATE BLOG
// PUT /api/blogs/:id
// =====================================

router.put("/:id", async (req, res) => {
    try {
        if (!checkDatabase(res)) return;

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid blog ID."
            });
        }

        const updates = { ...req.body };

        delete updates._id;
        delete updates.__v;
        delete updates.createdAt;

        if (updates.title !== undefined) {
            if (
                typeof updates.title !== "string" ||
                !updates.title.trim()
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Blog title cannot be empty."
                });
            }

            updates.title = updates.title.trim();
        }

        if (updates.slug !== undefined) {
            updates.slug = createSlug(updates.slug);

            if (!updates.slug) {
                return res.status(400).json({
                    success: false,
                    message: "A valid blog slug is required."
                });
            }
        }

        if (
            updates.status !== undefined &&
            !["draft", "published"].includes(updates.status)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid blog status."
            });
        }

        if (
            updates.status === "published" &&
            !updates.publishedAt
        ) {
            updates.publishedAt = new Date();
        }

        if (updates.status === "draft") {
            updates.publishedAt = null;
        }

        if (getDocumentSize(updates) > MAX_BLOG_SIZE) {
            return res.status(413).json({
                success: false,
                message: "Blog data is too large."
            });
        }

        const blog = await Blog.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            {
                new: true,
                runValidators: true
            }
        );

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found."
            });
        }

        return res.json({
            success: true,
            message: "Blog updated successfully.",
            blog
        });

    } catch (error) {
        console.error("Update blog error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "This blog URL slug already exists."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Unable to update blog.",
            error: error.message
        });
    }
});

// =====================================
// DELETE BLOG function is hare from db
// =====================================

router.delete("/:id", async (req, res) => {
    try {
        if (!checkDatabase(res)) return;

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid blog ID."
            });
        }

        const blog = await Blog.findByIdAndDelete(req.params.id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found."
            });
        }

        return res.json({
            success: true,
            message: "Blog deleted successfully."
        });

    } catch (error) {
        console.error("Delete blog error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to delete blog."
        });
    }
});

module.exports = router;
