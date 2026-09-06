
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


// Update profile
export async function updateProfile(req, res) {

    const { id } = req.params;

    const {
        full_name,
        avatar_url
    } = req.body;

    const { data, error } = await supabase
        .from("profiles")
        .update({
            full_name,
            avatar_url
        })
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
