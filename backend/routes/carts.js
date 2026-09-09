
import express from "express";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import { cartOwnershipMiddleware } from "../middleware/cartOwnershipMiddleware.js";

import {
    getCarts,
    getMyCart,
    getCart,
    createCart,
    updateCart,
    deleteCart
} from "../controllers/cartsController.js";

const router = express.Router();


// ========================================
// Get all carts
// Admin only
// ========================================

router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    getCarts
);


// ========================================
// Get current user's cart
// Authenticated users
// ========================================

router.get(
    "/me",
    authMiddleware,
    roleMiddleware("user", "seller", "admin"),
    getMyCart
);


// ========================================
// Get one cart
// Owner or Admin
// ========================================

router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("user", "seller", "admin"),
    cartOwnershipMiddleware,
    getCart
);


// ========================================
// Create cart
// Authenticated users
// ========================================

router.post(
    "/",
    authMiddleware,
    createCart
);


// ========================================
// Update cart
// Owner or Admin
// ========================================

router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("user", "seller", "admin"),
    cartOwnershipMiddleware,
    updateCart
);


// ========================================
// Delete cart
// Owner or Admin
// ========================================

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("user", "seller", "admin"),
    cartOwnershipMiddleware,
    deleteCart
);


export default router;
