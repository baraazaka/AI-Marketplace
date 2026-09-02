import express from "express";

import {
    getCarts,
    getCart
} from "../controllers/cartsController.js";

const router = express.Router();

router.get("/", getCarts);
router.get("/:id", getCart);

export default router;