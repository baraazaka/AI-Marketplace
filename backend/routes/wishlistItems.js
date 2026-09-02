import express from "express";
import {
    getWishlistItems,
    getWishlistItem,
    createWishlistItem,
    deleteWishlistItem
} from "../controllers/wishlistItemsController.js";

const router = express.Router();

router.get("/", getWishlistItems);
router.get("/:id", getWishlistItem);
router.post("/", createWishlistItem);
router.delete("/:id", deleteWishlistItem);

export default router;