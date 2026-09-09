import supabase from "../config/supabase.js";


// Get all wishlists
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


// Get my wishlist
export async function getMyWishlist(req, res) {

    const user_id = req.user.id;

    console.log("Logged in user:", user_id);

    const { data, error } = await supabase
        .from("wishlists")
        .select("*")
        .eq("user_id", user_id)
        .single();

    if (error || !data) {
        console.log("Wishlist error:", error);

        return res.status(404).json({
            error: "Wishlist not found"
        });
    }

    res.json(data);
}

// Get one wishlist
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



// Create wishlist
export async function createWishlist(req, res) {

    const user_id = req.user.id;

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


// Delete wishlist
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

