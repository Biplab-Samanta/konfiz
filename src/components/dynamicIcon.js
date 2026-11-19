
import React from "react";
import iconSchema from "../config/iconSchema";

function DynamicIcon({
    name,
    size = 22,
    color = "currentColor",
    strokeWidth = 2,
    className = "",
    fill = "none"
}) {

    const IconComponent = iconSchema[name];

    // FALLBACK IF ICON DOES NOT EXIST
    if (!IconComponent) {
        console.warn(`KONFiZ Icon not found: ${name}`);
        return null;
    }

    return (
        <IconComponent
            size={size}
            color={color}
            strokeWidth={strokeWidth}
            className={className}
            fill={fill}
        />
    );
}

export default DynamicIcon;
