
import express from "express";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import { productOwnershipMiddleware } from "../middleware/productOwnershipMiddleware.js";

import {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct
} from "../controllers/productsController.js";

const router = express.Router();

// Get all products
router.get("/", getProducts);

// Get one product
router.get("/:id", getProduct);

// Create product
router.post(
    "/",
    authMiddleware,
    roleMiddleware("seller", "admin"),
    createProduct
);

// Update product
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("seller", "admin"),
    productOwnershipMiddleware,
    updateProduct
);

// Delete product
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("seller", "admin"),
    productOwnershipMiddleware,
    deleteProduct
);

export default router;