import supabase from "../config/supabase.js";

export async function getWishlists(req, res) {
    const { data, error } = await supabase
        .from("wishlists")
        .select("*");

    if (error) {
        return res.status(500).json({
            error: error.message
        });
    }

    res.json(data);
}
export async function getWishlist(req, res) {
    const { id } = req.params;

    const { data, error } = await supabase
        .from("wishlists")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        return res.status(404).json({
            error: "Wishlist not found"
        });
    }

    res.json(data);
}
export async function createWishlist(req, res) {
    const { user_id } = req.body;

    const { data, error } = await supabase
        .from("wishlists")
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
export async function updateWishlist(req, res) {
    const { id } = req.params;
    const { user_id } = req.body;

    const { data, error } = await supabase
        .from("wishlists")
        .update({
            user_id
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
            error: "Wishlist not found"
        });
    }

    res.json(data[0]);
}
export async function deleteWishlist(req, res) {
    const { id } = req.params;

    const { data, error } = await supabase
        .from("wishlists")
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
            error: "Wishlist not found"
        });
    }

    res.json({
        message: "Wishlist deleted successfully",
        wishlist: data[0]
    });
}