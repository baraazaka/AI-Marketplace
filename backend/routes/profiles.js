
import express from "express";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import { profileOwnershipMiddleware } from "../middleware/profileOwnershipMiddleware.js";

import {
    getProfiles,
    getProfile,
    createProfile,
    updateProfile,
    deleteProfile,
    getMyProfile,
    getAllUsers,
    updateUserRole,
    deleteUser
} from "../controllers/profilesController.js";

const router = express.Router();

// Get all profiles
// Admin only
router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    getProfiles
);
router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    getAllUsers
);
router.get(
    "/me",
    authMiddleware,
    getMyProfile
);
// Get one profile
// Owner or Admin
router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("user", "seller", "admin"),
    profileOwnershipMiddleware,
    getProfile
);

// Create profile
// Authenticated users
router.post(
    "/",
    authMiddleware,
    createProfile
);
router.put(
    "/:id/role",
    authMiddleware,
    roleMiddleware("admin"),
    updateUserRole
);

// Update profile
// Owner or Admin
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("user", "seller", "admin"),
    profileOwnershipMiddleware,
    updateProfile
);
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    deleteUser
);  
// Delete profile
// Owner or Admin
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("user", "seller", "admin"),
    profileOwnershipMiddleware,
    deleteProfile
);

export default router;

