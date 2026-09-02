import express from "express";

import {
    getCarts,
    getCart,
    createCart,
    updateCart
} from "../controllers/cartsController.js";
const router = express.Router();

router.get("/", getCarts);
router.get("/:id", getCart);
router.post("/", createCart);
router.put("/:id", updateCart);

export default router;