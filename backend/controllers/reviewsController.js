
import supabase from "../config/supabase.js";


// Get all reviews
export async function getReviews(req, res) {

    const { data, error } = await supabase
        .from("reviews")
        .select("*");

    if (error) {
        return res.status(500).json({
            error: error.message
        });
    }

    res.json(data);
}


// Get one review
export async function getReview(req, res) {

    const { id } = req.params;

    const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        return res.status(404).json({
            error: "Review not found"
        });
    }

    res.json(data);
}


// Create review
export async function createReview(req, res) {

    const {
        product_id,
        rating,
        comment
    } = req.body;


    // User ID comes from the authenticated user
    const user_id = req.user.id;


    // Validate required fields
    if (!product_id || rating === undefined) {
        return res.status(400).json({
            error: "product_id and rating are required"
        });
    }


    // Validate rating
    if (rating < 1 || rating > 5) {
        return res.status(400).json({
            error: "Rating must be between 1 and 5"
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
        .from("reviews")
        .insert([
            {
                user_id,
                product_id,
                rating,
                comment
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


// Update review
export async function updateReview(req, res) {

    const { id } = req.params;

    const {
        rating,
        comment
    } = req.body;


    // Validate rating if provided
    if (rating !== undefined && (rating < 1 || rating > 5)) {
        return res.status(400).json({
            error: "Rating must be between 1 and 5"
        });
    }


    const updateData = {};

    if (rating !== undefined) {
        updateData.rating = rating;
    }

    if (comment !== undefined) {
        updateData.comment = comment;
    }


    const { data, error } = await supabase
        .from("reviews")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();


    if (error) {
        return res.status(500).json({
            error: error.message
        });
    }


    if (!data) {
        return res.status(404).json({
            error: "Review not found"
        });
    }


    res.json(data);
}


// Delete review
export async function deleteReview(req, res) {

    const { id } = req.params;

    const { data, error } = await supabase
        .from("reviews")
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
            error: "Review not found"
        });
    }


    res.json({
        message: "Review deleted successfully",
        review: data[0]
    });
}

