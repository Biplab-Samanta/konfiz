
import React, { useState } from "react";
import "../style/faq.css";

const FAQ = ({
    heading = "Frequently Asked Questions",
    subheading = "Got questions? We've got answers to make your KONFiZ experience sweeter.",
    limit = 3
}) => {

    // FAQ DATA
    const faqData = [
        {
            id: 1,
            question: "What makes KONFiZ ice cream special?",
            answer: "At KONFiZ, we focus on delightful flavours, quality ingredients and creating a happy experience with every scoop."
        },
        {
            id: 2,
            question: "What flavours of ice cream do you offer?",
            answer: "We offer a variety of delicious flavours, including chocolate, vanilla, strawberry and many exciting combinations."
        },
        {
            id: 3,
            question: "Can I order ice cream online?",
            answer: "Yes! Browse our collection, select your favourite flavours, add products to your cart and place your order online."
        },
        {
            id: 4,
            question: "Do you offer different sizes?",
            answer: "Yes, selected products are available in different sizes. Choose your preferred size while selecting a product."
        },
        {
            id: 5,
            question: "Do you provide home delivery?",
            answer: "Delivery availability depends on your location. Check the available delivery options when placing your order."
        },
        {
            id: 6,
            question: "How can I contact KONFiZ?",
            answer: "You can reach us through the contact information available on our website."
        },
        {
            id: 7,
            question: "Can I customize my ice cream?",
            answer: "Selected products may offer different sizes and add-ons so you can personalize your order."
        },
        {
            id: 8,
            question: "How can I track my order?",
            answer: "You can check your order details and status through the order section when tracking is available."
        }
    ];

    // ACCORDION STATE
    const [activeIndex, setActiveIndex] = useState(null);

    const toggleFAQ = (index) => {
        setActiveIndex(prev => prev === index ? null : index);
    };

    return (
        <section className="faq-section">

            {/* SECTION HEADING */}
            <div className="faq-heading">
                <span className="faq-subtitle">GOT QUESTIONS?</span>

                <h2>{heading}</h2>

                <p>{subheading}</p>
            </div>

            {/* FAQ ACCORDIONS */}
            <div className="faq-container">

                {faqData.slice(0, limit).map((item, index) => (

                    <div
                        className={`faq-item ${
                            activeIndex === index ? "active" : ""
                        }`}
                        key={item.id}
                    >

                        <button
                            type="button"
                            className="faq-question"
                            onClick={() => toggleFAQ(index)}
                            aria-expanded={activeIndex === index}
                        >
                            <span>{item.question}</span>

                            <span className="faq-icon">
                                {activeIndex === index ? "−" : "+"}
                            </span>
                        </button>

                        <div className="faq-answer">
                            <div className="faq-answer-content">
                                {item.answer}
                            </div>
                        </div>

                    </div>

                ))}

            </div>

        </section>
    );
};

export default FAQ;
