import supabase from "../config/supabase.js";

export async function getWishlistItems(req, res) {
    const { data, error } = await supabase
        .from("wishlist_items")
        .select("*");

    if (error) {
        return res.status(500).json({
            error: error.message
        });
    }

    res.json(data);
}
export async function getWishlistItem(req, res) {
    const { id } = req.params;

    const { data, error } = await supabase
        .from("wishlist_items")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        return res.status(404).json({
            error: "Wishlist item not found"
        });
    }

    res.json(data);
}
export async function createWishlistItem(req, res) {
    const {
        wishlist_id,
        product_id
    } = req.body;

    const { data, error } = await supabase
        .from("wishlist_items")
        .insert([
            {
                wishlist_id,
                product_id
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
export async function deleteWishlistItem(req, res) {
    const { id } = req.params;

    const { data, error } = await supabase
        .from("wishlist_items")
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
            error: "Wishlist item not found"
        });
    }

    res.json({
        message: "Wishlist item deleted successfully",
        wishlistItem: data[0]
    });
}