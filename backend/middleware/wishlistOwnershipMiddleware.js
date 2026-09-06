
import supabase from "../config/supabase.js";

export async function wishlistOwnershipMiddleware(req, res, next) {
    try {
        const { id } = req.params;

        // Get the owner of the wishlist
        const { data: wishlist, error } = await supabase
            .from("wishlists")
            .select("user_id")
            .eq("id", id)
            .single();

        // Wishlist not found
        if (error || !wishlist) {
            return res.status(404).json({
                error: "Wishlist not found"
            });
        }

        // Admin can access any wishlist
        if (req.userRole === "admin") {
            return next();
        }

        // Check if the wishlist belongs to the logged-in user
        if (wishlist.user_id !== req.user.id) {
            return res.status(403).json({
                error: "You are not allowed to access this wishlist"
            });
        }

        next();

    } catch (error) {
        console.error("Wishlist ownership error:", error);

        return res.status(500).json({
            error: "Server error"
        });
    }
}

