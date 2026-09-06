
import express from "express";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import { orderItemOwnershipMiddleware } from "../middleware/orderItemOwnershipMiddleware.js";

import {
    getOrderItems,
    getOrderItem,
    createOrderItem,
    updateOrderItem,
    deleteOrderItem
} from "../controllers/orderItemsController.js";

const router = express.Router();


// Get all order items
// Admin only
router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    getOrderItems
);


// Get one order item
// Owner or Admin
router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("user", "seller", "admin"),
    orderItemOwnershipMiddleware,
    getOrderItem
);


// Create order item
// Authenticated users
router.post(
    "/",
    authMiddleware,
    orderItemOwnershipMiddleware,
    createOrderItem
);


// Update order item
// Owner or Admin
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("user", "seller", "admin"),
    orderItemOwnershipMiddleware,
    updateOrderItem
);


// Delete order item
// Owner or Admin
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("user", "seller", "admin"),
    orderItemOwnershipMiddleware,
    deleteOrderItem
);


export default router;

