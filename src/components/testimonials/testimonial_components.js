
import React, { useRef, useState } from "react";
import "./testimonial_components.css";

// =====================================================
// TESTIMONIAL DATA
// =====================================================

export const testimonialData = [
    // B2C CUSTOMER TESTIMONIALS
    {
        id: 1,
        type: "b2c",
        name: "Rahul Sharma",
        image: "/images/testimonials/rahul.jpg",
        location: "Kolkata",
        rating: 5,
        review:
            "The ice cream quality is amazing. I really love the flavours and the overall experience. Definitely ordering again!",
        featured: true,
        status: "active"
    },
    {
        id: 2,
        type: "b2c",
        name: "Priya Das",
        image: "/images/testimonials/priya.jpg",
        location: "Howrah",
        rating: 5,
        review:
            "Wonderful taste and excellent quality. The packaging was also very good. My family loved every flavour!",
        featured: true,
        status: "active"
    },
    {
        id: 3,
        type: "b2c",
        name: "Amit Roy",
        image: "",
        location: "Kolkata",
        rating: 4,
        review:
            "Really enjoyed the ice cream. The taste is rich and the flavours are quite unique.",
        featured: false,
        status: "active"
    },
    {
        id: 4,
        type: "b2c",
        name: "Sneha Ghosh",
        image: "",
        location: "South Kolkata",
        rating: 5,
        review:
            "A lovely experience. Great flavours, great presentation and excellent customer service.",
        featured: true,
        status: "active"
    },
    {
        id: 5,
        type: "b2c",
        name: "Sneha Ghosh",
        image: "",
        location: "South Kolkata",
        rating: 5,
        review:
            "A lovely experience. Great flavours, great presentation and excellent customer service.",
        featured: true,
        status: "active"
    },
    {
        id: 6,
        type: "b2c",
        name: "Sneha Ghosh",
        image: "",
        location: "South Kolkata",
        rating: 5,
        review:
            "A lovely experience. Great flavours, great presentation and excellent customer service.",
        featured: true,
        status: "active"
    },
    {
        id: 7,
        type: "b2c",
        name: "Sneha Ghosh",
        image: "",
        location: "South Kolkata",
        rating: 5,
        review:
            "A lovely experience. Great flavours, great presentation and excellent customer service.",
        featured: true,
        status: "active"
    },
    {
        id: 8,
        type: "b2c",
        name: "Sneha Ghosh",
        image: "",
        location: "South Kolkata",
        rating: 5,
        review:
            "A lovely experience. Great flavours, great presentation and excellent customer service.",
        featured: true,
        status: "active"
    },
    // B2B BUSINESS TESTIMONIALS
    {
        id: 11,
        type: "b2b",
        name: "Amit Das",
        designation: "Owner",
        businessName: "Sweet Corner Cafe",
        image: "",
        logo: "/images/testimonials/sweet-corner.png",
        location: "Kolkata",
        rating: 5,
        review:
            "KONFiZ has helped us offer premium quality ice cream to our customers. The product quality and support have been excellent.",
        featured: true,
        status: "active"
    },
    {
        id: 12,
        type: "b2b",
        name: "Sourav Mitra",
        designation: "Managing Director",
        businessName: "Food Junction",
        image: "",
        logo: "",
        location: "Howrah",
        rating: 5,
        review:
            "We appreciate the consistent quality and professional service. Working with KONFiZ has been a great experience.",
        featured: true,
        status: "active"
    },
    {
        id: 13,
        type: "b2b",
        name: "Rakesh Paul",
        designation: "Restaurant Owner",
        businessName: "The Dessert House",
        image: "",
        logo: "",
        location: "Kolkata",
        rating: 4,
        review:
            "A reliable business partner with great products and a good range of flavours.",
        featured: false,
        status: "active"
    },{
        id: 14,
        type: "b2b",
        name: "Rakesh Paul",
        designation: "Restaurant Owner",
        businessName: "The Dessert House",
        image: "",
        logo: "",
        location: "Kolkata",
        rating: 4,
        review:
            "A reliable business partner with great products and a good range of flavours.",
        featured: false,
        status: "active"
    },
    {
        id: 15,
        type: "b2b",
        name: "Rakesh Paul",
        designation: "Restaurant Owner",
        businessName: "The Dessert House",
        image: "",
        logo: "",
        location: "Kolkata",
        rating: 4,
        review:
            "A reliable business partner with great products and a good range of flavours.",
        featured: false,
        status: "active"
    },
    {
        id: 16,
        type: "b2b",
        name: "Rakesh Paul",
        designation: "Restaurant Owner",
        businessName: "The Dessert House",
        image: "",
        logo: "",
        location: "Kolkata",
        rating: 4,
        review:
            "A reliable business partner with great products and a good range of flavours.",
        featured: false,
        status: "active"
    },

    // BRAND TESTIMONIALS
    {
        id: 20,
        type: "brand",
        brandName: "ABC Foods",
        logo: "/images/brands/amul.png",
        representative: "Sourav Roy",
        designation: "Director",
        rating: 4,
        review:
            "Our partnership with KONFiZ has been a wonderful experience. Their commitment to quality, innovation and customer satisfaction makes them a trusted partner.",
        background: "/images/testimonials/brand-bg.jpg",
        featured: true,
        status: "active"
    },
    {
        id: 21,
        type: "brand",
        brandName: "Fresh Retail",
        logo: "/images/brands/amul.png",
        representative: "Ankit Sharma",
        designation: "Business Head",
        review:
            "We value the professionalism and product consistency that KONFiZ brings to every collaboration. We look forward to growing together.",
        background: "",
        featured: true,
        status: "active"
    }
];


