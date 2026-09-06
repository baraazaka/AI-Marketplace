
import supabase from "../config/supabase.js";

export async function productOwnershipMiddleware(req, res, next) {
    try {
        const { id } = req.params;

        // Admin can modify any product
        if (req.userRole === "admin") {
            return next();
        }

        // Get the owner of the product
        const { data: product, error } = await supabase
            .from("products")
            .select("seller_id")
            .eq("id", id)
            .single();

        // Product not found
        if (error || !product) {
            return res.status(404).json({
                error: "Product not found"
            });
        }

        // Check if the product belongs to the logged-in seller
        if (product.seller_id !== req.user.id) {
            return res.status(403).json({
                error: "You are not allowed to modify this product"
            });
        }

        // Seller owns the product
        next();

    } catch (error) {
        console.error("Product ownership error:", error);

        return res.status(500).json({
            error: "Server error"
        });
    }
}

