import supabase from "../config/supabase.js";

export async function getOrders(req, res) {
    const { data, error } = await supabase
        .from("orders")
        .select("*");

    if (error) {
        return res.status(500).json({
            error: error.message
        });
    }

    res.json(data);
}
export async function getOrder(req, res) {
    const { id } = req.params;

    const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        return res.status(404).json({
            error: "Order not found"
        });
    }

    res.json(data);
}
export async function createOrder(req, res) {
    const {
        user_id,
        status,
        total_amount,
        shipping_address
    } = req.body;

    const { data, error } = await supabase
        .from("orders")
        .insert([
            {
                user_id,
                status,
                total_amount,
                shipping_address
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
export async function updateOrder(req, res) {
    const { id } = req.params;

    const {
        status,
        total_amount,
        shipping_address
    } = req.body;

    const { data, error } = await supabase
        .from("orders")
        .update({
            status,
            total_amount,
            shipping_address
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
            error: "Order not found"
        });
    }

    res.json(data[0]);
}
export async function deleteOrder(req, res) {
    const { id } = req.params;

    const { data, error } = await supabase
        .from("orders")
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
            error: "Order not found"
        });
    }

    res.json({
        message: "Order deleted successfully",
        order: data[0]
    });
}