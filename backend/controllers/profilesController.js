
import supabase from "../config/supabase.js";


// Get all profiles
export async function getProfiles(req, res) {

    const { data, error } = await supabase
        .from("profiles")
        .select("*");

    if (error) {
        return res.status(500).json({
            error: error.message
        });
    }

    res.json(data);
}


export async function getMyProfile(req, res) {
    try {
        const user_id = req.user.id;

        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user_id)
            .single();

        if (error || !data) {
            return res.status(404).json({
                error: "Profile not found"
            });
        }

        res.json(data);
    } catch (error) {
        console.error("Get my profile error:", error);

        return res.status(500).json({
            error: "Server error"
        });
    }
}


// Get one profile
export async function getProfile(req, res) {

    const { id } = req.params;

    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        return res.status(404).json({
            error: "Profile not found"
        });
    }

    res.json(data);
}


// Create profile
export async function createProfile(req, res) {

    const {
        full_name,
        avatar_url
    } = req.body;

    // The profile ID must come from the authenticated user
    const id = req.user.id;

    const { data, error } = await supabase
        .from("profiles")
        .insert([
            {
                id,
                full_name,
                avatar_url
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



export async function updateProfile(req, res) {
    try {
        const { id } = req.params;

        const {
            full_name,
            avatar_url
        } = req.body;

        if (full_name === undefined && avatar_url === undefined) {
            return res.status(400).json({
                error: "At least one profile field is required"
            });
        }

        const updates = {};

        if (full_name !== undefined) {
            updates.full_name = full_name;
        }

        if (avatar_url !== undefined) {
            updates.avatar_url = avatar_url;
        }

        const { data, error } = await supabase
            .from("profiles")
            .update(updates)
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
                error: "Profile not found"
            });
        }

        res.json(data);

    } catch (error) {
        console.error("Update profile error:", error);

        return res.status(500).json({
            error: "Server error"
        });
    }
}



// Delete profile
export async function deleteProfile(req, res) {

    const { id } = req.params;

    const { data, error } = await supabase
        .from("profiles")
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
            error: "Profile not found"
        });
    }

    res.json({
        message: "Profile deleted successfully",
        profile: data[0]
    });
}

export async function getAllUsers(req, res) {
    try {
        const { data, error } = await supabase
            .from("profiles")
            .select(`
                id,
                full_name,
                role,
                avatar_url,
                created_at
            `)
            .order("created_at", {
                ascending: false
            });

        if (error) {
            return res.status(500).json({
                error: error.message
            });
        }

        return res.json(data || []);

    } catch (error) {
        console.error(
            "Get all users error:",
            error
        );

        return res.status(500).json({
            error: "Server error"
        });
    }
}

export async function updateUserRole(req, res) {
    try {
        const { id } = req.params;
        const { role } = req.body;

        // Validate role
        const allowedRoles = [
            "user",
            "seller",
            "admin"
        ];

        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                error: "Invalid role"
            });
        }

        // Prevent admin from changing their own role
        if (id === req.user.id) {
            return res.status(400).json({
                error: "You cannot change your own role"
            });
        }

        // Check if user exists
        const { data: user, error: userError } =
            await supabase
                .from("profiles")
                .select("id, full_name, role")
                .eq("id", id)
                .single();

        if (userError || !user) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        // Update role
        const { data, error } =
            await supabase
                .from("profiles")
                .update({
                    role
                })
                .eq("id", id)
                .select(`
                    id,
                    full_name,
                    role,
                    avatar_url,
                    created_at
                `)
                .single();

        if (error) {
            return res.status(500).json({
                error: error.message
            });
        }

        return res.json(data);

    } catch (error) {
        console.error(
            "Update user role error:",
            error
        );

        return res.status(500).json({
            error: "Server error"
        });
    }
}


export async function deleteUser(req, res) {
    try {
        const { id } = req.params;

        // Prevent admin from deleting themselves
        if (id === req.user.id) {
            return res.status(400).json({
                error: "You cannot delete your own account"
            });
        }

        // Check if user exists
        const { data: user, error: userError } =
            await supabase
                .from("profiles")
                .select("id, full_name")
                .eq("id", id)
                .single();

        if (userError || !user) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        // Delete profile
        const { error } =
            await supabase
                .from("profiles")
                .delete()
                .eq("id", id);

        if (error) {
            return res.status(500).json({
                error: error.message
            });
        }

        return res.json({
            message: "User deleted successfully",
            id
        });

    } catch (error) {
        console.error(
            "Delete user error:",
            error
        );

        return res.status(500).json({
            error: "Server error"
        });
    }
}

