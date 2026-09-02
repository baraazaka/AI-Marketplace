import express from "express";
import { getCarts } from "../controllers/cartsController.js";

const router = express.Router();

router.get("/", getCarts);

export default router;