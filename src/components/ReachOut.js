
import React, { useState } from "react";
import "../style/reachout.css";

const initialForm = {
    name: "",
    email: "",
    phone: "",
    subject: "General Enquiry",
    message: ""
};

const ReachOut = ({ onSubmit }) => {
    const [formData, setFormData] = useState(initialForm);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({
        type: "",
        message: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setStatus({ type: "", message: "" });

        if (
            !formData.name.trim() ||
            !formData.email.trim() ||
            !formData.message.trim()
        ) {
            setStatus({
                type: "error",
                message: "Please fill in all required fields."
            });
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(formData.email)) {
            setStatus({
                type: "error",
                message: "Please enter a valid email address."
            });
            return;
        }

        if (typeof onSubmit !== "function") {
            setStatus({
                type: "info",
                message: "Your form is ready. Submission service will be connected soon."
            });
            return;
        }

        try {
            setLoading(true);

            await onSubmit(formData);

            setStatus({
                type: "success",
                message: "Thank you! Your enquiry has been submitted successfully."
            });

            setFormData(initialForm);

        } catch (error) {
            console.error("Reach Out form error:", error);

            setStatus({
                type: "error",
                message: "Unable to submit your enquiry. Please try again."
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="reachout-section">
            <div className="reachout-container">

                {/* LEFT SIDE - DESCRIPTION */}
                <div className="reachout-info">

                    <span className="reachout-eyebrow">
                        GET IN TOUCH
                    </span>

                    <h2>
                        Let's Start a
                        <span> Conversation!</span>
                    </h2>

                    <p className="reachout-description">
                        Have a question about our products, need assistance
                        with an order, or interested in working with us?
                        We'd love to hear from you.

                        Reach out to our team and we'll be happy to help
                        you with the right information and support.
                    </p>

                    <div className="reachout-info-divider"></div>

                    <div className="reachout-highlights">

                        <div className="reachout-highlight">
                            <div className="reachout-icon">✉</div>
                            <div>
                                <h4>General Enquiries</h4>
                                <p>Questions, feedback and suggestions</p>
                            </div>
                        </div>

                        <div className="reachout-highlight">
                            <div className="reachout-icon">♧</div>
                            <div>
                                <h4>Business Partnerships</h4>
                                <p>Bulk orders, franchise and collaborations</p>
                            </div>
                        </div>

                        <div className="reachout-highlight">
                            <div className="reachout-icon">♡</div>
                            <div>
                                <h4>We're Here to Help</h4>
                                <p>Your satisfaction is always important to us</p>
                            </div>
                        </div>

                    </div>

                    <div className="reachout-bottom-note">
                        <span>✦</span>
                        Every great connection starts with a hello!
                    </div>

                </div>

                {/* RIGHT SIDE - FORM */}
                <div className="reachout-form-wrapper">

                    <div className="reachout-form-heading">
                        <h3>Send Us a Message</h3>
                        <p>Fill in the details below and we'll get back to you.</p>
                    </div>

                    <form
                        className="reachout-form"
                        onSubmit={handleSubmit}
                    >

                        <div className="reachout-grid">

                            <div className="reachout-field">
                                <label htmlFor="reachout-name">
                                    Full Name *
                                </label>
                                <input
                                    id="reachout-name"
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter your name"
                                    maxLength={100}
                                    required
                                />
                            </div>

                            <div className="reachout-field">
                                <label htmlFor="reachout-email">
                                    Email Address *
                                </label>
                                <input
                                    id="reachout-email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    maxLength={150}
                                    required
                                />
                            </div>

                            <div className="reachout-field">
                                <label htmlFor="reachout-phone">
                                    Phone Number
                                </label>
                                <input
                                    id="reachout-phone"
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Enter phone number"
                                    maxLength={20}
                                />
                            </div>

                            <div className="reachout-field">
                                <label htmlFor="reachout-subject">
                                    Enquiry Type
                                </label>
                                <select
                                    id="reachout-subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                >
                                    <option>General Enquiry</option>
                                    <option>Product Enquiry</option>
                                    <option>Bulk Orders</option>
                                    <option>Business Partnership</option>
                                    <option>Franchise Enquiry</option>
                                    <option>Feedback / Suggestions</option>
                                </select>
                            </div>

                        </div>

                        <div className="reachout-field">
                            <label htmlFor="reachout-message">
                                Your Message *
                            </label>
                            <textarea
                                id="reachout-message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                placeholder="Write your message here..."
                                rows={5}
                                maxLength={3000}
                                required
                            />
                        </div>

                        {status.message && (
                            <div
                                className={`reachout-status ${status.type}`}
                                role="status"
                            >
                                {status.message}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="reachout-submit"
                            disabled={loading}
                        >
                            {loading ? "Submitting..." : "Send Message →"}
                        </button>

                    </form>

                </div>

            </div>
        </section>
    );
};

export default ReachOut;
