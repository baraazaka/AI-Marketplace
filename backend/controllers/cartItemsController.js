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