// =====================================================
// HELPER FUNCTIONS
// =====================================================

const getInitials = (name = "") => {
    return name
        .trim()
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(word => word.charAt(0).toUpperCase())
        .join("");
};


const getTestimonials = ({
    testimonials,
    type,
    featured,
    limit
}) => {
    let items = testimonials.filter(item => {
        const isActive = item.status !== "inactive";
        const matchesType = !type || item.type === type;
        const matchesFeatured = featured === true
            ? item.featured === true
            : true;

        return isActive && matchesType && matchesFeatured;
    });

    if (limit && Number(limit) > 0) {
        items = items.slice(0, Number(limit));
    }

    return items;
};


// =====================================================
// COMMON IMAGE COMPONENT
// =====================================================

function TestimonialImage({ src, name, className = "" }) {
    const [imageError, setImageError] = useState(false);

    if (!src || imageError) {
        return (
            <div className={`testimonial-avatar-fallback ${className}`}>
                {getInitials(name)}
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={name || "Testimonial"}
            className={className}
            onError={() => setImageError(true)}
        />
    );
}


// =====================================================
// STAR RATING
// =====================================================

function TestimonialRating({ rating = 5 }) {
    const safeRating = Math.min(5, Math.max(0, Number(rating) || 0));

    return (
        <div className="testimonial-rating" aria-label={`${safeRating} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map(star => (
                <span
                    key={star}
                    className={star <= safeRating ? "star-filled" : "star-empty"}
                >
                    ★
                </span>
            ))}
        </div>
    );
}


// =====================================================
// CUSTOMER TESTIMONIAL CARD
// =====================================================

function TestimonialCard({ item }) {
    const isBusiness = item.type === "b2b";

    return (
        <article className="testimonial-card">

            <div className="testimonial-card-header">

                <TestimonialImage
                    src={item.image}
                    name={item.name}
                    className="testimonial-customer-image"
                />

                <div className="testimonial-customer-info">
                    <h4>{item.name}</h4>

                    {isBusiness ? (
                        <>
                            <p>{item.designation || "Business Partner"}</p>
                            {item.businessName && (
                                <span>{item.businessName}</span>
                            )}
                        </>
                    ) : (
                        <p>{item.location || "Customer"}</p>
                    )}
                </div>

            </div>

            <TestimonialRating rating={item.rating} />

            <p className="testimonial-review">
                "{item.review}"
            </p>

            {isBusiness && item.logo && (
                <div className="testimonial-business-logo">
                    <img
                        src={item.logo}
                        alt={`${item.businessName || "Business"} logo`}
                        onError={event => {
                            event.currentTarget.style.display = "none";
                        }}
                    />
                </div>
            )}

        </article>
    );
}


// =====================================================
// CUSTOMER CARD SLIDER
// =====================================================

function CustomerTestimonialSlider({ testimonials }) {
    const sliderRef = useRef(null);

    const slide = direction => {
        if (!sliderRef.current) return;

        const slider = sliderRef.current;
        const amount = slider.clientWidth * 0.8;

        slider.scrollBy({
            left: direction * amount,
            behavior: "smooth"
        });
    };

    if (!testimonials.length) {
        return (
            <p className="testimonial-empty">
                No testimonials available yet.
            </p>
        );
    }

    return (
        <div className="testimonial-customer-slider">

            <div className="testimonial-slider-controls">

                <button
                    type="button"
                    className="testimonial-arrow"
                    onClick={() => slide(-1)}
                    aria-label="Previous testimonials"
                >
                    &#8592;
                </button>

                <button
                    type="button"
                    className="testimonial-arrow"
                    onClick={() => slide(1)}
                    aria-label="Next testimonials"
                >
                    &#8594;
                </button>

            </div>

            <div
                className="testimonial-card-track"
                ref={sliderRef}
            >
                {testimonials.map(item => (
                    <div
                        className="testimonial-card-item"
                        key={item.id}
                    >
                        <TestimonialCard item={item} />
                    </div>
                ))}
            </div>

        </div>
    );
}


// =====================================================
// FULL-WIDTH BRAND TESTIMONIAL SLIDER
// =====================================================

function BrandTestimonialSlider({ testimonials }) {
    const [activeIndex, setActiveIndex] = useState(0);

    if (!testimonials.length) {
        return (
            <p className="testimonial-empty">
                No brand testimonials available yet.
            </p>
        );
    }

    const activeTestimonial = testimonials[activeIndex];

    const previousSlide = () => {
        setActiveIndex(current =>
            current === 0 ? testimonials.length - 1 : current - 1
        );
    };

    const nextSlide = () => {
        setActiveIndex(current =>
            current === testimonials.length - 1 ? 0 : current + 1
        );
    };

    return (
        <div className="testimonial-brand-slider">

            <div
                className="testimonial-brand-slide"
                key={activeTestimonial.id}
                style={
                    activeTestimonial.background
                        ? {
                            backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url("${activeTestimonial.background}")`
                        }
                        : {}
                }
            >

                <div className="testimonial-brand-content">

                    {activeTestimonial.logo && (
                        <div className="testimonial-brand-logo">
                            <img
                                src={activeTestimonial.logo}
                                alt={`${activeTestimonial.brandName} logo`}
                                onError={event => {
                                    event.currentTarget.style.display = "none";
                                }}
                            />
                        </div>
                    )}

                    <span className="testimonial-brand-label">
                        BRAND TESTIMONIAL
                    </span>

                    <blockquote className="testimonial-brand-quote">
                        "{activeTestimonial.review}"
                    </blockquote>

                    <div className="testimonial-brand-details">
                        <h3>{activeTestimonial.brandName}</h3>

                        {activeTestimonial.representative && (
                            <p>
                                {activeTestimonial.representative}
                                {activeTestimonial.designation
                                    ? ` | ${activeTestimonial.designation}`
                                    : ""}
                            </p>
                        )}
                    </div>

                </div>

            </div>


            <div className="testimonial-brand-navigation">

                <button
                    type="button"
                    className="testimonial-arrow"
                    onClick={previousSlide}
                    aria-label="Previous brand testimonial"
                >
                    &#8592;
                </button>

                <div className="testimonial-brand-dots">
                    {testimonials.map((item, index) => (
                        <button
                            type="button"
                            key={item.id}
                            className={
                                index === activeIndex
                                    ? "testimonial-dot active"
                                    : "testimonial-dot"
                            }
                            onClick={() => setActiveIndex(index)}
                            aria-label={`Go to brand testimonial ${index + 1}`}
                            aria-current={index === activeIndex ? "true" : undefined}
                        />
                    ))}
                </div>

                <button
                    type="button"
                    className="testimonial-arrow"
                    onClick={nextSlide}
                    aria-label="Next brand testimonial"
                >
                    &#8594;
                </button>

            </div>

        </div>
    );
}



