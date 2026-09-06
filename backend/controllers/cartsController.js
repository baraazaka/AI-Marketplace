
import supabase from "../config/supabase.js";


// Get all carts
export async function getCarts(req, res) {

    const { data, error } = await supabase
        .from("carts")
        .select("*");

    if (error) {
        return res.status(500).json({
            error: error.message
        });
    }

    res.json(data);
}


// Get one cart
export async function getCart(req, res) {

    const { id } = req.params;

    const { data, error } = await supabase
        .from("carts")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        return res.status(404).json({
            error: "Cart not found"
        });
    }

    res.json(data);
}


// Create cart
export async function createCart(req, res) {

    // Get the user ID from the authenticated user
    const user_id = req.user.id;

    const { data, error } = await supabase
        .from("carts")
        .insert([
            {
                user_id
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


// Update cart
export async function updateCart(req, res) {

    const { id } = req.params;

    // No user_id here.
    // The owner of the cart cannot be changed.

    const { data, error } = await supabase
        .from("carts")
        .update({})
        .eq("id", id)
        .select();

    if (error) {
        return res.status(500).json({
            error: error.message
        });
    }

    if (data.length === 0) {
        return res.status(404).json({
            error: "Cart not found"
        });
    }

    res.json(data[0]);
}


// Delete cart
export async function deleteCart(req, res) {

    const { id } = req.params;

    const { data, error } = await supabase
        .from("carts")
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
            error: "Cart not found"
        });
    }

    res.json({
        message: "Cart deleted successfully",
        cart: data[0]
    });
}

