
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./db");
const api = require("./api");
const blogApi = require("./blog-api.js");  


const app = express();

app.use(cors({
    origin: "http://localhost:3000"
}));

app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ extended: true, limit: "30mb" }));

app.use("/api", api);
app.use("/api/blogs", blogApi);   

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log("KONFiZ Server running on port " + PORT);
             console.log("Product API: http://localhost:" + PORT + "/api");
            console.log("Blog API: http://localhost:" + PORT + "/api/blogs");
        });
    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
};

startServer();
