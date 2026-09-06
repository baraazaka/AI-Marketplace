
import supabase from "../config/supabase.js";

export async function reviewOwnershipMiddleware(req, res, next) {
    try {
        const { id } = req.params;

        // Get the owner of the review
        const { data: review, error } = await supabase
            .from("reviews")
            .select("user_id")
            .eq("id", id)
            .single();

        // Review not found
        if (error || !review) {
            return res.status(404).json({
                error: "Review not found"
            });
        }

        // Admin can modify any review
        if (req.userRole === "admin") {
            return next();
        }

        // Check if the review belongs to the logged-in user
        if (review.user_id !== req.user.id) {
            return res.status(403).json({
                error: "You are not allowed to modify this review"
            });
        }

        // User owns the review
        next();

    } catch (error) {
        console.error("Review ownership error:", error);

        return res.status(500).json({
            error: "Server error"
        });
    }
}

