
import React from "react";
import { useCart } from "../context/cartcontext";
import { useNavigate } from "react-router-dom";
import "../style/cart.css";

function Cart() {

    const {
        cart,
        removeFromCart,
        updateQuantity,
        subTotal,
        cgst,
        sgst,
        igst,
        grandTotal,
        taxType,
        setTaxType
    } = useCart();

    const navigate = useNavigate();

    return (
        <div className="cart-container">

            <h2>My Shopping Cart</h2>

            {cart.length === 0 ? (

                <div className="empty-cart">
                    <h3>Your cart is empty!</h3>
                    <p>Add some delicious ice cream.</p>

                    <button
                        className="checkout-btn"
                        onClick={() => navigate("/products")}
                    >
                        Continue Shopping
                    </button>
                </div>

            ) : (

                <>
                    <div className="cart-items">

                        {cart.map((item) => (

                            <div
                                className="cart-item"
                                key={item.cartItemId || item.id || item.productId}
                            >

                                <div className="cart-details">

                                    <h3>{item.name}</h3>

                                    <p>
                                        Price: ₹{Number(item.price).toFixed(2)}
                                        {item.unit ? ` / ${item.unit}` : ""}
                                    </p>

                                    {item.addons?.length > 0 && (
                                        <p>
                                            Add-ons: {item.addons.map(addon => addon.name).join(", ")}
                                        </p>
                                    )}

                                    {item.weight && (
                                        <p>
                                            Weight: {item.weight} {item.unit}
                                        </p>
                                    )}

                                    <div className="quantity-controls">

                                        <button
                                            onClick={() =>
                                                updateQuantity(
                                                    item.id,
                                                    item.quantity - 1
                                                )
                                            }
                                            disabled={item.quantity <= 1}
                                        >
                                            -
                                        </button>

                                        <span>{item.quantity}</span>

                                        <button
                                            onClick={() =>
                                                updateQuantity(
                                                    item.id,
                                                    item.quantity + 1
                                                )
                                            }
                                        >
                                            +
                                        </button>

                                    </div>

                                    <p>
                                        Subtotal: ₹
                                        {(
                                            Number(item.price) *
                                            Number(item.quantity)
                                        ).toFixed(2)}
                                    </p>

                                </div>

                                <button
                                    className="remove-btn"
                                    onClick={() => removeFromCart(item.id)}
                                >
                                    Remove
                                </button>

                            </div>

                        ))}

                    </div>

                    <div className="cart-summary">

                        <h3>Order Summary</h3>

                        <p>
                            Subtotal: ₹{subTotal.toFixed(2)}
                        </p>

                        <div>
                            <label>GST Type: </label>

                            <select
                                value={taxType}
                                onChange={(e) => setTaxType(e.target.value)}
                            >
                                <option value="intra">
                                    CGST + SGST
                                </option>

                                <option value="inter">
                                    IGST
                                </option>
                            </select>
                        </div>

                        {taxType === "intra" ? (
                            <>
                                <p>CGST: ₹{cgst.toFixed(2)}</p>
                                <p>SGST: ₹{sgst.toFixed(2)}</p>
                            </>
                        ) : (
                            <p>IGST: ₹{igst.toFixed(2)}</p>
                        )}

                        <h2>
                            Grand Total: ₹{grandTotal.toFixed(2)}
                        </h2>

                        <button
                            className="checkout-btn"
                            onClick={() => navigate("/checkout")}
                        >
                            Proceed to Checkout
                        </button>

                    </div>

                </>

            )}

        </div>
    );
}

export default Cart;
