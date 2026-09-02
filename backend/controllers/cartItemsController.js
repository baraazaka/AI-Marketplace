import supabase from "../config/supabase.js";

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
export async function createCartItem(req, res) {
    const {
        cart_id,
        product_id,
        quantity
    } = req.body;

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
export async function updateCartItem(req, res) {
    const { id } = req.params;
    const { quantity } = req.body;

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