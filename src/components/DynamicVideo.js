
import React from "react";
import "../style/dynamicVideo.css";

function DynamicVideo({
    video,
    className = "",
    showContent = true
}) {

    if (!video || !video.src) {
        return null;
    }

    const {
        id,
        src,
        title,
        description,
        layout = "standard",
        aspectRatio = "16/9",
        autoplay = false,
        muted = true,
        loop = false,
        controls = true,
        overlay = false,
        buttonText,
        buttonLink
    } = video;

    return (
        <section
            className={`dynamic-video-section ${layout} ${className}`}
            id={id}
        >

            <div
                className={`dynamic-video-wrapper ${overlay ? "has-overlay" : ""}`}
                style={{ aspectRatio }}
            >

                <video
                    src={src}
                    autoPlay={autoplay}
                    muted={muted || autoplay}
                    loop={loop}
                    controls={controls}
                    playsInline
                    preload="metadata"
                />

                {showContent && (title || description || buttonText) && (
                    <div className="dynamic-video-content">

                        {title && <h2>{title}</h2>}

                        {description && <p>{description}</p>}

                        {buttonText && buttonLink && (
                            <a
                                href={buttonLink}
                                className="video-cta"
                            >
                                {buttonText} →
                            </a>
                        )}

                    </div>
                )}

            </div>

        </section>
    );
}

export default DynamicVideo;
