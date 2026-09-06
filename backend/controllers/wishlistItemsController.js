
import supabase from "../config/supabase.js";


// Get all wishlist items
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


// Get one wishlist item
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


// Create wishlist item
export async function createWishlistItem(req, res) {

    const {
        wishlist_id,
        product_id
    } = req.body;


    // Validate required fields
    if (!wishlist_id || !product_id) {
        return res.status(400).json({
            error: "wishlist_id and product_id are required"
        });
    }


    // Check if product exists
    const { data: product, error: productError } = await supabase
        .from("products")
        .select("id")
        .eq("id", product_id)
        .single();


    if (productError || !product) {
        return res.status(404).json({
            error: "Product not found"
        });
    }


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


// Delete wishlist item
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

