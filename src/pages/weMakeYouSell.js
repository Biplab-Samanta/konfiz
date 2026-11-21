
import React from "react";
// import { Link } from "react-router-dom";

import Navbar from "../components/navber";
import Footer from "../components/footer";

import "../../src/App.css";
import "../style/weMakeYouSell.css";

function WeMakeYouSell() {

    const benefits = [
        {
            icon: "🍦",
            title: "Quality Products",
            description:
                "Delicious ice cream made with carefully selected ingredients and a focus on quality."
        },
        {
            icon: "💰",
            title: "Business Opportunities",
            description:
                "Explore attractive business opportunities and grow your ice cream business with KONFiZ."
        },
        {
            icon: "📦",
            title: "Bulk Orders",
            description:
                "Convenient bulk ordering options for retailers, cafés, restaurants and events."
        },
        {
            icon: "🤝",
            title: "Business Support",
            description:
                "We work alongside our partners to help them build and grow their businesses."
        }
    ];

    const businessTypes = [
        {
            icon: "🏪",
            title: "Retail Stores",
            description:
                "Bring delicious KONFiZ ice cream to your customers through your retail outlet."
        },
        {
            icon: "🍽️",
            title: "Restaurants & Cafés",
            description:
                "Add exciting ice cream flavours and desserts to your menu."
        },
        {
            icon: "🚚",
            title: "Distributors",
            description:
                "Explore distribution opportunities and expand KONFiZ's reach."
        },
        {
            icon: "🎉",
            title: "Events & Bulk Orders",
            description:
                "Make celebrations, parties and special occasions sweeter."
        }
    ];

    const whatsappMessage =
        "Hello KONFiZ! I am interested in a business partnership. Please share more details.";

    return (
        <div className="">

            <Navbar />

            <main className="sell-page">

                {/* HERO SECTION */}

                <section className="sell-hero">

                    <div className="sell-hero-content">

                        <span className="sell-eyebrow">
                            GROW YOUR BUSINESS WITH KONFiZ
                        </span>

                        <h1>
                            We Make You <span>Sell.</span>
                        </h1>

                        <p>
                            Your business deserves something special.
                            Partner with KONFiZ and bring happiness to
                            more customers with delicious ice cream.
                        </p>

                        <div className="sell-hero-buttons">

                            <a
                                href="#partnership"
                                className="sell-primary-btn"
                            >
                                Become a Partner →
                            </a>

                            <a
                                href={`https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="sell-secondary-btn"
                            >
                                Talk to Us
                            </a>

                        </div>

                        <div className="sell-hero-note">
                            <span>✓</span> Business Partnerships
                            <span>✓</span> Bulk Orders
                            <span>✓</span> Growth Opportunities
                        </div>

                    </div>

                    <div className="sell-hero-image">

                        <img
                            src="https://images.unsplash.com/photo-1560008581-09826d1de69e?w=1000"
                            alt="Delicious ice cream"
                        />

                        <div className="sell-floating-card">
                            <span>🍨</span>
                            <div>
                                <strong>Sweet Products</strong>
                                <small>Happy Customers</small>
                            </div>
                        </div>

                    </div>

                </section>


                {/* INTRODUCTION */}

                <section className="sell-intro">

                    <span className="sell-eyebrow">
                        MORE THAN JUST ICE CREAM
                    </span>

                    <h2>
                        We Help You Build a
                        <span> Sweeter Business.</span>
                    </h2>

                    <p>
                        At KONFiZ, we believe great products create great
                        business opportunities. Whether you own a retail
                        shop, café, restaurant or distribution business,
                        we want to explore how we can grow together.
                    </p>

                </section>


                {/* BENEFITS */}

                <section className="sell-benefits">

                    <div className="sell-section-heading">

                        <span className="sell-eyebrow">
                            WHY PARTNER WITH US
                        </span>

                        <h2>
                            Your Business.
                            <span> Our Support.</span>
                        </h2>

                    </div>

                    <div className="sell-benefit-grid">

                        {benefits.map((item, index) => (

                            <article
                                className="sell-benefit-card"
                                key={index}
                            >

                                <div className="sell-card-icon">
                                    {item.icon}
                                </div>

                                <h3>{item.title}</h3>

                                <p>{item.description}</p>

                            </article>

                        ))}

                    </div>

                </section>


                {/* BUSINESS PARTNERSHIP */}

                <section
                    className="sell-partnership"
                    id="partnership"
                >

                    <div className="sell-partnership-image">

                        <img
                            src="https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=1000"
                            alt="Ice cream business opportunity"
                            loading="lazy"
                        />

                    </div>

                    <div className="sell-partnership-content">

                        <span className="sell-eyebrow">
                            LET'S GROW TOGETHER
                        </span>

                        <h2>
                            Every Great Business
                            Starts with a
                            <span> Great Partnership.</span>
                        </h2>

                        <p>
                            We are interested in connecting with passionate
                            business owners who want to offer quality ice
                            cream and create memorable customer experiences.
                        </p>

                        <ul>
                            <li>✓ Flexible business discussions</li>
                            <li>✓ Product and flavour options</li>
                            <li>✓ Bulk order enquiries</li>
                            <li>✓ Partnership opportunities</li>
                        </ul>

                        <a
                            href={`https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="sell-primary-btn"
                        >
                            Start a Conversation →
                        </a>

                    </div>

                </section>


                {/* BUSINESS TYPES */}

                <section className="sell-business-types">

                    <div className="sell-section-heading">

                        <span className="sell-eyebrow">
                            WHO CAN PARTNER WITH US?
                        </span>

                        <h2>
                            Let's Find Your
                            <span> Opportunity.</span>
                        </h2>

                        <p>
                            We welcome businesses of different sizes and types.
                        </p>

                    </div>

                    <div className="sell-business-grid">

                        {businessTypes.map((item, index) => (

                            <article
                                className="sell-business-card"
                                key={index}
                            >

                                <div>{item.icon}</div>

                                <h3>{item.title}</h3>

                                <p>{item.description}</p>

                            </article>

                        ))}

                    </div>

                </section>


                {/* FINAL CTA */}

                <section className="sell-cta">

                    <span className="sell-eyebrow">
                        YOUR NEXT BUSINESS OPPORTUNITY STARTS HERE
                    </span>

                    <h2>
                        Let's Make Business
                        <span> Sweeter!</span>
                    </h2>

                    <p>
                        Tell us about your business and let's explore
                        how KONFiZ can work with you.
                    </p>

                    <div className="sell-cta-buttons">

                        <a
                            href={`https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="sell-primary-btn"
                        >
                            WhatsApp Us →
                        </a>

                        <a
                            href="mailto:support@konfiz.com?subject=KONFiZ%20Business%20Partnership"
                            className="sell-secondary-btn"
                        >
                            Email Us
                        </a>

                    </div>

                </section>

            </main>

            <Footer />

        </div>
    );
}

export default WeMakeYouSell;
