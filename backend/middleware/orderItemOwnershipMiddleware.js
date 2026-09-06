
import supabase from "../config/supabase.js";

export async function orderItemOwnershipMiddleware(req, res, next) {
    try {
        let orderId;

        // For creating an order item
        // order_id comes from the request body
        if (req.method === "POST") {
            orderId = req.body.order_id;

            if (!orderId) {
                return res.status(400).json({
                    error: "order_id is required"
                });
            }
        }

        // For get/update/delete
        // Get order_id from the existing order item
        else {
            const { id } = req.params;

            const { data: orderItem, error } = await supabase
                .from("order_items")
                .select("order_id")
                .eq("id", id)
                .single();

            if (error || !orderItem) {
                return res.status(404).json({
                    error: "Order item not found"
                });
            }

            orderId = orderItem.order_id;
        }

        // Admin can access any order item
        if (req.userRole === "admin") {
            return next();
        }

        // Get the owner of the order
        const { data: order, error } = await supabase
            .from("orders")
            .select("user_id")
            .eq("id", orderId)
            .single();

        if (error || !order) {
            return res.status(404).json({
                error: "Order not found"
            });
        }

        // Check if the order belongs to the logged-in user
        if (order.user_id !== req.user.id) {
            return res.status(403).json({
                error: "You are not allowed to access this order item"
            });
        }

        next();

    } catch (error) {
        console.error("Order item ownership error:", error);

        return res.status(500).json({
            error: "Server error"
        });
    }
}

