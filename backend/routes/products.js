import express from "express";

import {
    getProducts,
    getProduct,
    createProduct,
} from "../controllers/productsController.js";

const router = express.Router();

router.get("/", getProducts);

router.get("/:id", getProduct);

router.post("/", createProduct);

export default router;