
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
export async function createOrder(req, res) {

    const {
        shipping_address
    } = req.body;


    // Validate shipping address
    if (!shipping_address) {
        return res.status(400).json({
            error: "shipping_address is required"
        });
    }


    // User ID comes from authenticated user
    const user_id = req.user.id;


    // Initial status is controlled by the server
    const status = "pending";


    // Total starts at 0
    // It will be calculated after order items are added
    const total_amount = 0;


    const { data, error } = await supabase
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


    if (error) {
        return res.status(500).json({
            error: error.message
        });
    }


    res.status(201).json(data);
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

