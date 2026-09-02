import supabase from "../config/supabase.js";
export function roleMiddleware(...allowedRoles) {
    return async (req, res, next) => {
        const userId = req.user.id;

        const { data, error } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", userId)
            .single();

        if (error || !data) {
            return res.status(403).json({
                error: "User profile not found"
            });
        }

        if (!allowedRoles.includes(data.role)) {
            return res.status(403).json({
                error: "You do not have permission"
            });
        }

        req.userRole = data.role;

        next();
    };
}