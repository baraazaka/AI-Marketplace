import supabase from "../config/supabase.js";

export async function getOrderItems(req, res) {
    const { data, error } = await supabase
        .from("order_items")
        .select("*");

    if (error) {
        return res.status(500).json({
            error: error.message
        });
    }

    res.json(data);
}
export async function getOrderItem(req, res) {
    const { id } = req.params;

    const { data, error } = await supabase
        .from("order_items")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        return res.status(404).json({
            error: "Order item not found"
        });
    }

    res.json(data);
}
export async function createOrderItem(req, res) {
    const {
        order_id,
        product_id,
        quantity,
        price_at_purchase
    } = req.body;

    const { data, error } = await supabase
        .from("order_items")
        .insert([
            {
                order_id,
                product_id,
                quantity,
                price_at_purchase
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
export async function deleteOrderItem(req, res) {
    const { id } = req.params;

    const { data, error } = await supabase
        .from("order_items")
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
            error: "Order item not found"
        });
    }

    res.json({
        message: "Order item deleted successfully",
        orderItem: data[0]
    });
}