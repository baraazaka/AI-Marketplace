import express from "express";

import {
    getProducts,
    getProduct,
    createProduct,
    updateProduct
} from "../controllers/productsController.js";

const router = express.Router();

router.get("/", getProducts);

router.get("/:id", getProduct);

router.post("/", createProduct);

router.put("/:id", updateProduct);

export default router;