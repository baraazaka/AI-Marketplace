import supabase from "../config/supabase.js";

export async function getProducts(req, res) {

    const { data, error } = await supabase
        .from("products")
        .select("*");

    if (error) {
        return res.status(500).json({
            error: error.message
        });
    }

    res.json(data);
}

export async function getProduct(req, res) {

    const { id } = req.params;

    const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        return res.status(404).json({
            error: "Product not found"
        });
    }

    res.json(data);
}

export async function createProduct(req, res) {

    const {
        name,
        description,
        price,
        stock,
        brand,
        image_url,
        category_id,
        seller_id
    } = req.body;

    const { data, error } = await supabase
        .from("products")
        .insert([
            {
                name,
                description,
                price,
                stock,
                brand,
                image_url,
                category_id,
                seller_id
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