// MAIN REUSABLE TESTIMONIAL COMPONENT

export function TestimonialSection({
    type = "b2c",
    layout,
    title = '',
    subtitle = '',
    testimonials = testimonialData,
    limit,
    featured = false,
    showControls = true,
    className = ""
}) {
    const allowedTypes = ["b2c", "b2b", "brand"];

    if (!allowedTypes.includes(type)) {
        console.error(`Invalid testimonial type: ${type}`);

        return null;
    }

    const selectedTestimonials = getTestimonials({
        testimonials,
        type,
        featured,
        limit
    });

    // Brands use the full-width slider by default.
    // Customers and businesses use card sliders.

    const selectedLayout = layout || (
        type === "brand" ? "full" : "cards"
    );

    if (!["cards", "full"].includes(selectedLayout)) {
        console.error(`Invalid testimonial layout: ${selectedLayout}`);

        return null;
    }

    // Full-width slider is reserved for brand testimonials.

    let sectionTitle = "What Our Customers Say";
    let sectionSubtitle = "Hear what our customers have to say about their KONFiZ experience.";

    if (type === "b2b") {
        sectionTitle = "What Our Business Partners Say";
        sectionSubtitle = "Discover how KONFiZ helps businesses grow with quality ice cream and reliable service.";
    }
    else if (type === "brand") {
        sectionTitle = "What Brands Say About Us";
        sectionSubtitle = "Building strong partnerships through quality, trust and shared success.";
    }

    // Custom title always gets priority
    if (title && title.trim() !== "") {
        sectionTitle = title;
    }

    // Custom subtitle gets priority; otherwise use the default
    const finalSubtitle = subtitle || sectionSubtitle;

    return (
        <section className={`testimonial-section testimonial-${type} ${className}`}>

            <div className="testimonial-section-heading">

               
                <h2>{sectionTitle}</h2>
                <p className="testimonial-section-subtitle">
                    {finalSubtitle}
                </p>
            </div>

            {selectedLayout === "full" ? (
                <BrandTestimonialSlider
                    testimonials={selectedTestimonials}
                />
            ) : (
                <CustomerTestimonialSlider
                    testimonials={selectedTestimonials}
                    showControls={showControls}
                />
            )}

        </section>


    );
}




