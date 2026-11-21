
/*
================================================
KONFiZ CENTRAL IMAGE SCHEMA
================================================
All common website images are managed here.
Product images are intentionally excluded.
*/

import logo from "../assets/images/logo/konfiz-logo.png";

// HERO SLIDER IMAGES
import hero1 from "../assets/images/hero/hero-1.jpg";
import hero2 from "../assets/images/hero/hero-2.jpg";
import hero3 from "../assets/images/hero/hero-3.jpg";

// BANNER IMAGES
import offerBanner from "../assets/images/banners/offer-banner.jpg";
import summerBanner from "../assets/images/banners/summer-banner.jpg";
import icecream from "../images/banner/sundae-a-la-creme-glacee-maison-.jpg";

// CATEGORY IMAGES
import cones from "../assets/images/categories/cones.jpg";
import tubs from "../assets/images/categories/tubs.jpg";
import familyPacks from "../assets/images/categories/family-packs.jpg";
import sundaes from "../assets/images/categories/sundaes.jpg";

// ABOUT IMAGES
import ourStory from "../assets/images/about/our-story.jpg";

// GENERAL IMAGES
import delivery from "../assets/images/general/delivery.jpg";
import quality from "../assets/images/general/quality.jpg";



const imageSchema = {

    // BRAND
    brand: {
        logo: {
            src: logo,
            alt: "KONFiZ Ice Cream Logo"
        }
    },

    // HERO SLIDER
    hero: [
        {
            id: 1,
            image: hero1,
            alt: "KONFiZ delicious ice cream",
            eyebrow: "MADE FOR YOUR HAPPY MOMENTS",
            title: "A Little Scoop",
            highlight: "Of Happiness.",
            description:
                "Life is better with ice cream. Discover your favourite flavours and make every moment delicious.",
            note: "Fresh flavours. Endless happiness.",
            badge: "100% Happiness",
            badgeText: "In every scoop"
        },

        {
            id: 2,
            image: hero2,
            alt: "Fresh and creamy ice cream",
            eyebrow: "TASTE THE MAGIC",
            title: "Sweet Moments",
            highlight: "Made Special.",
            description:
                "From creamy classics to exciting new flavours, find the perfect scoop for every occasion.",
            note: "Every flavour tells a story.",
            badge: "Fresh & Creamy",
            badgeText: "Made with love"
        },

        {
            id: 3,
            image: hero3,
            alt: "Delicious ice cream flavours",
            eyebrow: "HAPPINESS IN EVERY BITE",
            title: "Discover Your",
            highlight: "Favourite Flavour.",
            description:
                "Treat yourself to delicious ice cream and turn ordinary days into extraordinary memories.",
            note: "Scoop more. Smile more.",
            badge: "Pure Delight",
            badgeText: "A taste of joy"
        }
    ],

    // PROMOTIONAL BANNERS
    banners: {
        offers: {
            src: offerBanner,
            alt: "KONFiZ special offers"
        },

        summer: {
            src: summerBanner,
            alt: "KONFiZ summer special"
        }
    },

    // CATEGORY IMAGES
    categories: {
        cones: {
            src: cones,
            alt: "Ice cream cones"
        },

        tubs: {
            src: tubs,
            alt: "Ice cream tubs"
        },

        familyPacks: {
            src: familyPacks,
            alt: "Family ice cream packs"
        },

        sundaes: {
            src: sundaes,
            alt: "Ice cream sundaes"
        }
    },

    // ABOUT US
    about: {
        story: {
            src: ourStory,
            alt: "KONFiZ our story"
        }
    },

    // GENERAL WEBSITE IMAGES
    general: {
        delivery: {
            src: delivery,
            alt: "Ice cream delivery"
        },

        quality: {
            src: quality,
            alt: "Quality ice cream ingredients"
        }
    }

};

export default imageSchema;
