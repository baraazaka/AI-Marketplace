
import express from "express";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import { orderOwnershipMiddleware } from "../middleware/orderOwnershipMiddleware.js";

import {
    getOrders,
    getMyOrders,
    getOrder,
    createOrder,
    updateOrder,
    deleteOrder,
    getSellerOrders,
    getSellerOrder,
    updateSellerOrderStatus,
    getSellerDashboard,
    getSellerAnalytics,
    getAdminDashboard,
    getAdminAnalytics,
   getAdminOverview,
   updateAdminOrderStatus

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

router.get(
    "/admin/overview",
    authMiddleware,
    roleMiddleware("admin"),
    getAdminOverview
);



router.get(
    "/admin/analytics",
    authMiddleware,
    roleMiddleware("admin"),
    getAdminAnalytics
);


router.get(
    "/seller/analytics",
    authMiddleware,
    roleMiddleware("seller", "admin"),
    getSellerAnalytics
);
// Get my orders
// Authenticated users
router.get(
    "/me",
    authMiddleware,
    roleMiddleware("user", "seller", "admin"),
    getMyOrders
);

router.get(
    "/admin/dashboard",
    authMiddleware,
    roleMiddleware("admin"),
    getAdminDashboard
);



router.get(
    "/seller",
    authMiddleware,
    roleMiddleware("seller", "admin"),
    getSellerOrders
);
router.get(
    "/seller/dashboard",
    authMiddleware,
    roleMiddleware("seller", "admin"),
    getSellerDashboard
);
router.get(
    "/seller/:id",
    authMiddleware,
    roleMiddleware("seller", "admin"),
    getSellerOrder
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

router.put(
    "/admin/:id/status",
    authMiddleware,
    roleMiddleware("admin"),
    updateAdminOrderStatus
);


router.put(
    "/seller/:id/status",
    authMiddleware,
    roleMiddleware("seller", "admin"),
    updateSellerOrderStatus
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

