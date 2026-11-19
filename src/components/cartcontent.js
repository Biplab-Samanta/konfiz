
import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/cartcontext";
import DynamicIcon from "./dynamicIcon";

function CartContent({ onClose, drawer = false }) {

    const navigate = useNavigate();

    const {
        cart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        totalQuantity,
        subTotal,
        cgst,
        sgst,
        igst,
        grandTotal,
        taxType,
        setTaxType
    } = useCart();

    const formatPrice = (price) =>
        Number(price || 0).toFixed(2);

    const goTo = (path) => {
        onClose?.();
        navigate(path);
    };

    return (

        <div className={`cart-container ${drawer ? "drawer-cart-container" : ""}`}>

            <div className="cart-heading">

                <div>
                    <h2>{drawer ? "Your Shopping Cart" : "My Shopping Cart"}</h2>

                    <p>{totalQuantity} item(s) in your cart</p>
                </div>

                {cart.length > 0 && (
                    <button
                        className="clear-cart-btn"
                        onClick={clearCart}
                    >
                        Clear Cart
                    </button>
                )}

            </div>

            {cart.length === 0 ? (

                <div className="empty-cart">

                    <div className="empty-cart-icon">
                        <DynamicIcon name="cart" size={55} />
                    </div>

                    <h3>Your cart is empty!</h3>

                    <p>
                        Looks like you haven't added any
                        delicious ice cream yet.
                    </p>

                    <button
                        className="checkout-btn"
                        onClick={() => goTo("/products")}
                    >
                        Explore Ice Creams
                    </button>

                </div>

            ) : (

                <div className="cart-layout">

                    {/* CART PRODUCTS */}

                    <div className="cart-items">

                        {cart.map((item) => {

                            const itemSubtotal =
                                Number(item.price || 0) *
                                Number(item.quantity || 0);

                            return (

                                <div
                                    className="cart-item"
                                    key={item.cartItemId || item.id}
                                >

                                    <div className="cart-image">

                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                            />
                                        ) : (
                                            <span>🍨</span>
                                        )}

                                    </div>

                                    <div className="cart-details">

                                        <h3>{item.name}</h3>

                                        <p className="cart-price">
                                            ₹{formatPrice(item.price)}
                                        </p>

                                        {item.weight !== null &&
                                            item.weight !== undefined && (
                                                <p className="cart-meta">
                                                    Size: {item.weight} {item.unit}
                                                </p>
                                            )}

                                        {item.addons?.length > 0 && (

                                            <div className="cart-addons">

                                                <strong>Selected Add-ons:</strong>

                                                {item.addons.map((addon, index) => (
                                                    <span key={addon.id || index}>
                                                        {addon.name} (+₹
                                                        {formatPrice(addon.price)})
                                                    </span>
                                                ))}

                                            </div>

                                        )}

                                        <div className="quantity-controls">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    decreaseQuantity(item.id)
                                                }
                                                aria-label="Decrease quantity"
                                            >
                                                −
                                            </button>

                                            <span>{item.quantity}</span>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    increaseQuantity(item.id)
                                                }
                                                aria-label="Increase quantity"
                                            >
                                                +
                                            </button>

                                        </div>

                                        <p className="item-subtotal">
                                            Item Total: ₹{formatPrice(itemSubtotal)}
                                        </p>

                                    </div>

                                    <button
                                        type="button"
                                        className="remove-btn"
                                        onClick={() => removeFromCart(item.id)}
                                    >
                                        Remove
                                    </button>

                                </div>

                            );

                        })}

                        <button
                            className="continue-shopping-btn"
                            onClick={() => goTo("/products")}
                        >
                            ← Continue Shopping
                        </button>

                    </div>

                    {/* ORDER SUMMARY */}

                    <div className="cart-page cart-summary">

                        <h3>Order Summary</h3>

                        <div className="summary-row">
                            <span>Total Items</span>
                            <strong>{totalQuantity}</strong>
                        </div>

                        <div className="summary-row">
                            <span>Subtotal</span>
                            <strong>₹{formatPrice(subTotal)}</strong>
                        </div>

                        <div className="gst-selector">

                            <label>GST Type</label>

                            <select
                                value={taxType}
                                onChange={(e) => setTaxType(e.target.value)}
                            >
                                <option value="intra">CGST + SGST</option>
                                <option value="inter">IGST</option>
                            </select>

                        </div>

                        {taxType === "intra" ? (

                            <>
                                <div className="summary-row">
                                    <span>CGST</span>
                                    <strong>₹{formatPrice(cgst)}</strong>
                                </div>

                                <div className="summary-row">
                                    <span>SGST</span>
                                    <strong>₹{formatPrice(sgst)}</strong>
                                </div>
                            </>

                        ) : (

                            <div className="summary-row">
                                <span>IGST</span>
                                <strong>₹{formatPrice(igst)}</strong>
                            </div>

                        )}

                        <div className="summary-total">
                            <span>Grand Total</span>
                            <strong>₹{formatPrice(grandTotal)}</strong>
                        </div>

                        <button
                            className="checkout-btn"
                            onClick={() => goTo("/checkout")}
                        >
                            Proceed to Checkout →
                        </button>

                        <p className="cart-note">
                            Your selected sizes and add-ons are saved in your cart.
                        </p>

                    </div>

                </div>

            )}

        </div>

    );
}

export default CartContent;
