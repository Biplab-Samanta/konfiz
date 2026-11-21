
import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/authContext";
import { useCart } from "../../context/cartcontext";

function WishlistSection() {
    const { user } = useAuth();
    const { addToCart } = useCart();

    const customerId =
        user?.customerId || user?.id || user?._id;

    const [wishlist, setWishlist] = useState([]);

    const wishlistKey = customerId
        ? `konfiz_wishlist_${customerId}`
        : null;

    useEffect(() => {
        if (!wishlistKey) {
            setWishlist([]);
            return;
        }

        const loadWishlist = () => {
            try {
                const saved = JSON.parse(
                    localStorage.getItem(wishlistKey) || "[]"
                );

                setWishlist(Array.isArray(saved) ? saved : []);
            } catch {
                setWishlist([]);
            }
        };

        loadWishlist();

        window.addEventListener("storage", loadWishlist);
        window.addEventListener(
            "konfiz-wishlist-updated",
            loadWishlist
        );

        return () => {
            window.removeEventListener("storage", loadWishlist);
            window.removeEventListener(
                "konfiz-wishlist-updated",
                loadWishlist
            );
        };
    }, [wishlistKey]);

    // REMOVE FROM WISHLIST
    const removeFromWishlist = (productId) => {
        const updated = wishlist.filter(
            item => String(item.id) !== String(productId)
        );

        localStorage.setItem(
            wishlistKey,
            JSON.stringify(updated)
        );

        setWishlist(updated);

        window.dispatchEvent(
            new Event("konfiz-wishlist-updated")
        );
    };

    // ADD TO CART
    const handleAddToCart = (product) => {
        const price = Number(product.price) || 0;

        addToCart({
            id: `${product.id}__standard__`,
            cartItemId: `${product.id}__standard__`,
            productId: product.id,
            name: product.name,
            image: product.image || null,
            category: product.category || "",
            weight: null,
            unit: "ml",
            addons: [],
            basePrice: price,
            addonPrice: 0,
            price,
            quantity: 1
        });

        alert("Product added to cart!");
    };

    if (!customerId) {
        return <p>Please log in to view your wishlist.</p>;
    }

    return (
        <section className="customer-wishlist">

            <div className="customer-section-header">
                <div>
                    <h2>My Wishlist ♡</h2>
                    <p>Your favourite KONFiZ treats, saved in one place.</p>
                </div>

                <span>{wishlist.length} Saved Items</span>
            </div>

            {wishlist.length === 0 ? (

                <div className="wishlist-empty">
                    <div>♡</div>
                    <h3>Your wishlist is empty!</h3>
                    <p>
                        Save your favourite ice creams
                        and find them here whenever you return.
                    </p>

                    <a href="/products">
                        Explore Ice Creams
                    </a>
                </div>

            ) : (

                <div className="customer-wishlist-grid">

                    {wishlist.map(product => (

                        <article
                            className="customer-wishlist-card"
                            key={product.id}
                        >

                            <div className="wishlist-image">
                                {product.image ? (
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                    />
                                ) : (
                                    <div>🍨</div>
                                )}
                            </div>

                            <div className="wishlist-product-info">

                                <h3>{product.name}</h3>

                                <p>{product.category}</p>

                                <strong>
                                    ₹{Number(product.price || 0).toFixed(2)}
                                </strong>

                                <div className="wishlist-actions">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleAddToCart(product)
                                        }
                                    >
                                        Add to Cart
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeFromWishlist(product.id)
                                        }
                                        aria-label="Remove from wishlist"
                                    >
                                        ♥ Remove
                                    </button>

                                </div>

                            </div>

                        </article>

                    ))}

                </div>

            )}

        </section>
    );
}

export default WishlistSection;
