
import express from "express";

import { authMiddleware } from "../middleware/authMiddleware.js";

import { roleMiddleware } from "../middleware/roleMiddleware.js";

import { cartItemOwnershipMiddleware } from "../middleware/cartItemOwnershipMiddleware.js";

import {
    getCartItems,
    getMyCartItems,
    getCartItem,
    createCartItem,
    updateCartItem,
    deleteCartItem
} from "../controllers/cartItemsController.js";

const router = express.Router();


// ========================================
// Get all cart items
// Admin only
// ========================================

router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    getCartItems
);


// ========================================
// Get current user's cart items
// Authenticated users
// ========================================

router.get(
    "/me",
    authMiddleware,
    roleMiddleware("user", "seller", "admin"),
    getMyCartItems
);


// ========================================
// Get one cart item
// Owner or Admin
// ========================================

router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("user", "seller", "admin"),
    cartItemOwnershipMiddleware,
    getCartItem
);


// ========================================
// Create cart item
// Authenticated users
// ========================================

router.post(
    "/",
    authMiddleware,
    cartItemOwnershipMiddleware,
    createCartItem
);


// ========================================
// Update cart item
// Owner or Admin
// ========================================

router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("user", "seller", "admin"),
    cartItemOwnershipMiddleware,
    updateCartItem
);


// ========================================
// Delete cart item
// Owner or Admin
// ========================================

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("user", "seller", "admin"),
    cartItemOwnershipMiddleware,
    deleteCartItem
);


export default router;

