
import React, { useState, useEffect } from "react";
import "./ProductGallery.css";

const ProductGallery = ({
    images = [],
    productName = "Product",
    layout = "vertical",
    showThumbnails = true,
    showArrows = true,
    imageFit = "contain",
    className = "",
    onImageChange
}) => {

    const validImages = images
        .map((image, index) => {
            if (typeof image === "string") {
                return {
                    id: index,
                    url: image,
                    alt: `${productName} image ${index + 1}`
                };
            }

            return image?.url
                ? {
                    id: image.id ?? index,
                    url: image.url,
                    alt: image.alt || `${productName} image ${index + 1}`
                }
                : null;
        })
        .filter(Boolean);

    const [activeIndex, setActiveIndex] = useState(0);
    const [zoom, setZoom] = useState(false);

    useEffect(() => {
        setActiveIndex(0);
        setZoom(false);
    }, [images]);

    if (!validImages.length) {
        return (
            <div className="gallery-no-image">
                No Image Available
            </div>
        );
    }

    const activeImage = validImages[activeIndex];

    const changeImage = (index) => {
        const nextIndex =
            (index + validImages.length) % validImages.length;

        setActiveIndex(nextIndex);
        setZoom(false);

        if (onImageChange) {
            onImageChange(validImages[nextIndex], nextIndex);
        }
    };

    return (
        <div className={`product-gallery gallery-${layout} ${className}`}>

            {/* Thumbnail section */}
            {showThumbnails && validImages.length > 1 && (
                <div className="gallery-thumbnails">
                    {validImages.map((image, index) => (
                        <button
                            type="button"
                            key={image.id}
                            className={`gallery-thumb ${
                                activeIndex === index ? "active" : ""
                            }`}
                            onClick={() => changeImage(index)}
                            aria-label={`View image ${index + 1}`}
                        >
                            <img
                                src={image.url}
                                alt={image.alt}
                            />
                        </button>
                    ))}
                </div>
            )}

            {/* Main image */}
            <div
                className={`gallery-main ${zoom ? "zoomed" : ""}`}
                onMouseEnter={() => setZoom(true)}
                onMouseLeave={() => setZoom(false)}
            >
                <img
                    src={activeImage.url}
                    alt={activeImage.alt}
                    className={`gallery-main-image fit-${imageFit}`}
                />

                {showArrows && validImages.length > 1 && (
                    <>
                        <button
                            type="button"
                            className="gallery-arrow gallery-prev"
                            onClick={() => changeImage(activeIndex - 1)}
                            aria-label="Previous image"
                        >
                            &#10094;
                        </button>

                        <button
                            type="button"
                            className="gallery-arrow gallery-next"
                            onClick={() => changeImage(activeIndex + 1)}
                            aria-label="Next image"
                        >
                            &#10095;
                        </button>
                    </>
                )}

                <span className="gallery-counter">
                    {activeIndex + 1} / {validImages.length}
                </span>
            </div>

        </div>
    );
};

export default ProductGallery;
