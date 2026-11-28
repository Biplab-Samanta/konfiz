
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/navber"
import "../style/blog/blog_list.css";

const API_URL = "http://localhost:5000/api";

const BlogList = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    // =====================================
    // FETCH PUBLISHED BLOGS
    // =====================================
    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(`${API_URL}/blogs`);

                if (!response.ok) {
                    throw new Error("Unable to load blogs.");
                }

                const result = await response.json();

                // Supports either an array or { blogs: [...] }
                const blogData = Array.isArray(result)
                    ? result
                    : result.blogs || [];

                // Only show published blogs on customer website
                setBlogs(
                    blogData.filter(
                        (blog) => blog.status === "published"
                    )
                );
            } catch (err) {
                console.error("Blog fetch error:", err);
                setError("Unable to load blogs. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, []);

    // =====================================
    // GET CATEGORIES
    // =====================================
    const categories = useMemo(() => {
        const uniqueCategories = [
            ...new Set(
                blogs
                    .map((blog) => blog.category)
                    .filter(Boolean)
            ),
        ];

        return ["All", ...uniqueCategories];
    }, [blogs]);

    // =====================================
    // FILTER BLOGS
    // =====================================
    const filteredBlogs = useMemo(() => {
        return blogs.filter((blog) => {
            const matchesCategory =
                selectedCategory === "All" ||
                blog.category === selectedCategory;

            const searchText = search.toLowerCase().trim();

            const matchesSearch =
                !searchText ||
                blog.title?.toLowerCase().includes(searchText) ||
                blog.excerpt?.toLowerCase().includes(searchText) ||
                blog.category?.toLowerCase().includes(searchText);

            return matchesCategory && matchesSearch;
        });
    }, [blogs, selectedCategory, search]);

    // =====================================
    // FORMAT DATE
    // =====================================
    const formatDate = (date) => {
        if (!date) return "";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    // =====================================
    // BLOG IMAGE
    // =====================================
    const getImage = (blog) => {
        return blog.image || "/images/blog-placeholder.jpg";
    };

    return (
        <main className="blog-page">
<Navbar />
            {/* =====================================
                BLOG HERO
            ===================================== */}
            <section className="blog-hero">
                <div className="blog-hero-content">
                    <span className="blog-hero-label">
                        KONFiZ JOURNAL
                    </span>

                    <h1>Our Blog</h1>

                    <p>
                        Discover delicious stories, ice cream inspiration,
                        flavour guides and everything that makes life sweeter.
                    </p>
                </div>
            </section>

            {/* =====================================
                BLOG CONTENT
            ===================================== */}
            <section className="blog-container">

                <div className="blog-section-heading">
                    <div>
                        <span className="blog-subtitle">
                            STORIES & INSPIRATION
                        </span>

                        <h2>Explore Our Latest Stories</h2>
                    </div>

                    <span className="blog-count">
                        {blogs.length} Articles
                    </span>
                </div>

                {/* SEARCH */}
                <div className="blog-toolbar">

                    <div className="blog-search">
                        <span>⌕</span>

                        <input
                            type="text"
                            placeholder="Search articles..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                </div>

                {/* CATEGORY FILTER */}
                <div className="blog-categories">
                    {categories.map((category) => (
                        <button
                            key={category}
                            type="button"
                            className={
                                selectedCategory === category
                                    ? "active"
                                    : ""
                            }
                            onClick={() => setSelectedCategory(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* LOADING */}
                {loading && (
                    <div className="blog-message">
                        <div className="blog-loader"></div>
                        <p>Loading delicious stories...</p>
                    </div>
                )}

                {/* ERROR */}
                {!loading && error && (
                    <div className="blog-message blog-error">
                        <p>{error}</p>

                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* EMPTY */}
                {!loading && !error && filteredBlogs.length === 0 && (
                    <div className="blog-message">
                        <h3>No blogs found</h3>
                        <p>
                            Try another search or category.
                        </p>
                    </div>
                )}

                {/* BLOG GRID */}
                {!loading && !error && filteredBlogs.length > 0 && (
                    <div className="blog-grid">

                        {filteredBlogs.map((blog) => (
                            <article
                                className="blog-card"
                                key={blog._id || blog.slug}
                            >

                                <Link
                                    to={`/blog/${blog.slug}`}
                                    className="blog-card-image-link"
                                >
                                    <div className="blog-card-image">
                                        <img
                                            src={getImage(blog)}
                                            alt={
                                                blog.imageAlt ||
                                                blog.title ||
                                                "KONFiZ blog article"
                                            }
                                            loading="lazy"
                                        />

                                        {blog.category && (
                                            <span className="blog-card-category">
                                                {blog.category}
                                            </span>
                                        )}
                                    </div>
                                </Link>

                                <div className="blog-card-content">

                                    <div className="blog-card-meta">
                                        <span>
                                            {formatDate(
                                                blog.publishedAt ||
                                                blog.createdAt
                                            )}
                                        </span>

                                        {blog.author && (
                                            <>
                                                <span>•</span>
                                                <span>{blog.author}</span>
                                            </>
                                        )}
                                    </div>

                                    <h3>
                                        <Link to={`/blog/${blog.slug}`}>
                                            {blog.title}
                                        </Link>
                                    </h3>

                                    <p>
                                        {blog.excerpt}
                                    </p>

                                    <Link
                                        to={`/blog/${blog.slug}`}
                                        className="blog-read-more"
                                    >
                                        Read More <span>→</span>
                                    </Link>

                                </div>
                            </article>
                        ))}

                    </div>
                )}

            </section>
        </main>
    );
};

export default BlogList;
