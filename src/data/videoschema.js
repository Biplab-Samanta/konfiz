
/*
================================================
KONFiZ CENTRAL VIDEO SCHEMA
================================================
All reusable website videos are managed here.
Product videos are excluded.
*/

import homeVideo from "../images/banner/large.mp4";
// import aboutVideo from "../assets/videos/about/our-story.mp4";
// import summerVideo from "../assets/videos/promotional/summer-offer.mp4";
// import makingVideo from "../assets/videos/general/icecream-making.mp4";

const videoSchema = {

    home: {
        id: "home-showcase",
        src: homeVideo,
        title: "A World of Ice Cream Happiness",
        description: "Discover delicious flavours and unforgettable moments.",
        layout: "wide",
        aspectRatio: "16/9",
        autoplay: true,
        muted: true,
        loop: true,
        controls: false,
        overlay: true,
        buttonText: "Explore Flavours",
        buttonLink: "#products"
    }

    // about: {
    //     id: "our-story-video",
    //     src: aboutVideo,
    //     title: "Our Story, Our Passion",
    //     description: "Every scoop is made to bring a little more happiness.",
    //     layout: "split",
    //     aspectRatio: "16/9",
    //     autoplay: false,
    //     muted: true,
    //     loop: false,
    //     controls: true,
    //     overlay: false
    // },

    // summerOffer: {
    //     id: "summer-promotion",
    //     src: summerVideo,
    //     title: "Make This Summer Sweeter",
    //     description: "Enjoy the delicious taste of summer with KONFiZ.",
    //     layout: "banner",
    //     aspectRatio: "21/9",
    //     autoplay: true,
    //     muted: true,
    //     loop: true,
    //     controls: false,
    //     overlay: true,
    //     buttonText: "Shop Now",
    //     buttonLink: "#products"
    // },

    // making: {
    //     id: "icecream-making",
    //     src: makingVideo,
    //     title: "Made with Love",
    //     description: "See the care behind every delicious scoop.",
    //     layout: "standard",
    //     aspectRatio: "16/9",
    //     autoplay: false,
    //     muted: true,
    //     loop: false,
    //     controls: true,
    //     overlay: false
    // }

};

export default videoSchema;
