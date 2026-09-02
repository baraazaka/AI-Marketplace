import express from "express";
import {
    getCategories,
    getCategory,
    createCategory
} from "../controllers/categoriesController.js";
const router = express.Router();

router.get("/", getCategories);
router.get("/:id", getCategory);
router.post("/", createCategory);
export default router;