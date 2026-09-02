import express from "express";
import { getCartItems } from "../controllers/cartItemsController.js";

const router = express.Router();

router.get("/", getCartItems);

export default router;