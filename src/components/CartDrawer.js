
import React, { useEffect } from "react";
import CartContent from "./cartcontent";
import DynamicIcon from "./dynamicIcon";
import "../style/cartDrawer.css";

function CartDrawer({ isOpen, onClose }) {

    useEffect(() => {

        if (!isOpen) return;

        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = "hidden";

        const handleEscape = (e) => {
            if (e.key === "Escape") onClose();
        };

        window.addEventListener("keydown", handleEscape);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleEscape);
        };

    }, [isOpen, onClose]);

    return (

        <>
            {/* BACKDROP */}

            <div
                className={`cart-drawer-backdrop ${isOpen ? "show" : ""}`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* OFF CANVAS */}

            <aside
                className={`cart-drawer ${isOpen ? "open" : ""}`}
                role="dialog"
                aria-modal="true"
                aria-label="Shopping cart"
                aria-hidden={!isOpen}
                inert={!isOpen ? true : undefined}
            >

                <div className="cart-drawer-top">

                    <div>
                        <h2>Shopping Bag</h2>
                        <p>Your delicious selections</p>
                    </div>

                    <button
                        type="button"
                        className="cart-drawer-close"
                        onClick={onClose}
                        aria-label="Close cart"
                    >
                        <DynamicIcon name="close" size={23} />
                    </button>

                </div>

                <div className="cart-drawer-content">

                    <CartContent
                        drawer={true}
                        onClose={onClose}
                    />

                </div>

            </aside>

        </>
    );
}

export default CartDrawer;
