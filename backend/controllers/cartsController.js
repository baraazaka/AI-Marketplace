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