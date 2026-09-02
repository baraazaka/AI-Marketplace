import express from "express";

import {
    getOrderItems,
    getOrderItem,
    createOrderItem,
    updateOrderItem,
    deleteOrderItem
} from "../controllers/orderItemsController.js";

const router = express.Router();

router.get("/", getOrderItems);
router.get("/:id", getOrderItem);
router.post("/", createOrderItem); 
router.put("/:id", updateOrderItem);
router.delete("/:id", deleteOrderItem);

export default router;