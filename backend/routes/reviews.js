
import express from "express";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import { reviewOwnershipMiddleware } from "../middleware/reviewOwnershipMiddleware.js";

import {
    getReviews,
    getReview,
    createReview,
    updateReview,
    deleteReview
} from "../controllers/reviewsController.js";

const router = express.Router();


// Get all reviews
// Public
router.get(
    "/",
    getReviews
);


// Get one review
// Public
router.get(
    "/:id",
    getReview
);


// Create review
// Authenticated users
router.post(
    "/",
    authMiddleware,
    createReview
);


// Update review
// Owner or Admin
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("user", "seller", "admin"),
    reviewOwnershipMiddleware,
    updateReview
);


// Delete review
// Owner or Admin
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("user", "seller", "admin"),
    reviewOwnershipMiddleware,
    deleteReview
);


export default router;

