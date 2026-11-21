
// import React, { useEffect, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import Navbar from "../components/navber";
// import { useAuth } from "../context/authContext";
// import { useCart } from "../context/cartcontext";
// import "../style/quickDelivery.css";

// const DELIVERY_PIN_CODES = [
//     // Add your confirmed serviceable PIN codes here.
//     // Example: "700001", "700016"
// ];

// const quickProducts = [
//     {
//         id: 901,
//         name: "Belgian Chocolate",
//         category: "Chocolate",
//         description: "Rich, creamy Belgian chocolate.",
//         price: 180,
//         image: "/images/belgian-chocolate.jpg"
//     },
//     {
//         id: 902,
//         name: "Strawberry Bliss",
//         category: "Fruit",
//         description: "Fresh and fruity strawberry delight.",
//         price: 150,
//         image: "/images/strawberry.jpg"
//     },
//     {
//         id: 903,
//         name: "Vanilla Dream",
//         category: "Classic",
//         description: "A timeless creamy vanilla experience.",
//         price: 130,
//         image: "/images/vanilla.jpg"
//     },
//     {
//         id: 904,
//         name: "Mango Magic",
//         category: "Fruit",
//         description: "Sweet tropical mango happiness.",
//         price: 160,
//         image: "/images/mango.jpg"
//     }
// ];

// function QuickDelivery() {
//     const { user } = useAuth();
//     const { addToCart } = useCart();
//     const navigate = useNavigate();

//     const [showLoginPopup, setShowLoginPopup] = useState(false);
//     const [pinCode, setPinCode] = useState("");
//     const [deliveryMessage, setDeliveryMessage] = useState("");
//     const [isEligible, setIsEligible] = useState(false);

//     // Automatic login popup after 8 seconds.
//     useEffect(() => {
//         if (user) {
//             setShowLoginPopup(false);
//             return;
//         }

//         if (sessionStorage.getItem("konfiz_delivery_popup_shown")) {
//             return;
//         }

//         const timer = setTimeout(() => {
//             setShowLoginPopup(true);
//             sessionStorage.setItem(
//                 "konfiz_delivery_popup_shown",
//                 "true"
//             );
//         }, 8000);

//         return () => clearTimeout(timer);
//     }, [user]);

//     // Check delivery PIN code.
//     const checkDelivery = (e) => {
//         e.preventDefault();

//         setDeliveryMessage("");
//         setIsEligible(false);

//         if (!/^\d{6}$/.test(pinCode)) {
//             setDeliveryMessage("Please enter a valid 6-digit PIN code.");
//             return;
//         }

//         if (DELIVERY_PIN_CODES.includes(pinCode)) {
//             setIsEligible(true);
//             setDeliveryMessage(
//                 "Great! Your PIN code is configured for delivery. Final timing will be confirmed at checkout."
//             );
//         } else {
//             setDeliveryMessage(
//                 "Delivery availability for this PIN code is not currently confirmed. Please contact us for assistance."
//             );
//         }
//     };

//     const handleAddToCart = (product) => {
//         addToCart({
//             ...product,
//             quantity: 1,
//             selectedSize: "100 ml"
//         });
//     };

//     const handleLogin = () => {
//         setShowLoginPopup(false);
//         navigate("/login");
//     };

//     return (
//         <>
//             <Navbar />

//             <main className="quick-delivery-page">

//                 {/* HERO */}
//                 <section className="delivery-hero">
//                     <div className="delivery-hero-content">

//                         <span className="delivery-label">
//                             <span className="delivery-live-dot"></span>
//                             KONFiZ EXPRESS DELIVERY
//                         </span>

//                         <h1>
//                             Ice Cream Happiness
//                             <span> In Just 30 Minutes!</span>
//                         </h1>

//                         <p>
//                             Kolkata, your favourite ice cream is closer
//                             than ever. Discover delicious flavours and
//                             enjoy the sweetness delivered to your doorstep.
//                         </p>

//                         <div className="delivery-hero-buttons">
//                             <a href="#quick-products">
//                                 Order Now →
//                             </a>

//                             <a href="#check-location" className="secondary">
//                                 Check Your Location
//                             </a>
//                         </div>

//                         <div className="delivery-highlights">
//                             <div>
//                                 <strong>30 min</strong>
//                                 <span>Target delivery</span>
//                             </div>

//                             <div>
//                                 <strong>Fresh</strong>
//                                 <span>Frozen happiness</span>
//                             </div>

//                             <div>
//                                 <strong>Kolkata</strong>
//                                 <span>Delivery zone</span>
//                             </div>
//                         </div>
//                     </div>

//                     <div className="delivery-hero-art">
//                         <div className="delivery-circle">
//                             <span>🍨</span>
//                         </div>
//                         <div className="delivery-floating delivery-float-one">
//                             🍓
//                         </div>
//                         <div className="delivery-floating delivery-float-two">
//                             🍦
//                         </div>
//                         <div className="delivery-time-card">
//                             <span>⚡</span>
//                             <div>
//                                 <strong>30 MIN</strong>
//                                 <small>Express delivery</small>
//                             </div>
//                         </div>
//                     </div>
//                 </section>

//                 {/* LOCATION CHECKER */}
//                 <section
//                     className="delivery-location"
//                     id="check-location"
//                 >
//                     <div className="location-icon">📍</div>

