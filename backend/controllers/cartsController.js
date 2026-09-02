import supabase from "../config/supabase.js";

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
export async function createCart(req, res) {
    const { user_id } = req.body;

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