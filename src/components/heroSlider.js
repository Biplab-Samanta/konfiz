
import React, { useState, useEffect } from "react";
import "../style/hero.css";

function HeroSlider() {

    const slides = [
        {
            eyebrow: "MADE FOR YOUR HAPPY MOMENTS",
            title: "A Little Scoop",
            highlight: "Of Happiness.",
            description:
                "Life is better with ice cream. Discover your favourite flavours and make every moment delicious.",
            image: "https://images.unsplash.com/photo-1560008581-09826d1de69e?w=1000",
            note: "Fresh flavours. Endless happiness.",
            badge: "100% Happiness",
            badgeText: "In every scoop"
        },
        {
            eyebrow: "TASTE THE MAGIC",
            title: "Sweet Moments",
            highlight: "Made Special.",
            description:
                "From creamy classics to exciting new flavours, find the perfect scoop for every occasion.",
            image: "https://images.unsplash.com/photo-1501446529957-6226bd447c46?w=1000",
            note: "Every flavour tells a story.",
            badge: "Fresh & Creamy",
            badgeText: "Made with love"
        },
        {
            eyebrow: "HAPPINESS IN EVERY BITE",
            title: "Discover Your",
            highlight: "Favourite Flavour.",
            description:
                "Treat yourself to delicious ice cream and turn ordinary days into extraordinary memories.",
            image: "https://images.unsplash.com/photo-1488900128323-21503983a07e?w=1000",
            note: "Scoop more. Smile more.",
            badge: "Pure Delight",
            badgeText: "A taste of joy"
        }
    ];

    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 4000);

        return () => clearInterval(interval);
    }, [slides.length]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) =>
            (prev - 1 + slides.length) % slides.length
        );
    };

    const slide = slides[currentSlide];

    return (
        <section className="hero" id="home">

            <div className="hero-content" key={currentSlide}>

                <span className="eyebrow">
                    {slide.eyebrow}
                </span>

                <h1>
                    {slide.title}
                    <br />
                    <span>{slide.highlight}</span>
                </h1>

                <p>{slide.description}</p>

                <div className="hero-buttons">

                    <a href="#products" className="primary-btn">
                        Shop Now <span>→</span>
                    </a>

                    <a href="#categories" className="secondary-btn">
                        Explore Flavours
                    </a>

                </div>

                <div className="hero-note">
                    {slide.note}
                </div>

            </div>

            <div className="hero-image" key={`image-${currentSlide}`}>

                <img
                    src={slide.image}
                    alt="Delicious ice cream"
                />

                <div className="floating-card">
                    <div>
                        <strong>{slide.badge}</strong>
                        <small>{slide.badgeText}</small>
                    </div>
                </div>

            </div>

            <div className="hero-decoration">SWEET</div>

            {/* SLIDER CONTROLS */}
            <div className="hero-slider-controls">

                <button
                    className="hero-arrow"
                    onClick={prevSlide}
                    aria-label="Previous slide"
                >
                    &#8592;
                </button>

                <div className="hero-dots">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            className={currentSlide === index ? "active" : ""}
                            onClick={() => setCurrentSlide(index)}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>

                <button
                    className="hero-arrow"
                    onClick={nextSlide}
                    aria-label="Next slide"
                >
                    &#8594;
                </button>

            </div>

        </section>
    );
}

export default HeroSlider;
