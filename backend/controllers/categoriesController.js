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

export async function getCategoryProducts(req, res) {
    try {
        const { id } = req.params;

        // Check if category exists
        const { data: category, error: categoryError } = await supabase
            .from("categories")
            .select("id, name")
            .eq("id", id)
            .single();

        if (categoryError || !category) {
            return res.status(404).json({
                error: "Category not found"
            });
        }

        // Get products belonging to this category
        const { data: products, error: productsError } = await supabase
            .from("products")
            .select("*")
            .eq("category_id", id);

        if (productsError) {
            return res.status(500).json({
                error: productsError.message
            });
        }

        res.json({
            category,
            products
        });

    } catch (error) {
        console.error("Get category products error:", error);

        return res.status(500).json({
            error: "Server error"
        });
    }
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