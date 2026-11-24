
import React from "react";
import "./ProductGallery.css";

// =====================================
// AUTOMATICALLY LOAD GALLERY IMAGES
// =====================================

const galleryContext = require.context(
    "../../images/gallery",
    false,
    /\.(png|jpe?g|webp|avif)$/i
);

const galleryImages = galleryContext.keys().map((path, index) => ({
    id: index + 1,
    image: galleryContext(path),
    name: path.split("/").pop().replace(/\.[^/.]+$/, "")
}));

// =====================================
// IMAGE GALLERY COMPONENT
// =====================================

const ImageGallery = ({
    heading = "Image Gallery",
    subheading = "A little glimpse of the happiness we create.",
    limit = 9   
}) => {

    // Display limited images
    const visibleImages = galleryImages.slice(0, limit);

    return (
        <section className="image-gallery-section">

            {/* SECTION HEADING */}

            <div className="image-gallery-heading">

                <span className="gallery-subtitle">
                    EXPLORE OUR WORLD
                </span>

                <h2>{heading}</h2>

                <p>{subheading}</p>

            </div>

            {/* IMAGE GALLERY */}

            <div className="image-gallery-grid">

                {visibleImages.map((item) => (

                    <div
                        className="gallery-image-card"
                        key={item.id}
                    >

                        <img
                            src={item.image}
                            alt={item.name}
                            loading="lazy"
                        />

                    </div>

                ))}

            </div>

            {visibleImages.length === 0 && (
                <p className="gallery-empty">
                    Gallery images will appear here.
                </p>
            )}

        </section>
    );
};

export default ImageGallery;
