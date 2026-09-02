import express from "express";

import {
    getCarts,
    getCart,
    createCart
} from "../controllers/cartsController.js";
const router = express.Router();

router.get("/", getCarts);
router.get("/:id", getCart);
router.post("/", createCart);

export default router;