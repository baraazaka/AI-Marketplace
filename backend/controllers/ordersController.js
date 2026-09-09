
import supabase from "../config/supabase.js";


// Get all orders
export async function getOrders(req, res) {

    const { data, error } = await supabase
        .from("orders")
        .select("*");

    if (error) {
        return res.status(500).json({
            error: error.message
        });
    }

    res.json(data);
}


// Get my orders
export async function getMyOrders(req, res) {
    try {
        // Get authenticated user's ID
        const user_id = req.user.id;

        // Get user's orders
        const { data, error } = await supabase
            .from("orders")
            .select(`
                id,
                user_id,
                status,
                total_amount,
                shipping_address,
                created_at,
                updated_at,

                order_items (
                    id,
                    order_id,
                    product_id,
                    price_at_purchase,
                    quantity,
                    created_at,

                    products (
                        id,
                        name,
                        price,
                        image_url
                    )
                )
            `)
            .eq("user_id", user_id)
            .order("created_at", {
                ascending: false
            });

        if (error) {
            return res.status(500).json({
                error: error.message
            });
        }

        res.json(data);
    } catch (error) {
        console.error("Get my orders error:", error);

        return res.status(500).json({
            error: "Server error"
        });
    }
}


// Get one order
export async function getOrder(req, res) {

    const { id } = req.params;

    const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        return res.status(404).json({
            error: "Order not found"
        });
    }

    res.json(data);
}



// Create order

// Create order
export async function createOrder(req, res) {
    try {
        const { shipping_address } = req.body;

        // Validate shipping address
        if (!shipping_address) {
            return res.status(400).json({
                error: "shipping_address is required"
            });
        }

        // User ID comes from authenticated user
        const user_id = req.user.id;

        // Get user's cart
        const { data: cart, error: cartError } = await supabase
            .from("carts")
            .select("id")
            .eq("user_id", user_id)
            .single();

        if (cartError || !cart) {
            return res.status(404).json({
                error: "Cart not found"
            });
        }

        // Get cart items with product information
        const { data: cartItems, error: cartItemsError } =
            await supabase
                .from("cart_items")
                .select(`
                    id,
                    product_id,
                    quantity,
                    products (
                        id,
                        price
                    )
                `)
                .eq("cart_id", cart.id);

        if (cartItemsError) {
            return res.status(500).json({
                error: cartItemsError.message
            });
        }

        // Cart must contain at least one item
        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({
                error: "Cart is empty"
            });
        }

        // Calculate total amount
        const total_amount = cartItems.reduce(
            (total, item) => {
                return total + item.products.price * item.quantity;
            },
            0
        );

        // Order status is controlled by the server
        const status = "pending";

        // Create order
        const { data: order, error: orderError } = await supabase
            .from("orders")
            .insert([
                {
                    user_id,
                    status,
                    total_amount,
                    shipping_address
                }
            ])
            .select()
            .single();

        if (orderError) {
            return res.status(500).json({
                error: orderError.message
            });
        }

        // Create order items
        const orderItems = cartItems.map((item) => ({
            order_id: order.id,
            product_id: item.product_id,
            price_at_purchase: item.products.price,
            quantity: item.quantity
        }));

        const {
            data: createdOrderItems,
            error: orderItemsError
        } = await supabase
            .from("order_items")
            .insert(orderItems)
            .select();

        if (orderItemsError) {
            return res.status(500).json({
                error: orderItemsError.message
            });
        }

        // Clear cart after successfully creating the order
        const { error: clearCartError } = await supabase
            .from("cart_items")
            .delete()
            .eq("cart_id", cart.id);

        if (clearCartError) {
            return res.status(500).json({
                error: clearCartError.message
            });
        }

        // Return complete order
        res.status(201).json({
            order,
            order_items: createdOrderItems
        });
    } catch (error) {
        console.error("Create order error:", error);

        return res.status(500).json({
            error: "Server error"
        });
    }
}




// Update order
export async function updateOrder(req, res) {

    const { id } = req.params;

    const {
        shipping_address
    } = req.body;


    if (!shipping_address) {
        return res.status(400).json({
            error: "shipping_address is required"
        });
    }


    // Only shipping address can be updated
    const { data, error } = await supabase
        .from("orders")
        .update({
            shipping_address
        })
        .eq("id", id)
        .select()
        .single();


    if (error) {
        return res.status(500).json({
            error: error.message
        });
    }


    if (!data) {
        return res.status(404).json({
            error: "Order not found"
        });
    }


    res.json(data);
}


// Delete order
export async function deleteOrder(req, res) {

    const { id } = req.params;


    const { data, error } = await supabase
        .from("orders")
        .delete()
        .eq("id", id)
        .select();


    if (error) {
        return res.status(500).json({
            error: error.message
        });
    }


    if (data.length === 0) {
        return res.status(404).json({
            error: "Order not found"
        });
    }


    res.json({
        message: "Order deleted successfully",
        order: data[0]
    });
}

