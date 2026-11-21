
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/navber";
import { useCart } from "../context/cartcontext";
import { useAuth } from "../context/authContext";

import "../style/checkout.css";

function Checkout() {
    const navigate = useNavigate();

    // Get logged-in customer
    const { user } = useAuth();

    // Get customer ID
    const customerId =
        user?.customerId ||
        user?.id ||
        user?._id ||
        user?.userId;

    const {
        cart = [],
        clearCart,
        subTotal = 0,
        cgst = 0,
        sgst = 0,
        igst = 0,
        grandTotal = 0,
        taxType = "intra"
    } = useCart();

    // Keep the rest of your existing state and functions here

    // =====================================
    // STATES
    // =====================================

    const [paymentMethod, setPaymentMethod] = useState("cod");

    const [orderPlaced, setOrderPlaced] = useState(false);
    const [orderId, setOrderId] = useState("");
    const [confirmedOrder, setConfirmedOrder] = useState(null);

    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState("");
    const [otpVerified, setOtpVerified] = useState(false);
    const [demoOtp, setDemoOtp] = useState("");

    const [otpMessage, setOtpMessage] = useState("");
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        mobile: "",
        address: "",
        city: "",
        state: "",
        pincode: ""
    });

    // =====================================
    // AUTO REDIRECT AFTER ORDER
    // =====================================

    useEffect(() => {
        if (!orderPlaced) return;

        const timer = setTimeout(() => {
            navigate("/products");
        }, 3000);

        return () => clearTimeout(timer);
    }, [orderPlaced, navigate]);

    // =====================================
    // PRICE HELPERS
    // =====================================

    const formatPrice = (price) => {
        return `₹${Number(price || 0).toFixed(2)}`;
    };

    const getQuantity = (item) => {
        return Number(item.quantity || item.qty || 1);
    };

    const getPrice = (item) => {
        return Number(item.price || item.finalPrice || 0);
    };

    const getItemName = (item) => {
        return item.name || item.productName || "Ice Cream";
    };

    const getItemImage = (item) => {
        return item.image || item.img || "";
    };

    const getItemSize = (item) => {
        return (
            item.selectedSize ||
            item.size ||
            item.weight ||
            "Regular"
        );
    };

    const subtotal = Number(subTotal) ||
        cart.reduce((sum, item) => {
            return sum + getPrice(item) * getQuantity(item);
        }, 0);

    const cgstAmount = Number(cgst);
    const sgstAmount = Number(sgst);
    const igstAmount = Number(igst);

    const tax = taxType === "inter"
        ? igstAmount
        : cgstAmount + sgstAmount;

    const total = Number(grandTotal) ||
        subtotal + tax;

    const totalItems = cart.reduce((sum, item) => {
        return sum + getQuantity(item);
    }, 0);

    // =====================================
    // FORM CHANGE
    // =====================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        setError("");

        // Reset OTP if mobile number changes
        if (name === "mobile") {
            setOtpSent(false);
            setOtpVerified(false);
            setOtp("");
            setDemoOtp("");
            setOtpMessage("");
        }
    };

    // =====================================
    // VALIDATE DELIVERY INFORMATION
    // =====================================

    const validateDeliveryDetails = () => {

        if (!formData.name.trim()) {
            setError("Please enter your full name.");
            return false;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setError("Please enter a valid email address.");
            return false;
        }

        if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
            setError("Enter a valid 10-digit Indian mobile number.");
            return false;
        }

        if (!formData.address.trim() ||
            formData.address.trim().length < 10) {
            setError("Please enter your complete delivery address.");
            return false;
        }

        if (!formData.city.trim()) {
            setError("Please enter your city.");
            return false;
        }

        if (!formData.state.trim()) {
            setError("Please enter your state.");
            return false;
        }

        if (!/^\d{6}$/.test(formData.pincode)) {
            setError("Please enter a valid 6-digit PIN code.");
            return false;
        }

        return true;
    };

    // =====================================
    // SEND DEMO OTP
    // =====================================

    const handleSendOTP = () => {

        setError("");
        setOtpMessage("");

        if (!validateDeliveryDetails()) {
            return;
        }

        if (!cart.length) {
            setError("Your cart is empty. Please add products first.");
            return;
        }

        // DEMO OTP ONLY
        // No real SMS is sent.
        setDemoOtp("123456");

        setOtp("");
        setOtpSent(true);
        setOtpVerified(false);

        setOtpMessage(
            "Demo OTP: 123456. No real SMS has been sent."
        );
    };

    // =====================================
    // VERIFY OTP
    // =====================================

    const handleVerifyOTP = () => {

        if (!otpSent) {
            setOtpMessage("Please request an OTP first.");
            return;
        }

        if (otp.length !== 6) {
            setOtpMessage("Please enter the complete 6-digit OTP.");
            return;
        }

        if (otp === demoOtp) {

            setOtpVerified(true);
            setOtpMessage("Mobile number verified successfully!");
            setError("");

        } else {

            setOtpVerified(false);
            setOtpMessage("Incorrect OTP. Please try again.");

        }
    };

    // =====================================
    // RESEND OTP
    // =====================================

    const handleResendOTP = () => {

        setOtp("");
        setDemoOtp("123456");
        setOtpVerified(false);

        setOtpMessage(
            "New demo OTP: 123456. No SMS has been sent."
        );
    };

    // =====================================
    // PLACE ORDER
    // =====================================

    const handlePlaceOrder = (e) => {

        e.preventDefault();

        setError("");

        if (!cart.length) {
            setError("Your cart is empty.");
            return;
        }

        if (!validateDeliveryDetails()) {
            return;
        }
        if (!customerId) {
            setError("Please log in to your customer account before placing an order.");
            return;
        }
        if (!otpVerified) {
            setError(
                "Please verify your mobile number before placing your order."
            );
            return;
        }

        // Generate order ID
        const generatedOrderId = "KON-ORD-" + Date.now();

        // Save order details before clearing cart



        const order = {
            orderId: generatedOrderId,

            // Customer identification
            customerId: customerId,
            customerName: user?.name || formData.name,
            customerEmail: user?.email || formData.email,
            customerMobile: user?.mobile || formData.mobile,

            // Delivery information
            customer: {
                ...formData
            },

            // Products
            items: cart.map(item => ({
                ...item,
                quantity: getQuantity(item),
                price: getPrice(item),
                productName: getItemName(item),
                selectedSize: getItemSize(item)
            })),

            // Price details
            subtotal: subtotal,
            cgst: taxType === "intra" ? cgstAmount : 0,
            sgst: taxType === "intra" ? sgstAmount : 0,
            igst: taxType === "inter" ? igstAmount : 0,
            tax: tax,
            total: total,
            grandTotal: total,
            totalAmount: total,

            // Payment information
            paymentMethod: paymentMethod,
            paymentStatus:
                paymentMethod === "cod"
                    ? "Pending"
                    : "Demo - Not Paid",

            // Order status
            status: "Confirmed",
            orderStatus: "Confirmed",

            mobileVerified: true,

            orderDate: new Date().toISOString(),
            createdAt: new Date().toISOString()
        };


        // Save in localStorage
        try {
            const existingOrders = JSON.parse(
                localStorage.getItem("konfizOrders") || "[]"
            );

            if (!Array.isArray(existingOrders)) {
                throw new Error("Invalid orders storage");
            }

            const updatedOrders = [...existingOrders, order];

            localStorage.setItem(
                "konfizOrders",
                JSON.stringify(updatedOrders)
            );

        } catch (storageError) {
            console.error("Order saving error:", storageError);

            setError("Unable to save your order. Please try again.");
            return;
        }

        // Store confirmed order snapshot
        setConfirmedOrder(order);

        setOrderId(generatedOrderId);

        // Clear cart after successful order creation
        if (clearCart) {
            clearCart();
        }

        // Show Thank You popup
        setOrderPlaced(true);
    };

    // =====================================
    // THANK YOU POPUP
    // =====================================

    if (orderPlaced && confirmedOrder) {

        return (
            <>
                <Navbar />

                <div className="thankyou-overlay">

                    <div className="thankyou-popup">

                        <div className="thankyou-icon">
                            🍦
                        </div>

                        <div className="thankyou-check">
                            ✓
                        </div>

                        <h1>Thank You!</h1>

                        <h2>
                            Thank You for Choosing KONFiZ ❤️
                        </h2>

                        <p>
                            Your order has been successfully confirmed.
                        </p>

                        <p className="delivery-message">
                            Your delicious ice cream will be delivered
                            soon. Get ready for a scoop of happiness!
                        </p>

                        <div className="thankyou-order">

                            <span>YOUR ORDER ID</span>

                            <strong>{orderId}</strong>

                        </div>

                        <div className="thankyou-delivery">
                            🚚 Your delivery will arrive soon!
                        </div>

                        <div className="thankyou-total">
                            Order Total:
                            <strong>
                                {formatPrice(confirmedOrder.total)}
                            </strong>
                        </div>

                        <button
                            type="button"
                            className="thankyou-button"
                            onClick={() => navigate("/products")}
                        >
                            Order More Ice Cream 🍨
                        </button>

                        <p className="redirect-message">
                            Redirecting to products in 3 seconds...
                        </p>

                    </div>

                </div>
            </>
        );
    }

    // =====================================
    // EMPTY CART
    // =====================================

    if (!cart.length) {
        return (
            <>
                <Navbar />

                <div className="checkout-empty">

                    <div>
                        <div className="empty-cart-icon">
                            🛒
                        </div>

                        <h2>Your Cart Is Empty</h2>

                        <p>
                            Add some delicious ice cream before checkout.
                        </p>

                        <button
                            onClick={() => navigate("/products")}
                            className="checkout-primary-btn"
                        >
                            Explore Ice Cream 🍦
                        </button>
                    </div>

                </div>
            </>
        );
    }

    // =====================================
    // CHECKOUT PAGE
    // =====================================

    return (
        <>
            <Navbar />

            <div className="checkout-page">

                {/* HEADER */}

                <div className="checkout-heading">

                    <span>KONFiZ ICE CREAM & HAPPINESS</span>

                    <h1>Complete Your Order</h1>

                    <p>
                        Almost there! Your happiness is just one step away.
                    </p>

                </div>

                <div className="checkout-layout">

                    {/* LEFT SIDE */}

                    <div className="checkout-left">

                        <form onSubmit={handlePlaceOrder}>

                            {/* DELIVERY INFORMATION */}

                            <section className="checkout-section">

                                <h2>
                                    <span>01</span>
                                    Delivery Information
                                </h2>

                                <p className="section-description">
                                    Where should we deliver your happiness?
                                </p>

                                <div className="checkout-form-grid">

                                    <div className="checkout-field">
                                        <label>Full Name *</label>

                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Enter your full name"
                                            required
                                        />
                                    </div>

                                    <div className="checkout-field">
                                        <label>Email Address *</label>

                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="example@email.com"
                                            required
                                        />
                                    </div>

                                    <div className="checkout-field">
                                        <label>Mobile Number *</label>

                                        <div className="mobile-input-wrapper">

                                            <span>+91</span>

                                            <input
                                                type="tel"
                                                name="mobile"
                                                maxLength="10"
                                                inputMode="numeric"
                                                value={formData.mobile}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/\D/g, "");
                                                    handleChange({
                                                        target: {
                                                            name: "mobile",
                                                            value
                                                        }
                                                    });
                                                }}
                                                placeholder="10-digit mobile number"
                                                required
                                            />

                                        </div>
                                    </div>

                                    <div className="checkout-field">
                                        <label>PIN Code *</label>

                                        <input
                                            type="text"
                                            name="pincode"
                                            maxLength="6"
                                            inputMode="numeric"
                                            value={formData.pincode}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, "");
                                                handleChange({
                                                    target: {
                                                        name: "pincode",
                                                        value
                                                    }
                                                });
                                            }}
                                            placeholder="6-digit PIN code"
                                            required
                                        />
                                    </div>

                                    <div className="checkout-field full-width">
                                        <label>Full Delivery Address *</label>

                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            placeholder="House number, street, area, landmark..."
                                            required
                                        />
                                    </div>

                                    <div className="checkout-field">
                                        <label>City *</label>

                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            placeholder="Enter city"
                                            required
                                        />
                                    </div>

                                    <div className="checkout-field">
                                        <label>State *</label>

                                        <input
                                            type="text"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleChange}
                                            placeholder="Enter state"
                                            required
                                        />
                                    </div>

                                </div>

                                {/* OTP VERIFICATION */}

                                <div className="otp-verification-section">

                                    <h3>
                                        📱 Verify Your Mobile Number
                                    </h3>

                                    {!otpSent && !otpVerified && (

                                        <button
                                            type="button"
                                            className="send-otp-btn"
                                            onClick={handleSendOTP}
                                        >
                                            Send OTP →
                                        </button>

                                    )}

                                    {otpSent && !otpVerified && (

                                        <div className="otp-input-area">

                                            <p>
                                                Enter the 6-digit OTP for
                                                +91 {formData.mobile}
                                            </p>

                                            <input
                                                type="text"
                                                maxLength="6"
                                                inputMode="numeric"
                                                value={otp}
                                                onChange={(e) =>
                                                    setOtp(
                                                        e.target.value.replace(/\D/g, "")
                                                    )
                                                }
                                                placeholder="Enter OTP"
                                            />

                                            <div className="otp-actions">

                                                <button
                                                    type="button"
                                                    className="verify-otp-btn"
                                                    onClick={handleVerifyOTP}
                                                >
                                                    Verify OTP
                                                </button>

                                                <button
                                                    type="button"
                                                    className="resend-otp-btn"
                                                    onClick={handleResendOTP}
                                                >
                                                    Resend OTP
                                                </button>

                                            </div>

                                        </div>

                                    )}

                                    {otpMessage && (

                                        <p className={
                                            otpVerified
                                                ? "otp-message otp-message-success"
                                                : "otp-message"
                                        }>
                                            {otpMessage}
                                        </p>

                                    )}

                                    {otpVerified && (

                                        <div className="otp-success">
                                            ✓ Mobile Number Verified Successfully
                                        </div>

                                    )}

                                </div>

                            </section>

                            {/* PAYMENT METHOD */}

                            <section className="checkout-section">

                                <h2>
                                    <span>02</span>
                                    Payment Method
                                </h2>

                                <p className="section-description">
                                    Choose how you would like to pay.
                                </p>

                                <div className="payment-options">

                                    <label className={
                                        paymentMethod === "cod"
                                            ? "payment-option active"
                                            : "payment-option"
                                    }>

                                        <input
                                            type="radio"
                                            name="payment"
                                            value="cod"
                                            checked={paymentMethod === "cod"}
                                            onChange={(e) =>
                                                setPaymentMethod(e.target.value)
                                            }
                                        />

                                        <span className="payment-icon">
                                            💵
                                        </span>

                                        <span className="payment-info">
                                            <strong>Cash on Delivery</strong>
                                            <small>
                                                Pay when your order arrives
                                            </small>
                                        </span>

                                    </label>

                                    <label className={
                                        paymentMethod === "upi"
                                            ? "payment-option active"
                                            : "payment-option"
                                    }>

                                        <input
                                            type="radio"
                                            name="payment"
                                            value="upi"
                                            checked={paymentMethod === "upi"}
                                            onChange={(e) =>
                                                setPaymentMethod(e.target.value)
                                            }
                                        />

                                        <span className="payment-icon">
                                            📱
                                        </span>

                                        <span className="payment-info">
                                            <strong>UPI Payment</strong>
                                            <small>
                                                Google Pay, PhonePe, Paytm
                                            </small>
                                        </span>

                                    </label>

                                    <label className={
                                        paymentMethod === "card"
                                            ? "payment-option active"
                                            : "payment-option"
                                    }>

                                        <input
                                            type="radio"
                                            name="payment"
                                            value="card"
                                            checked={paymentMethod === "card"}
                                            onChange={(e) =>
                                                setPaymentMethod(e.target.value)
                                            }
                                        />

                                        <span className="payment-icon">
                                            💳
                                        </span>

                                        <span className="payment-info">
                                            <strong>Debit / Credit Card</strong>
                                            <small>
                                                Visa, Mastercard, RuPay
                                            </small>
                                        </span>

                                    </label>

                                </div>

                                {paymentMethod !== "cod" && (
                                    <p className="demo-payment-note">
                                        Demo mode: No actual payment will be processed.
                                    </p>
                                )}

                            </section>

                            {/* ERROR */}

                            {error && (

                                <div className="checkout-error">
                                    ⚠️ {error}
                                </div>

                            )}

                            {/* PLACE ORDER */}

                            <button
                                type="submit"
                                disabled={!otpVerified}
                                className="checkout-primary-btn place-order-btn"
                            >

                                {otpVerified
                                    ? `Confirm Order • ${formatPrice(total)}`
                                    : "Verify Mobile Number First"
                                }

                            </button>

                            <p className="checkout-secure-text">
                                🔒 Demo checkout • No real payment processed
                            </p>

                        </form>

                    </div>

                    {/* RIGHT SIDE: ORDER SUMMARY */}

                    <aside className="checkout-right">

                        <div className="order-summary-card">

                            <h2>Your Order</h2>

                            <p className="checkout-item-count">
                                {totalItems} items in your cart
                            </p>

                            <div className="checkout-products">

                                {cart.map((item, index) => (

                                    <div
                                        className="checkout-product"
                                        key={item.id || item.productId || index}
                                    >

                                        {getItemImage(item) ? (

                                            <img
                                                src={getItemImage(item)}
                                                alt={getItemName(item)}
                                            />

                                        ) : (

                                            <div className="checkout-no-image">
                                                🍨
                                            </div>

                                        )}

                                        <div className="checkout-product-info">

                                            <strong>
                                                {getItemName(item)}
                                            </strong>

                                            <small>
                                                {getItemSize(item)} × {getQuantity(item)}
                                            </small>

                                            {item.addOns?.length > 0 && (
                                                <small>
                                                    Extras: {
                                                        item.addOns
                                                            .map(extra =>
                                                                typeof extra === "string"
                                                                    ? extra
                                                                    : extra.name
                                                            )
                                                            .join(", ")
                                                    }
                                                </small>
                                            )}

                                        </div>

                                        <strong>
                                            {formatPrice(
                                                getPrice(item) * getQuantity(item)
                                            )}
                                        </strong>

                                    </div>

                                ))}

                            </div>

                            {/* PRICE DETAILS */}

                            <div className="checkout-price-row">
                                <span>Subtotal</span>
                                <strong>{formatPrice(subtotal)}</strong>
                            </div>

                            {taxType === "inter" ? (

                                <div className="checkout-price-row">
                                    <span>IGST</span>
                                    <strong>{formatPrice(igstAmount)}</strong>
                                </div>

                            ) : (

                                <>
                                    <div className="checkout-price-row">
                                        <span>CGST</span>
                                        <strong>{formatPrice(cgstAmount)}</strong>
                                    </div>

                                    <div className="checkout-price-row">
                                        <span>SGST</span>
                                        <strong>{formatPrice(sgstAmount)}</strong>
                                    </div>
                                </>

                            )}

                            <div className="checkout-price-row">
                                <span>Delivery Charges</span>
                                <strong className="free-delivery">
                                    FREE
                                </strong>
                            </div>

                            <div className="checkout-total-row">
                                <span>Grand Total</span>
                                <strong>{formatPrice(total)}</strong>
                            </div>

                            <div className="checkout-happiness">
                                🍦 Made with love, served with happiness!
                            </div>

                        </div>

                    </aside>

                </div>

            </div>
        </>
    );
}

export default Checkout;
