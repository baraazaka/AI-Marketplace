import express from "express";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import { wishlistOwnershipMiddleware } from "../middleware/wishlistOwnershipMiddleware.js";

import {
    getWishlists,
    getMyWishlist,
    getWishlist,
    createWishlist,
    deleteWishlist
} from "../controllers/wishlistsController.js";

const router = express.Router();


// Get all wishlists
// Admin only
router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    getWishlists
);


// Get current user's wishlist
router.get(
    "/me",
    authMiddleware,
    roleMiddleware("user", "seller", "admin"),
    getMyWishlist
);


// Get one wishlist
// Owner or Admin
router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("user", "seller", "admin"),
    wishlistOwnershipMiddleware,
    getWishlist
);


// Create wishlist
// Authenticated users
router.post(
    "/",
    authMiddleware,
    createWishlist
);


// Delete wishlist
// Owner or Admin
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("user", "seller", "admin"),
    wishlistOwnershipMiddleware,
    deleteWishlist
);

export default router;

