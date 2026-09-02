import supabase from "../config/supabase.js";

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
export async function updateProfile(req, res) {
    const { id } = req.params;

    const {
        full_name,
        avatar_url,
        role
    } = req.body;

    const { data, error } = await supabase
        .from("profiles")
        .update({
            full_name,
            avatar_url,
            role
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
            error: "Profile not found"
        });
    }

    res.json(data[0]);
}
export async function createProfile(req, res) {
    const {
        id,
        full_name,
        avatar_url,
        role
    } = req.body;

    const { data, error } = await supabase
        .from("profiles")
        .insert([
            {
                id,
                full_name,
                avatar_url,
                role
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