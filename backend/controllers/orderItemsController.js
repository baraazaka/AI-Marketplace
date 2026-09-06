
import supabase from "../config/supabase.js";


// Get all order items
export async function getOrderItems(req, res) {

    const { data, error } = await supabase
        .from("order_items")
        .select("*");

    if (error) {
        return res.status(500).json({
            error: error.message
        });
    }

    res.json(data);
}


// Get one order item
export async function getOrderItem(req, res) {

    const { id } = req.params;

    const { data, error } = await supabase
        .from("order_items")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        return res.status(404).json({
            error: "Order item not found"
        });
    }

    res.json(data);
}


// Create order item
export async function createOrderItem(req, res) {

    const {
        order_id,
        product_id,
        quantity
    } = req.body;


    // Validate required fields
    if (!order_id || !product_id || quantity === undefined) {
        return res.status(400).json({
            error: "order_id, product_id and quantity are required"
        });
    }


    // Validate quantity
    if (quantity <= 0) {
        return res.status(400).json({
            error: "Quantity must be greater than 0"
        });
    }


    // Get product price from database
    const { data: product, error: productError } = await supabase
        .from("products")
        .select("price")
        .eq("id", product_id)
        .single();


    if (productError || !product) {
        return res.status(404).json({
            error: "Product not found"
        });
    }


    // Use the price from the database
    const price_at_purchase = product.price;


    const { data, error } = await supabase
        .from("order_items")
        .insert([
            {
                order_id,
                product_id,
                quantity,
                price_at_purchase
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


// Update order item
export async function updateOrderItem(req, res) {

    const { id } = req.params;
    const { quantity } = req.body;


    // Validate quantity
    if (quantity === undefined) {
        return res.status(400).json({
            error: "quantity is required"
        });
    }


    if (quantity <= 0) {
        return res.status(400).json({
            error: "Quantity must be greater than 0"
        });
    }


    // Only quantity can be changed
    const { data, error } = await supabase
        .from("order_items")
        .update({
            quantity
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
            error: "Order item not found"
        });
    }


    res.json(data);
}


// Delete order item
export async function deleteOrderItem(req, res) {

    const { id } = req.params;


    const { data, error } = await supabase
        .from("order_items")
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
            error: "Order item not found"
        });
    }


    res.json({
        message: "Order item deleted successfully",
        orderItem: data[0]
    });
}
