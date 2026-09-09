
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




// Get reviews for one product

export async function getProductReviews(req, res) {
    try {
        const { product_id } = req.params;

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
            .select(`
                id,
                user_id,
                product_id,
                rating,
                comment,
                created_at,
                profiles (
                    full_name,
                    avatar_url
                )
            `)
            .eq("product_id", product_id)
            .order("created_at", { ascending: false });

        if (error) {
            return res.status(500).json({
                error: error.message
            });
        }

        const total_reviews = data.length;

        const average_rating =
            total_reviews === 0
                ? 0
                : data.reduce(
                    (total, review) => total + Number(review.rating),
                    0
                ) / total_reviews;

        res.json({
            average_rating: Number(average_rating.toFixed(1)),
            total_reviews,
            reviews: data
        });

    } catch (error) {
        console.error("Get product reviews error:", error);

        return res.status(500).json({
            error: "Server error"
        });
    }
}



// Create review
export async function createReview(req, res) {
    try {
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

        // Check if the user purchased this product
        const { data: purchasedItem, error: purchaseError } = await supabase
            .from("order_items")
            .select(`
                id,
                orders!inner (
                    id,
                    user_id
                )
            `)
            .eq("product_id", product_id)
            .eq("orders.user_id", user_id)
            .limit(1)
            .maybeSingle();

        if (purchaseError) {
            return res.status(500).json({
                error: purchaseError.message
            });
        }

        if (!purchasedItem) {
            return res.status(403).json({
                error: "You can only review products you have purchased"
            });
        }

        // Check if the user already reviewed this product
        const { data: existingReview, error: existingReviewError } =
            await supabase
                .from("reviews")
                .select("id")
                .eq("user_id", user_id)
                .eq("product_id", product_id)
                .maybeSingle();

        if (existingReviewError) {
            return res.status(500).json({
                error: existingReviewError.message
            });
        }

        if (existingReview) {
            return res.status(409).json({
                error: "You have already reviewed this product"
            });
        }

        // Create review
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

    } catch (error) {
        console.error("Create review error:", error);

        return res.status(500).json({
            error: "Server error"
        });
    }
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

