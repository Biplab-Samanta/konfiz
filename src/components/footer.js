
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../style/footer.css";

function Footer() {

    const [email, setEmail] = useState("");

    const handleSubscribe = (e) => {
        e.preventDefault();

        if (!email.trim()) {
            alert("Please enter your email address.");
            return;
        }

        alert("Thank you for subscribing to KONFiZ!");
        setEmail("");
    };

    return (
        <footer className="konfiz-footer">

            {/* NEWSLETTER */}
            <div className="footer-newsletter">
                <div className="footer-newsletter-content">
                    <span className="footer-small-title">
                        STAY IN TOUCH
                    </span>

                    <h2>Sweet Updates, Straight to Your Inbox!</h2>

                    <p>
                        Subscribe to get exclusive offers, new flavours
                        and delicious updates from KONFiZ.
                    </p>
                </div>

                <form
                    className="footer-subscribe"
                    onSubmit={handleSubscribe}
                >
                    <input
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <button type="submit">
                        Subscribe →
                    </button>
                </form>
            </div>


            {/* MAIN FOOTER */}
            <div className="footer-main">

                {/* BRAND */}
                <div className="footer-brand">
                    <Link to="/" className="footer-logo">
                        <span className="footer-logo-icon">🍦</span>
                        <span>KONFiZ</span>
                    </Link>

                    <p className="footer-tagline">
                        ICE CREAM & HAPPINESS
                    </p>

                    <p className="footer-description">
                        Bringing smiles, happiness and delicious
                        moments with every scoop. Made with love,
                        served with happiness!
                    </p>

                    <div className="footer-socials">
                        <a href="https://www.instagram.com/"
                            target="_blank"
                            rel="noreferrer"
                            aria-label="Instagram">
                            Instagram
                        </a>

                        <a href="https://www.facebook.com/"
                            target="_blank"
                            rel="noreferrer"
                            aria-label="Facebook">
                            Facebook
                        </a>

                        <a href="https://www.youtube.com/"
                            target="_blank"
                            rel="noreferrer"
                            aria-label="YouTube">
                            YouTube
                        </a>
                    </div>
                </div>


                {/* QUICK LINKS */}
                <div className="footer-column">
                    <h3>Quick Links</h3>

                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/products">Our Products</Link></li>
                        <li><Link to="/categories">Categories</Link></li>
                        <li><Link to="/our-story">Our Story</Link></li>
                        <li><Link to="/cart">My Cart</Link></li>
                    </ul>
                </div>


                {/* CATEGORIES */}
                <div className="footer-column">
                    <h3>Our Products</h3>

                    <ul>
                        <li><Link to="/products">Ice Cream Cones</Link></li>
                        <li><Link to="/products">Ice Cream Tubs</Link></li>
                        <li><Link to="/products">Family Packs</Link></li>
                        <li><Link to="/products">Sundaes</Link></li>
                        <li><Link to="/products">Special Flavours</Link></li>
                    </ul>
                </div>


                {/* CUSTOMER SUPPORT */}
                <div className="footer-column">
                    <h3>Customer Care</h3>

                    <ul>
                        <li><Link to="/contact">Contact Us</Link></li>
                        <li><Link to="/faq">FAQs</Link></li>
                        <li><Link to="/orders">Track Order</Link></li>
                        <li><Link to="/privacy-policy">Privacy Policy</Link></li>
                        <li><Link to="/terms">Terms & Conditions</Link></li>
                    </ul>
                </div>


                {/* CONTACT */}
                <div className="footer-column footer-contact">
                    <h3>Get in Touch</h3>

                    <p>📍 West Bengal, India</p>

                    <p>
                        📧
                        <a href="mailto:support@konfiz.com">
                            support@konfiz.com
                        </a>
                    </p>

                    <p>
                        📞
                        <a href="tel:+910000000000">
                            +91 00000 00000
                        </a>
                    </p>

                    <p>🕒 Mon – Sun: 10 AM – 10 PM</p>
                </div>

            </div>


            {/* BOTTOM FOOTER */}
            <div className="footer-bottom">

                <p>
                    © {new Date().getFullYear()} KONFiZ.
                    All Rights Reserved.
                </p>

                <p className="footer-made">
                    Made with ❤️ for Ice Cream Lovers
                </p>

                <div className="footer-payment">
                    <span>We Accept:</span>
                    <strong>UPI</strong>
                    <strong>VISA</strong>
                    <strong>RuPay</strong>
                </div>

            </div>

        </footer>
    );
}

export default Footer;
