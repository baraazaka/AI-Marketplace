import express from "express";
import cors from "cors";
import productRoutes from "./routes/products.js";
import categoryRoutes from "./routes/categories.js";
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "AI Marketplace Backend is running"
    });
});

app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});