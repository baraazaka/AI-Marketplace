import express from "express";
import {
    getCartItems,
    getCartItem,
    createCartItem,
    updateCartItem,
    deleteCartItem
} from "../controllers/cartItemsController.js";

const router = express.Router();

router.get("/", getCartItems);
router.get("/:id", getCartItem);
router.post("/", createCartItem);
router.put("/:id", updateCartItem);
router.delete("/:id", deleteCartItem);

export default router;