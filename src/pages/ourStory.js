
import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/navber";
import Footer from "../components/footer";
import "../style/ourStory.css";

function OurStory() {
    return (
        <>
            <Navbar />

            <main className="our-story-page">

                {/* HERO SECTION */}
                <section className="story-hero">
                    <div className="story-hero-overlay">
                        <span className="story-eyebrow">
                            WELCOME TO KONFiZ
                        </span>

                        <h1>
                            Every Scoop Has
                            <br />
                            <span>A Story.</span>
                        </h1>

                        <p>
                            A little sweetness, a lot of happiness,
                            and countless memories made with ice cream.
                        </p>

                        <Link to="/products" className="story-btn">
                            Explore Our Flavours →
                        </Link>
                    </div>
                </section>

                {/* INTRODUCTION */}
                <section className="story-intro">
                    <div className="story-intro-image">
                        <img
                            src="https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=900"
                            alt="Delicious ice cream"
                        />
                    </div>

                    <div className="story-intro-content">
                        <span className="story-eyebrow">
                            THE SWEET BEGINNING
                        </span>

                        <h2>
                            More Than Ice Cream.
                            <br />
                            A Feeling of <span>Happiness.</span>
                        </h2>

                        <p>
                            At KONFiZ, we believe happiness can be found
                            in the simplest moments — a favourite flavour,
                            a shared dessert, or a little treat after a
                            long day.
                        </p>

                        <p>
                            We created KONFiZ with one simple thought:
                            to make every moment a little sweeter.
                            Our world is filled with exciting flavours,
                            creamy textures, and delightful experiences
                            made for everyone.
                        </p>

                        <strong>
                            KONFiZ – Ice Cream & Happiness.
                        </strong>
                    </div>
                </section>

                {/* MISSION AND VISION */}
                <section className="story-mission">
                    <div className="mission-card">
                        <span>🎯</span>
                        <h2>Our Mission</h2>
                        <p>
                            To spread happiness through delightful ice cream,
                            exciting flavours, quality ingredients, and
                            memorable experiences.
                        </p>
                    </div>

                    <div className="mission-card">
                        <span>✨</span>
                        <h2>Our Vision</h2>
                        <p>
                            To become a favourite destination for ice cream
                            lovers, bringing people together through
                            sweetness, creativity, and joy.
                        </p>
                    </div>
                </section>

                {/* BRAND VALUES */}
                <section className="story-values">
                    <div className="story-section-heading">
                        <span className="story-eyebrow">
                            WHAT MAKES US SPECIAL
                        </span>

                        <h2>
                            Happiness in <span>Every Detail.</span>
                        </h2>

                        <p>
                            Everything we do is inspired by our love
                            for ice cream and the people who enjoy it.
                        </p>
                    </div>

                    <div className="story-values-grid">

                        <div className="story-value-card">
                            <span>🍓</span>
                            <h3>Delightful Flavours</h3>
                            <p>
                                Discover a variety of delicious flavours
                                for every mood and every occasion.
                            </p>
                        </div>

                        <div className="story-value-card">
                            <span>❤️</span>
                            <h3>Made with Love</h3>
                            <p>
                                Every experience is designed to bring
                                a little extra happiness to your day.
                            </p>
                        </div>

                        <div className="story-value-card">
                            <span>🌟</span>
                            <h3>Quality First</h3>
                            <p>
                                We believe great ice cream starts with
                                attention to quality and detail.
                            </p>
                        </div>

                        <div className="story-value-card">
                            <span>😊</span>
                            <h3>Made for Everyone</h3>
                            <p>
                                From little treats to family celebrations,
                                there is something sweet for everyone.
                            </p>
                        </div>

                    </div>
                </section>

                {/* BRAND PROMISE */}
                <section className="story-promise">
                    <div>
                        <span className="story-eyebrow">
                            OUR PROMISE
                        </span>

                        <h2>
                            A Little Scoop.
                            <br />
                            A Lot of <span>Happiness.</span>
                        </h2>

                        <p>
                            We want every KONFiZ experience to leave you
                            smiling. Because life is simply better
                            with ice cream.
                        </p>

                        <Link to="/products" className="story-btn">
                            Find Your Favourite →
                        </Link>
                    </div>
                </section>

              
                <Footer />

            </main>
        </>
    );
}

export default OurStory;