//                     <div className="location-content">
//                         <span>DELIVERY AVAILABILITY</span>
//                         <h2>Are We Delivering Near You?</h2>
//                         <p>
//                             Enter your Kolkata PIN code to check our
//                             configured delivery service area.
//                         </p>

//                         <form onSubmit={checkDelivery}>
//                             <input
//                                 type="text"
//                                 value={pinCode}
//                                 maxLength="6"
//                                 inputMode="numeric"
//                                 placeholder="Enter 6-digit PIN code"
//                                 onChange={(e) => {
//                                     setPinCode(
//                                         e.target.value.replace(/\D/g, "")
//                                     );
//                                     setDeliveryMessage("");
//                                     setIsEligible(false);
//                                 }}
//                             />

//                             <button type="submit">
//                                 Check Availability
//                             </button>
//                         </form>

//                         {deliveryMessage && (
//                             <div className={`delivery-result ${
//                                 isEligible ? "success" : "warning"
//                             }`}>
//                                 {deliveryMessage}
//                             </div>
//                         )}
//                     </div>
//                 </section>

//                 {/* BENEFITS */}
//                 <section className="delivery-benefits">
//                     <div className="delivery-section-heading">
//                         <span>WHY KONFiZ EXPRESS?</span>
//                         <h2>Sweetness Without the Wait</h2>
//                     </div>

//                     <div className="benefits-grid">
//                         <div className="benefit-card">
//                             <span>⚡</span>
//                             <h3>Express Delivery</h3>
//                             <p>
//                                 Our target is to bring your favourite
//                                 treats to your doorstep in 30 minutes.
//                             </p>
//                         </div>

//                         <div className="benefit-card">
//                             <span>❄️</span>
//                             <h3>Frozen Freshness</h3>
//                             <p>
//                                 Carefully packed to help preserve the
//                                 creamy goodness of every scoop.
//                             </p>
//                         </div>

//                         <div className="benefit-card">
//                             <span>🍦</span>
//                             <h3>Delicious Choices</h3>
//                             <p>
//                                 Choose from chocolate, fruit, classic
//                                 and premium ice cream flavours.
//                             </p>
//                         </div>

//                         <div className="benefit-card">
//                             <span>💝</span>
//                             <h3>Made for Happiness</h3>
//                             <p>
//                                 Every order is an opportunity to make
//                                 someone's day a little sweeter.
//                             </p>
//                         </div>
//                     </div>
//                 </section>

//                 {/* QUICK PRODUCTS */}
//                 <section
//                     className="quick-products"
//                     id="quick-products"
//                 >
//                     <div className="delivery-section-heading">
//                         <span>QUICK PICKS</span>
//                         <h2>Cravings Can't Wait!</h2>
//                         <p>
//                             Explore some of our customer favourites.
//                         </p>
//                     </div>

//                     <div className="quick-product-grid">
//                         {quickProducts.map((product) => (
//                             <div
//                                 className="quick-product-card"
//                                 key={product.id}
//                             >
//                                 <div className="quick-product-image">
//                                     <img
//                                         src={product.image}
//                                         alt={product.name}
//                                         onError={(e) => {
//                                             e.currentTarget.style.display = "none";
//                                         }}
//                                     />
//                                     <span>QUICK PICK</span>
//                                 </div>

//                                 <div className="quick-product-info">
//                                     <small>{product.category}</small>
//                                     <h3>{product.name}</h3>
//                                     <p>{product.description}</p>

//                                     <div className="quick-product-bottom">
//                                         <strong>₹{product.price}</strong>

//                                         <button
//                                             onClick={() =>
//                                                 handleAddToCart(product)
//                                             }
//                                         >
//                                             + Add
//                                         </button>
//                                     </div>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>

//                     <div className="all-products-link">
//                         <Link to="/products">
//                             View All Products →
//                         </Link>
//                     </div>
//                 </section>

//                 {/* FINAL BANNER */}
//                 <section className="delivery-bottom-banner">
//                     <span>YOUR HAPPINESS IS ON ITS WAY</span>
//                     <h2>One Order. Endless Happiness.</h2>
//                     <p>
//                         Make your day sweeter with KONFiZ.
//                     </p>
//                     <Link to="/products">
//                         Explore Ice Creams →
//                     </Link>
//                 </section>

//             </main>

//             {/* AUTOMATIC LOGIN POPUP */}
//             {showLoginPopup && !user && (
//                 <div
//                     className="delivery-popup-overlay"
//                     onClick={() => setShowLoginPopup(false)}
//                 >
//                     <div
//                         className="delivery-login-popup"
//                         onClick={(e) => e.stopPropagation()}
//                     >
//                         <button
//                             className="delivery-popup-close"
//                             onClick={() => setShowLoginPopup(false)}
//                         >
//                             ×
//                         </button>

//                         <div className="popup-icecream">🍦</div>

//                         <span>WELCOME TO KONFiZ</span>

//                         <h2>
//                             Sweet Moments
//                             <br />
//                             Start With You!
//                         </h2>

//                         <p>
//                             Login to your account for a sweeter shopping
//                             experience. Explore flavours and keep track
//                             of your orders.
//                         </p>

//                         <button
//                             className="popup-login-button"
//                             onClick={handleLogin}
//                         >
//                             Login / Sign Up →
//                         </button>

//                         <button
//                             className="popup-later-button"
//                             onClick={() => setShowLoginPopup(false)}
//                         >
//                             Maybe Later
//                         </button>
//                     </div>
//                 </div>
//             )}
//         </>
//     );
// }

// export default QuickDelivery;
