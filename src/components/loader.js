
import React from "react";
import "../style/loader.css";

import iceCreamLoader from "../images/loader_images/loader.gif";

function Loader() {
    return (
        <div className="konfiz-loader">
            <div className="logo">
                KONFiZ
                <small>ICE CREAM</small>
            </div>
            <br />
            <div><img
                src={iceCreamLoader}
                alt="Loading"
                className="loader-icecream"
            /></div>


        </div>
    );
}

export default Loader;
