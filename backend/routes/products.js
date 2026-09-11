
import express from "express";
import multer from "multer";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import { productOwnershipMiddleware } from "../middleware/productOwnershipMiddleware.js";

import {
    getProducts,
    getProduct,
    getMyProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getAdminProducts,
} from "../controllers/productsController.js";

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed"));
        }
    }
});


// Get all products
router.get("/", getProducts);

router.get(
    "/admin",
    authMiddleware,
    roleMiddleware("admin"),
    getAdminProducts
);



// Get seller's products
router.get(
    "/me",
    authMiddleware,
    roleMiddleware("seller", "admin"),
    getMyProducts
);


// Get one product
router.get("/:id", getProduct);


// Create product
router.post(
    "/",
    authMiddleware,
    roleMiddleware("seller", "admin"),
    upload.single("image"),
    createProduct
);


router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("seller", "admin"),
    productOwnershipMiddleware,
    upload.single("image"),
    updateProduct
);




// Delete product
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("seller", "admin"),
    productOwnershipMiddleware,
    deleteProduct
);

export default router;

