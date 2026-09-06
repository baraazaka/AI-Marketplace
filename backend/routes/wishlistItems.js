
import express from "express";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import { wishlistItemOwnershipMiddleware } from "../middleware/wishlistItemOwnershipMiddleware.js";

import {
    getWishlistItems,
    getWishlistItem,
    createWishlistItem,
    deleteWishlistItem
} from "../controllers/wishlistItemsController.js";

const router = express.Router();


// Get all wishlist items
// Admin only
router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    getWishlistItems
);


// Get one wishlist item
// Owner or Admin
router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("user", "seller", "admin"),
    wishlistItemOwnershipMiddleware,
    getWishlistItem
);


// Create wishlist item
// Authenticated users
router.post(
    "/",
    authMiddleware,
    wishlistItemOwnershipMiddleware,
    createWishlistItem
);


// Delete wishlist item
// Owner or Admin
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("user", "seller", "admin"),
    wishlistItemOwnershipMiddleware,
    deleteWishlistItem
);


export default router;

