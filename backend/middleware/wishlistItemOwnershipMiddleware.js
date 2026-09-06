
import supabase from "../config/supabase.js";

export async function wishlistItemOwnershipMiddleware(req, res, next) {
    try {
        let wishlistId;

        // For creating a wishlist item
        // wishlist_id comes from the request body
        if (req.method === "POST") {
            wishlistId = req.body.wishlist_id;

            if (!wishlistId) {
                return res.status(400).json({
                    error: "wishlist_id is required"
                });
            }
        }

        // For get/delete
        // Get wishlist_id from the existing wishlist item
        else {
            const { id } = req.params;

            const { data: wishlistItem, error } = await supabase
                .from("wishlist_items")
                .select("wishlist_id")
                .eq("id", id)
                .single();

            if (error || !wishlistItem) {
                return res.status(404).json({
                    error: "Wishlist item not found"
                });
            }

            wishlistId = wishlistItem.wishlist_id;
        }

        // Admin can access any wishlist item
        if (req.userRole === "admin") {
            return next();
        }

        // Get the owner of the wishlist
        const { data: wishlist, error } = await supabase
            .from("wishlists")
            .select("user_id")
            .eq("id", wishlistId)
            .single();

        if (error || !wishlist) {
            return res.status(404).json({
                error: "Wishlist not found"
            });
        }

        // Check if the wishlist belongs to the logged-in user
        if (wishlist.user_id !== req.user.id) {
            return res.status(403).json({
                error: "You are not allowed to access this wishlist item"
            });
        }

        next();

    } catch (error) {
        console.error("Wishlist item ownership error:", error);

        return res.status(500).json({
            error: "Server error"
        });
    }
}

