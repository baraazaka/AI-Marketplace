
import supabase from "../config/supabase.js";

export async function cartOwnershipMiddleware(req, res, next) {
    try {
        const { id } = req.params;

        // Admin can access any cart
        if (req.userRole === "admin") {
            return next();
        }

        // Get the cart owner
        const { data: cart, error } = await supabase
            .from("carts")
            .select("user_id")
            .eq("id", id)
            .single();

        // Cart not found
        if (error || !cart) {
            return res.status(404).json({
                error: "Cart not found"
            });
        }

        // Check if the cart belongs to the logged-in user
        if (cart.user_id !== req.user.id) {
            return res.status(403).json({
                error: "You are not allowed to access this cart"
            });
        }

        // Cart belongs to the user
        next();

    } catch (error) {
        console.error("Cart ownership error:", error);

        return res.status(500).json({
            error: "Server error"
        });
    }
}

