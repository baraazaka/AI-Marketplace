
import express from "express";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import { orderOwnershipMiddleware } from "../middleware/orderOwnershipMiddleware.js";

import {
    getOrders,
    getOrder,
    createOrder,
    updateOrder,
    deleteOrder
} from "../controllers/ordersController.js";

const router = express.Router();


// Get all orders
// Admin only
router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    getOrders
);


// Get one order
// Owner or Admin
router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("user", "seller", "admin"),
    orderOwnershipMiddleware,
    getOrder
);


// Create order
// Authenticated users
router.post(
    "/",
    authMiddleware,
    createOrder
);


// Update order
// Owner or Admin
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("user", "seller", "admin"),
    orderOwnershipMiddleware,
    updateOrder
);


// Delete order
// Owner or Admin
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("user", "seller", "admin"),
    orderOwnershipMiddleware,
    deleteOrder
);


export default router;

