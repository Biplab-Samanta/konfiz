
const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },

        category: {
            type: String,
            default: "General",
            trim: true
        },

        author: {
            type: String,
            default: "KONFiZ",
            trim: true
        },

        excerpt: {
            type: String,
            default: "",
            trim: true
        },

        content: {
            type: String,
            required: true
        },

        image: {
            type: String,
            default: ""
        },

        imageAlt: {
            type: String,
            default: ""
        },

        status: {
            type: String,
            enum: ["draft", "published"],
            default: "draft"
        },

        publishedAt: {
            type: Date,
            default: null
        },

        seo: {
            metaTitle: {
                type: String,
                default: "",
                trim: true
            },

            metaDescription: {
                type: String,
                default: "",
                trim: true
            },

            keywords: {
                type: [String],
                default: []
            }
        }
    },
    {
        timestamps: true,
        collection: "blogs"
    }
);

const Blog =
    mongoose.models.Blog ||
    mongoose.model("Blog", blogSchema);

module.exports = Blog;
