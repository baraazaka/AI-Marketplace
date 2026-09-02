import supabase from "../config/supabase.js";

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
export async function createReview(req, res) {
    const {
        user_id,
        product_id,
        rating,
        comment
    } = req.body;

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
export async function updateReview(req, res) {
    const { id } = req.params;

    const {
        rating,
        comment
    } = req.body;

    const { data, error } = await supabase
        .from("reviews")
        .update({
            rating,
            comment
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
            error: "Review not found"
        });
    }

    res.json(data[0]);
}
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