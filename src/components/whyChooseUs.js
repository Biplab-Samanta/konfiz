 
import React from "react";
import "../style/whychooseus.css";

const features = [
    {
        icon: "🍦",
        title: "Premium Quality",
        description: "Made with carefully selected ingredients for delicious taste."
    },
    {
        icon: "❤️",
        title: "Made with Love",
        description: "Every scoop is crafted to bring smiles and happiness."
    },
    {
        icon: "🍓",
        title: "Amazing Flavours",
        description: "Explore exciting flavours for every mood and craving."
    },
    {
        icon: "🚚",
        title: "Fresh Delivery",
        description: "Enjoy your favourite treats delivered to your doorstep."
    },
    {
        icon: "✨",
        title: "Unique Creations",
        description: "Discover delightful combinations and special treats."
    },
    {
        icon: "😊",
        title: "Customer Happiness",
        description: "Your satisfaction and happiness are always our priority."
    }
];

const WhyChooseUs = () => {
    return (
        <section className="why-choose-section">

            <div className="why-choose-heading">
                <span className="why-subtitle">THE KONFIZ DIFFERENCE</span>

                <h2>Why Choose KONFiZ?</h2>

                <p>
                    More than just ice cream — it's happiness in every scoop!
                </p>
            </div>

            <div className="why-choose-grid">
                {features.map((item, index) => (
                    <div className="why-choose-card" key={index}>
                        <div className="why-icon">
                            {item.icon}
                        </div>

                        <h3>{item.title}</h3>

                        <p>{item.description}</p>
                    </div>
                ))}
            </div>

        </section>
    );
};

export default WhyChooseUs;
