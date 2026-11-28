
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/navber"
import "../style/blog/blog-details.css";

const API_URL = "http://localhost:5000/api/blogs";

function BlogDetails() {
    const { slug } = useParams();

    const [blog, setBlog] = useState(null);
    const [relatedBlogs, setRelatedBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =====================================
    // FETCH BLOG USING URL SLUG
    // =====================================
    useEffect(() => {
        const controller = new AbortController();

        const fetchBlog = async () => {
            try {
                setLoading(true);
                setError("");
                setBlog(null);

                const response = await fetch(
                    `${API_URL}/slug/${encodeURIComponent(slug)}`,
                    { signal: controller.signal }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Blog not found."
                    );
                }

                const currentBlog = data.blog;

                if (!currentBlog) {
                    throw new Error("Blog not found.");
                }

                setBlog(currentBlog);

                // Fetch published blogs for related articles
                const relatedResponse = await fetch(API_URL, {
                    signal: controller.signal
                });

                if (relatedResponse.ok) {
                    const relatedData = await relatedResponse.json();

                    const allBlogs = Array.isArray(relatedData)
                        ? relatedData
                        : relatedData.blogs || [];

                    setRelatedBlogs(
                        allBlogs
                            .filter(item =>
                                item.slug !== currentBlog.slug
                            )
                            .slice(0, 3)
                    );
                }

            } catch (err) {
                if (err.name !== "AbortError") {
                    console.error("Blog details error:", err);
                    setError(err.message || "Unable to load blog.");
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchBlog();

        return () => controller.abort();
    }, [slug]);

    // =====================================
    // SEO META TAGS
    // =====================================
    useEffect(() => {
        if (!blog) return;

        const previousTitle = document.title;

        const metaDescription = document.querySelector(
            'meta[name="description"]'
        );

        const previousDescription =
            metaDescription?.getAttribute("content") || "";

        const description =
            blog.seo?.metaDescription ||
            blog.excerpt ||
            blog.title;

        document.title =
            blog.seo?.metaTitle ||
            `${blog.title} | KONFiZ`;

        let descriptionTag = metaDescription;

        if (!descriptionTag) {
            descriptionTag = document.createElement("meta");
            descriptionTag.setAttribute("name", "description");
            document.head.appendChild(descriptionTag);
        }

        descriptionTag.setAttribute("content", description);

        // Canonical URL
        let canonical = document.querySelector(
            'link[rel="canonical"]'
        );

        const createdCanonical = !canonical;

        if (!canonical) {
            canonical = document.createElement("link");
            canonical.setAttribute("rel", "canonical");
            document.head.appendChild(canonical);
        }

        const previousCanonical = canonical.getAttribute("href");

        canonical.setAttribute(
            "href",
            `${window.location.origin}/blog/${blog.slug}`
        );

        return () => {
            document.title = previousTitle;

            if (metaDescription) {
                metaDescription.setAttribute(
                    "content",
                    previousDescription
                );
            } else {
                descriptionTag.remove();
            }

            if (createdCanonical) {
                canonical.remove();
            } else if (previousCanonical) {
                canonical.setAttribute("href", previousCanonical);
            } else {
                canonical.removeAttribute("href");
            }
        };
    }, [blog]);

    // =====================================
    // DATE FORMAT
    // =====================================
    const formatDate = (date) => {
        if (!date) return "";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    };

    // =====================================
    // LOADING
    // =====================================
    if (loading) {
        return (
            <div className="blog-details-message">
                <div className="blog-loader"></div>
                <p>Loading blog...</p>
            </div>
        );
    }

    // =====================================
    // ERROR / NOT FOUND
    // =====================================
    if (error || !blog) {
        return (
            <div className="blog-details-message">
                <h2>Blog Not Found</h2>
                <p>{error || "This blog may have been removed or is unavailable."}</p>

                <Link to="/blog" className="blog-back-button">
                    Back to Blogs
                </Link>
            </div>
        );
    }

    // =====================================
    // BLOG DETAILS PAGE
    // =====================================
    return (
       
        <div className="blog-details-page">

        <Navbar />
      
            {/* BREADCRUMB */}
            <div className="blog-breadcrumb">
                <Link to="/">Home</Link>
                <span>/</span>
                <Link to="/blog">Blog</Link>
                <span>/</span>
                <span>{blog.title}</span>
            </div>

            {/* ARTICLE HEADER */}
            <article className="blog-article">

                <header className="blog-article-header">

                    <span className="blog-article-category">
                        {blog.category || "General"}
                    </span>

                    <h1>{blog.title}</h1>

                    {blog.excerpt && (
                        <p className="blog-article-excerpt">
                            {blog.excerpt}
                        </p>
                    )}

                    <div className="blog-article-meta">
                        <span>
                            By {blog.author || "KONFiZ"}
                        </span>

                        <span>
                            {formatDate(
                                blog.publishedAt || blog.createdAt
                            )}
                        </span>
                    </div>

                </header>

                {/* COVER IMAGE */}
                {blog.image && (
                    <div className="blog-article-cover">
                        <img
                            src={blog.image}
                            alt={blog.imageAlt || blog.title}
                        />
                    </div>
                )}

                {/* FULL BLOG CONTENT */}
                <div className="blog-article-content">
                    {blog.content}
                </div>

            </article>

            {/* RELATED BLOGS */}
            {relatedBlogs.length > 0 && (
                <section className="related-blogs">

                    <div className="related-blogs-heading">
                        <span>EXPLORE MORE</span>
                        <h2>Related Stories</h2>
                    </div>

                    <div className="related-blogs-grid">

                        {relatedBlogs.map(item => (
                            <Link
                                to={`/blog/${item.slug}`}
                                className="related-blog-card"
                                key={item._id}
                            >

                                {item.image && (
                                    <img
                                        src={item.image}
                                        alt={item.imageAlt || item.title}
                                    />
                                )}

                                <div className="related-blog-info">

                                    <span>
                                        {item.category || "General"}
                                    </span>

                                    <h3>{item.title}</h3>

                                    <p>
                                        {item.excerpt}
                                    </p>

                                    <strong>
                                        Read More →
                                    </strong>

                                </div>

                            </Link>
                        ))}

                    </div>

                </section>
            )}

            {/* BACK TO BLOG */}
            <div className="blog-details-footer">
                <Link to="/blog">
                    ← Back to All Blogs
                </Link>
            </div>

        </div>
    );
}

export default BlogDetails;
