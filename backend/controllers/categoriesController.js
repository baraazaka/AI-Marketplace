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
export async function createCategory(req, res) {

    const { name } = req.body;

    const { data, error } = await supabase
        .from("categories")
        .insert([
            {
                name
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

export async function updateCategory(req, res) {
    const { id } = req.params;
    const { name } = req.body;

    const { data, error } = await supabase
        .from("categories")
        .update({
            name
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
            error: "Category not found"
        });
    }

    res.json(data[0]);
}
export async function deleteCategory(req, res) {
    const { id } = req.params;

    const { data, error } = await supabase
        .from("categories")
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
            error: "Category not found"
        });
    }

    res.json({
        message: "Category deleted successfully",
        category: data[0]
    });
}