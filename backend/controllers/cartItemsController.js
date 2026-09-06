
import supabase from "../config/supabase.js";


// Get all cart items
export async function getCartItems(req, res) {

    const { data, error } = await supabase
        .from("cart_items")
        .select("*");

    if (error) {
        return res.status(500).json({
            error: error.message
        });
    }

    res.json(data);
}


// Get one cart item
export async function getCartItem(req, res) {

    const { id } = req.params;

    const { data, error } = await supabase
        .from("cart_items")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        return res.status(404).json({
            error: "Cart item not found"
        });
    }

    res.json(data);
}


// Create cart item
export async function createCartItem(req, res) {

    const {
        cart_id,
        product_id,
        quantity
    } = req.body;


    // Validate required fields
    if (!cart_id || !product_id || !quantity) {
        return res.status(400).json({
            error: "cart_id, product_id and quantity are required"
        });
    }


    // Quantity must be a positive number
    if (quantity <= 0) {
        return res.status(400).json({
            error: "Quantity must be greater than 0"
        });
    }


    const { data, error } = await supabase
        .from("cart_items")
        .insert([
            {
                cart_id,
                product_id,
                quantity
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


// Update cart item
export async function updateCartItem(req, res) {

    const { id } = req.params;
    const { quantity } = req.body;


    // Validate quantity
    if (!quantity) {
        return res.status(400).json({
            error: "quantity is required"
        });
    }


    if (quantity <= 0) {
        return res.status(400).json({
            error: "Quantity must be greater than 0"
        });
    }


    const { data, error } = await supabase
        .from("cart_items")
        .update({
            quantity
        })
        .eq("id", id)
        .select();


    if (error) {
        return res.status(500).json({
            error: error.message
        });
    }


    if (data.length === 0) {
        return res.status(404).json({
            error: "Cart item not found"
        });
    }


    res.json(data[0]);
}


// Delete cart item
export async function deleteCartItem(req, res) {

    const { id } = req.params;


    const { data, error } = await supabase
        .from("cart_items")
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
            error: "Cart item not found"
        });
    }


    res.json({
        message: "Cart item deleted successfully",
        cartItem: data[0]
    });
}

