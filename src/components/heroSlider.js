
import React, { useEffect, useState } from "react";
import "../style/hero.css";
import Icecream from "../images/banner/pngtree-strawberry-ice-cream-cone-png.png";
import IcecreamA from "../images/banner/pngtree-strawberry-ice-cream-scoops-in-a-ceramic-bowl-png-image_19959097.png";
import IcecreamB from "../images/banner/pngtree-strawberry-sweet-ice-cream-on-scoop.png";

const slides = [
    {
        eyebrow: "Delightful Creamy",
        title: "ICE CREAM",
        subtitle: "Made With Love!",
        description:
            "Indulge in our handcrafted ice cream made with rich ingredients, bold flavours, and pure creamy bliss.",
        image: IcecreamA,
        button: "Buy Now",
        social: "100+",
    },
    {
        eyebrow: "A Little Scoop Of Joy",
        title: "SWEET JOY",
        subtitle: "Taste The Magic!",
        description:
            "Discover exciting flavours, delicious combinations and unforgettable moments with every scoop.",
        image: IcecreamB,
        button: "Explore Flavours",
        social: "100+",
    },
    {
        eyebrow: "Happiness In Every Bite",
        title: "PURE LOVE",
        subtitle: "Scoop Your Smile!",
        description:
            "From creamy classics to delightful new creations, there is always a reason to treat yourself.",
        image: Icecream,
        button: "Shop Now",
        social: "100+",
    },
];

function HeroSlider() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [paused, setPaused] = useState(false);
    const [mouse, setMouse] = useState({ x: 0, y: 0 });

    const slide = slides[currentSlide];

    useEffect(() => {
        if (paused) return;

        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5500);

        return () => clearInterval(timer);
    }, [paused]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide(
            (prev) => (prev - 1 + slides.length) % slides.length
        );
    };

    const handleMouseMove = (e) => {
        if (window.innerWidth <= 768) return;

        const rect = e.currentTarget.getBoundingClientRect();

        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        setMouse({
            x: x * 18,
            y: y * 18,
        });
    };

    const scrollToProducts = () => {
        document.getElementById("products")?.scrollIntoView({
            behavior: "smooth",
        });
    };

    return (
        <section
            className="konfiz-hero"
            id="home"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => {
                setPaused(false);
                setMouse({ x: 0, y: 0 });
            }}
        >
            <div className="konfiz-hero-inner">

                {/* Decorative background */}
                <div className="hero-pink-glow"></div>
                <div className="hero-decoration-circle"></div>

                {/* Main content */}
                <div
                    className="hero-slide-content"
                    key={currentSlide}
                >

                    {/* Top heading */}
                    <div className="hero-eyebrow">
                        {slide.eyebrow}
                    </div>

                    {/* Large background typography */}
                    <h1 className="hero-main-title">
                        {slide.title}
                    </h1>

                    {/* Center product image */}
                    <div
                        className="hero-icecream-visual"
                        style={{
                            "--mouse-x": `${mouse.x}px`,
                            "--mouse-y": `${mouse.y}px`,
                        }}
                    >
                        <div className="hero-image-halo"></div>

                        <img
                            src={slide.image}
                            alt="KONFiZ delicious ice cream"
                            className="hero-icecream-image"
                        />

                        <span className="hero-splash splash-one">✦</span>
                        <span className="hero-splash splash-two">✧</span>
                        <span className="hero-splash splash-three">●</span>
                        <span className="hero-splash splash-four">✦</span>
                    </div>

                    {/* Left description */}
                    <div className="hero-left-description">
                        <p>{slide.description}</p>

                        <button
                            className="hero-buy-button"
                            onClick={scrollToProducts}
                        >
                            {slide.button}
                            <span>↗</span>
                        </button>
                    </div>

                    {/* Right side message */}
                    <div className="hero-right-message">
                        <h2>{slide.subtitle}</h2>

                        <div className="hero-fruit-decoration">
                            <span>🍓</span>
                            <span>🍒</span>
                            <span>🍓</span>
                        </div>
                    </div>

                    {/* Customer social proof */}
                    <div className="hero-social-card">
                        <div className="hero-avatar-list">
                            <span>😊</span>
                            <span>😍</span>
                            <span>🥰</span>
                        </div>

                        <div className="hero-social-count">
                            {slide.social}
                        </div>
                    </div>

                </div>

                {/* Slider controls */}
                <div className="hero-slider-navigation">

                    <button
                        onClick={prevSlide}
                        aria-label="Previous slide"
                    >
                        ←
                    </button>

                    <div className="hero-slider-dots">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                className={
                                    currentSlide === index ? "active" : ""
                                }
                                onClick={() => setCurrentSlide(index)}
                                aria-label={`Slide ${index + 1}`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={nextSlide}
                        aria-label="Next slide"
                    >
                        →
                    </button>

                </div>

                {/* Scroll animation */}
                <a
                    href="#products"
                    className="hero-scroll-button"
                    aria-label="Scroll to products"
                >
                    <span className="hero-scroll-cream">
                        <span></span>
                    </span>
                    <small>SCROLL DOWN</small>
                </a>

            </div>
        </section>
    );
}

export default HeroSlider;
