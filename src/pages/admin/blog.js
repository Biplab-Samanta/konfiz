
import React, { useState, useEffect, useRef } from "react";
import "../../style/blog/admin_blog.css";

const API_URL = "http://localhost:5000/api/blogs";

// Keep uploaded images below the backend's 12 MB document limit.
// Base64 increases the original image size by approximately 33%.
const MAX_IMAGE_SIZE = 8 * 1024 * 1024;

const initialForm = {
    title: "",
    category: "",
    author: "KONFiZ",
    excerpt: "",
    content: "",
    image: "",
    status: "draft"
};

// Generate SEO-friendly URL slug
const createSlug = (title) => {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
};

function Blog() {
    const [blogs, setBlogs] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [form, setForm] = useState(initialForm);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const imageInputRef = useRef(null);

    // =====================================
    // FETCH ALL BLOGS FROM MONGODB
    // Includes drafts and published blogs
    // =====================================
    const fetchBlogs = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(`${API_URL}/admin/all`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to fetch blogs."
                );
            }

            setBlogs(
                Array.isArray(data)
                    ? data
                    : data.blogs || []
            );

        } catch (err) {
            console.error("Fetch blogs error:", err);
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlogs();
    }, []);

    // =====================================
    // HANDLE TEXT INPUT CHANGES
    // =====================================
    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm(previous => ({
            ...previous,
            [name]: value
        }));
    };

    // =====================================
    // PRODUCT-STYLE IMAGE UPLOAD
    // File -> Base64 -> MongoDB
    // =====================================
    const handleImageChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        // Validate image type
        if (!file.type.startsWith("image/")) {
            alert("Please select a valid image.");
            e.target.value = "";
            return;
        }

        // Validate image size
        if (file.size > MAX_IMAGE_SIZE) {
            alert("Image size must be 8 MB or smaller.");
            e.target.value = "";
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            setForm(previous => ({
                ...previous,
                image: reader.result
            }));
        };

        reader.onerror = () => {
            alert("Unable to read this image. Please try again.");
            e.target.value = "";
        };

        reader.readAsDataURL(file);
    };

    // =====================================
    // REMOVE COVER IMAGE
    // =====================================
    const removeImage = () => {
        setForm(previous => ({
            ...previous,
            image: ""
        }));

        if (imageInputRef.current) {
            imageInputRef.current.value = "";
        }
    };

    // =====================================
    // SAVE BLOG TO MONGODB
    // =====================================
    const saveBlog = async (e) => {
        e.preventDefault();

        if (!form.title.trim() || !form.content.trim()) {
            alert("Blog title and content are required.");
            return;
        }

        try {
            setSaving(true);
            setError("");

            const existingBlog = editingId
                ? blogs.find(blog => blog._id === editingId)
                : null;

            const blogData = {
                ...form,

                slug: existingBlog?.slug || createSlug(form.title)
            };

            const url = editingId
                ? `${API_URL}/${editingId}`
                : API_URL;

            const method = editingId ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(blogData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Unable to save blog."
                );
            }

            alert(
                editingId
                    ? "Blog updated successfully!"
                    : "Blog created successfully!"
            );

            closeForm();

            await fetchBlogs();

        } catch (err) {
            console.error("Save blog error:", err);
            setError(err.message || "Unable to save blog.");
            alert(err.message || "Unable to save blog.");
        } finally {
            setSaving(false);
        }
    };

    // =====================================
    // EDIT BLOG
    // Existing MongoDB image loads in preview
    // =====================================
    const editBlog = (blog) => {
        setForm({
            ...initialForm,
            title: blog.title || "",
            category: blog.category || "",
            author: blog.author || "KONFiZ",
            excerpt: blog.excerpt || "",
            content: blog.content || "",
            image: blog.image || "",
            status: blog.status || "draft"
        });

        setEditingId(blog._id);
        setShowForm(true);

        if (imageInputRef.current) {
            imageInputRef.current.value = "";
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    // =====================================
    // DELETE BLOG FROM MONGODB
    // =====================================
    const deleteBlog = async (id) => {
        if (!window.confirm("Are you sure you want to delete this blog?")) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: "DELETE"
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Unable to delete blog."
                );
            }

            setBlogs(previous =>
                previous.filter(blog => blog._id !== id)
            );

            alert("Blog deleted successfully!");

        } catch (err) {
            console.error("Delete blog error:", err);
            alert(err.message || "Unable to delete blog.");
        }
    };

    // =====================================
    // UPDATE BLOG STATUS
    // =====================================
    const updateStatus = async (id, status) => {
        try {
            const blog = blogs.find(item => item._id === id);

            if (!blog) return;

            const updatedData = {
                ...blog,
                status
            };

            const response = await fetch(`${API_URL}/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updatedData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Unable to update blog status."
                );
            }

            await fetchBlogs();

        } catch (err) {
            console.error("Update status error:", err);
            alert(err.message || "Unable to update blog status.");
        }
    };

    // =====================================
    // OPEN CREATE FORM
    // =====================================
    const openCreateForm = () => {
        setForm(initialForm);
        setEditingId(null);
        setShowForm(true);

        if (imageInputRef.current) {
            imageInputRef.current.value = "";
        }
    };

    // =====================================
    // CLOSE FORM
    // =====================================
    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
        setForm(initialForm);

        if (imageInputRef.current) {
            imageInputRef.current.value = "";
        }
    };

    // =====================================
    // STATISTICS
    // =====================================
    const published = blogs.filter(
        blog => blog.status === "published"
    ).length;

    const drafts = blogs.filter(
        blog => blog.status === "draft"
    ).length;

    // =====================================
    // RENDER
    // =====================================
    return (
        <div className="blog-admin">

            {/* HEADER */}
            <div className="blog-admin-header">
                <div>
                    <span>KONFiZ / CONTENT MANAGEMENT</span>
                    <h2>Blog Management</h2>
                    <p>Create and manage your ice cream stories.</p>
                </div>

                <button
                    type="button"
                    onClick={openCreateForm}
                >
                    + Create Blog
                </button>
            </div>

            {/* ERROR */}
            {error && (
                <div className="blog-error-message">
                    {error}

                    <button
                        type="button"
                        onClick={fetchBlogs}
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* STATISTICS */}
            <div className="blog-stats">
                <div>
                    <span>Total Blogs</span>
                    <h2>{blogs.length}</h2>
                </div>

                <div>
                    <span>Published</span>
                    <h2>{published}</h2>
                </div>

                <div>
                    <span>Drafts</span>
                    <h2>{drafts}</h2>
                </div>
            </div>

            {/* CREATE / EDIT FORM */}
            {showForm && (
                <form
                    className="blog-form"
                    onSubmit={saveBlog}
                >

                    <h3>
                        {editingId ? "Edit Blog" : "Create New Blog"}
                    </h3>

                    <label>Blog Title *</label>
                    <input
                        type="text"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        placeholder="Enter blog title"
                        required
                    />

                    <label>Category</label>
                    <input
                        type="text"
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        placeholder="Ice Cream, Recipes, Tips..."
                    />

                    <label>Author</label>
                    <input
                        type="text"
                        name="author"
                        value={form.author}
                        onChange={handleChange}
                    />

                    <label>Short Description</label>
                    <textarea
                        name="excerpt"
                        value={form.excerpt}
                        onChange={handleChange}
                        placeholder="Write a short blog introduction..."
                    />

                    <label>Blog Content *</label>
                    <textarea
                        className="blog-content-input"
                        name="content"
                        value={form.content}
                        onChange={handleChange}
                        placeholder="Write your complete blog..."
                        required
                    />

                    {/* COVER IMAGE UPLOAD */}
                    <label>Cover Image</label>

                    <input
                        ref={imageInputRef}
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={handleImageChange}
                    />

                    <small>
                        Select an image from your computer. Maximum size: 8 MB.
                    </small>

                    {/* IMAGE PREVIEW */}
                    {form.image && (
                        <div className="blog-upload-preview">

                            <img
                                className="blog-image-preview"
                                src={form.image}
                                alt="Blog cover preview"
                            />

                            <button
                                type="button"
                                onClick={removeImage}
                                disabled={saving}
                            >
                                Remove Image
                            </button>

                        </div>
                    )}

                    <label>Publication Status</label>
                    <select
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                    >
                        <option value="draft">Save as Draft</option>
                        <option value="published">Publish</option>
                    </select>

                    <div className="blog-form-actions">

                        <button
                            type="button"
                            onClick={closeForm}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : editingId
                                    ? "Update Blog"
                                    : "Save Blog"}
                        </button>

                    </div>

                </form>
            )}

            {/* BLOG LIST */}
            <div className="blog-list">

                <h3>All Blog Posts</h3>

                {loading ? (
                    <p>Loading blogs from database...</p>
                ) : blogs.length === 0 ? (
                    <p>No blog posts created yet.</p>
                ) : (

                    blogs.map(blog => (

                        <div
                            className="blog-item"
                            key={blog._id}
                        >

                            {blog.image && (
                                <img
                                    src={blog.image}
                                    alt={blog.title}
                                />
                            )}

                            <div className="blog-item-info">

                                <h3>{blog.title}</h3>

                                <p>{blog.excerpt}</p>

                                <span>
                                    {blog.category || "General"}
                                </span>

                                <span
                                    className={`blog-status ${blog.status}`}
                                >
                                    {blog.status}
                                </span>

                                <small>
                                    /blog/{blog.slug}
                                </small>

                            </div>

                            <div className="blog-item-actions">

                                <button
                                    type="button"
                                    onClick={() => editBlog(blog)}
                                >
                                    Edit
                                </button>

                                <button
                                    type="button"
                                    onClick={() => updateStatus(
                                        blog._id,
                                        blog.status === "published"
                                            ? "draft"
                                            : "published"
                                    )}
                                >
                                    {blog.status === "published"
                                        ? "Unpublish"
                                        : "Publish"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => deleteBlog(blog._id)}
                                >
                                    Delete
                                </button>

                            </div>

                        </div>

                    ))

                )}

            </div>

        </div>
    );
}

export default Blog;
