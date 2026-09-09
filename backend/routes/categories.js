
import express from "express";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

import {
    getCategories,
    getCategory,
    getCategoryProducts,
    createCategory,
    updateCategory,
    deleteCategory
} from "../controllers/categoriesController.js";

const router = express.Router();

// Public routes
router.get("/", getCategories);

router.get("/:id/products", getCategoryProducts);

router.get("/:id", getCategory);

// Admin only
router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    createCategory
);

router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    updateCategory
);

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    deleteCategory
);

export default router;

