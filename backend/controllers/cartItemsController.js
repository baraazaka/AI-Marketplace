
import supabase from "../config/supabase.js";


// Get all cart items
export async function getCartItems(req, res) {

    const { data, error } = await supabase
        .from("cart_items")
        .select("*");

    if (error) {
        return res.status(500).json({
            error: error.message
        });
    }

    res.json(data);
}


// Get one cart item
export async function getCartItem(req, res) {

    const { id } = req.params;

    const { data, error } = await supabase
        .from("cart_items")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        return res.status(404).json({
            error: "Cart item not found"
        });
    }

    res.json(data);
}



export async function createCartItem(req, res) {
    const { cart_id, product_id, quantity } = req.body;

    if (!cart_id || !product_id || !quantity) {
        return res.status(400).json({
            error: "cart_id, product_id and quantity are required"
        });
    }

    if (quantity <= 0) {
        return res.status(400).json({
            error: "Quantity must be greater than 0"
        });
    }

    // Check if product already exists in this cart
    const { data: existingItem, error: findError } = await supabase
        .from("cart_items")
        .select("*")
        .eq("cart_id", cart_id)
        .eq("product_id", product_id)
        .maybeSingle();

    if (findError) {
        return res.status(500).json({
            error: findError.message
        });
    }

    // Product already exists -> increase quantity
    if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;

        const { data, error } = await supabase
            .from("cart_items")
            .update({
                quantity: newQuantity
            })
            .eq("id", existingItem.id)
            .select()
            .single();

        if (error) {
            return res.status(500).json({
                error: error.message
            });
        }

        return res.json(data);
    }

    // Product doesn't exist -> create new cart item
    const { data, error } = await supabase
        .from("cart_items")
        .insert([
            {
                cart_id,
                product_id,
                quantity
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



// Update cart item
export async function updateCartItem(req, res) {

    const { id } = req.params;
    const { quantity } = req.body;


    // Validate quantity
    if (!quantity) {
        return res.status(400).json({
            error: "quantity is required"
        });
    }


    if (quantity <= 0) {
        return res.status(400).json({
            error: "Quantity must be greater than 0"
        });
    }


    const { data, error } = await supabase
        .from("cart_items")
        .update({
            quantity
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
            error: "Cart item not found"
        });
    }


    res.json(data[0]);
}


// Delete cart item
export async function deleteCartItem(req, res) {

    const { id } = req.params;


    const { data, error } = await supabase
        .from("cart_items")
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
            error: "Cart item not found"
        });
    }


    res.json({
        message: "Cart item deleted successfully",
        cartItem: data[0]
    });
}

// Get current user's cart items
export async function getMyCartItems(req, res) {

    try {

        const user_id = req.user.id;


        // Get user's cart
        const { data: cart, error: cartError } = await supabase
            .from("carts")
            .select("id")
            .eq("user_id", user_id)
            .single();


        if (cartError || !cart) {

            return res.status(404).json({
                error: "Cart not found"
            });

        }


        // Get cart items with product information
        const { data, error } = await supabase
            .from("cart_items")
            .select(`
                id,
                cart_id,
                product_id,
                quantity,
                created_at,
                products (
                    id,
                    name,
                    price,
                    description,
                    image_url
                )
            `)
            .eq("cart_id", cart.id);


        if (error) {

            return res.status(500).json({
                error: error.message
            });

        }


        res.json(data);

    } catch (error) {

        console.error("Get my cart items error:", error);

        return res.status(500).json({
            error: "Server error"
        });

    }
}