export default TestimonialSection;


// BRAND PARTNERS MARQUEE ----------------------


export const brandPartners = [
    {
        id: 1,
        name: "Amul",
        logo: "/images/brands/amul.png",
    },
    {
        id: 2,
        name: "Brand Two",
        logo: "/images/brands/amul.png",

    },
    {
        id: 3,
        name: "Brand Three",
        logo: "/images/brands/amul.png",

    },
    {
        id: 4,
        name: "Brand Four",
        logo: "/images/brands/amul.png",

    },
    {
        id: 5,
        name: "Brand Five",
        logo: "/images/brands/amul.png",

    },
    {
        id: 6,
        name: "Brand Six",
        logo: "/images/brands/amul.png",

    }
];


export function BrandPartnersStrip({
    title = "Brands That Grow With Us",
    description = "From local businesses to established brands, our partnerships are built on trust, quality and a shared passion for creating delightful experiences for every customer together.",
    partners = brandPartners,
    speed = 30,
    className = ""
}) {
    const activePartners = partners.filter(
        partner => partner.logo && partner.status !== "inactive"
    );

    if (!activePartners.length) {
        return null;
    }

    return (
        <div className={`container ${className}`}>
            {/* Section Heading */}
            <div className="brand-partners-heading">
                <h2>{title}</h2>
                <p>{description}</p>
            </div>

            {/* Brand Marquee */}
            <div className="brand-marquee">
                <div className="brand-marquee-track">
                    {[...activePartners, ...activePartners].map((partner, index) => (
                        <div
                            className="brand-marquee-item"
                            key={`${partner.id}-${index}`}
                        >
                            <h3>{partner.name}</h3>
                            <img
                                src={partner.logo}
                                alt={partner.name}
                                loading="lazy"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}