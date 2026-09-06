
import supabase from "../config/supabase.js";

export async function cartItemOwnershipMiddleware(req, res, next) {
    try {
        let cartId;

        // For createCartItem
        // cart_id comes from the request body
        if (req.method === "POST") {
            cartId = req.body.cart_id;

            if (!cartId) {
                return res.status(400).json({
                    error: "cart_id is required"
                });
            }
        }

        // For get/update/delete
        // Get cart_id from the existing cart item
        else {
            const { id } = req.params;

            const { data: cartItem, error } = await supabase
                .from("cart_items")
                .select("cart_id")
                .eq("id", id)
                .single();

            if (error || !cartItem) {
                return res.status(404).json({
                    error: "Cart item not found"
                });
            }

            cartId = cartItem.cart_id;
        }

        // Admin can access any cart item
        if (req.userRole === "admin") {
            return next();
        }

        // Check the owner of the cart
        const { data: cart, error } = await supabase
            .from("carts")
            .select("user_id")
            .eq("id", cartId)
            .single();

        if (error || !cart) {
            return res.status(404).json({
                error: "Cart not found"
            });
        }

        // Check if the cart belongs to the logged-in user
        if (cart.user_id !== req.user.id) {
            return res.status(403).json({
                error: "You are not allowed to access this cart item"
            });
        }

        next();

    } catch (error) {
        console.error("Cart item ownership error:", error);

        return res.status(500).json({
            error: "Server error"
        });
    }
}

