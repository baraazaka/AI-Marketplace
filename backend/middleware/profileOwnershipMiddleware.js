
export async function profileOwnershipMiddleware(req, res, next) {
    try {
        const { id } = req.params;

        // Admin can access any profile
        if (req.userRole === "admin") {
            return next();
        }

        // User can access only their own profile
        if (req.user.id !== id) {
            return res.status(403).json({
                error: "You are not allowed to access this profile"
            });
        }

        // User owns this profile
        next();

    } catch (error) {
        console.error("Profile ownership error:", error);

        return res.status(500).json({
            error: "Server error"
        });
    }
}

