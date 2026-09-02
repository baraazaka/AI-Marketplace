import express from "express";
import {
    getCategories,
    getCategory,
    createCategory,
    updateCategory
} from "../controllers/categoriesController.js";
const router = express.Router();

router.get("/", getCategories);
router.get("/:id", getCategory);
router.post("/", createCategory);
router.put("/:id", updateCategory);
export default router;