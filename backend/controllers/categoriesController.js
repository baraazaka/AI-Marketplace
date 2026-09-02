import supabase from "../config/supabase.js";

export async function getCategories(req, res) {

    const { data, error } = await supabase
        .from("categories")
        .select("*");

    if (error) {
        return res.status(500).json({
            error: error.message
        });
    }

    res.json(data);
}

export async function getCategory(req, res) {

    const { id } = req.params;

    const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        return res.status(404).json({
            error: "Category not found"
        });
    }

    res.json(data);
}