import express from "express";
import { 
    getWishlists,
    getWishlist,
    createWishlist,
    updateWishlist,
    deleteWishlist
 } from "../controllers/wishlistsController.js";

const router = express.Router();

router.get("/", getWishlists);
router.get("/:id", getWishlist);
router.post("/", createWishlist);
router.put("/:id", updateWishlist);
router.delete("/:id", deleteWishlist);

export default router;