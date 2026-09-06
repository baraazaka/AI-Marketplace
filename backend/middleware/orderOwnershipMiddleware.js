
import supabase from "../config/supabase.js";

export async function orderOwnershipMiddleware(req, res, next) {
    try {
        const { id } = req.params;

        // Admin can access any order
        if (req.userRole === "admin") {
            return next();
        }

        // Get the order owner
        const { data: order, error } = await supabase
            .from("orders")
            .select("user_id")
            .eq("id", id)
            .single();

        // Order not found
        if (error || !order) {
            return res.status(404).json({
                error: "Order not found"
            });
        }

        // Check if the order belongs to the logged-in user
        if (order.user_id !== req.user.id) {
            return res.status(403).json({
                error: "You are not allowed to access this order"
            });
        }

        // User owns this order
        next();

    } catch (error) {
        console.error("Order ownership error:", error);

        return res.status(500).json({
            error: "Server error"
        });
    }
}

