
import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/cartcontext";
import Navbar from "../components/navber";
import "../style/cart.css";

function Cart() {

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

  return (

    <>
      <Navbar />

      <div className="cart-container">

        <div className="cart-heading">

          <div>
            <h2>My Shopping Cart</h2>

            <p>
              {totalQuantity} item(s) in your cart
            </p>
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
              🛒
            </div>

            <h3>Your cart is empty!</h3>

            <p>
              Looks like you haven't added any
              delicious ice cream yet.
            </p>

            <button
              className="checkout-btn"
              onClick={() => navigate("/products")}
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

                    {/* IMAGE */}

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

                    {/* DETAILS */}

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

                          {item.addons.map((addon) => (

                            <span key={addon.id}>
                              {addon.name} (+₹
                              {formatPrice(addon.price)})
                            </span>

                          ))}

                        </div>

                      )}

                      {/* QUANTITY */}

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
                        Item Total: ₹
                        {formatPrice(itemSubtotal)}
                      </p>

                    </div>

                    {/* REMOVE */}

                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() =>
                        removeFromCart(item.id)
                      }
                    >
                      Remove
                    </button>

                  </div>

                );

              })}

              <button
                className="continue-shopping-btn"
                onClick={() => navigate("/products")}
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
                  onChange={(e) =>
                    setTaxType(e.target.value)
                  }
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

                <strong>
                  ₹{formatPrice(grandTotal)}
                </strong>

              </div>

              <button
                className="checkout-btn"
                onClick={() => navigate("/checkout")}
              >
                Proceed to Checkout →
              </button>

              <p className="cart-note">
                Your selected sizes and add-ons
                are saved in your cart.
              </p>

            </div>

          </div>

        )}

      </div>

    </>

  );

}

export default Cart;
