
import supabase from "../config/supabase.js";


// Get all orders - Admin
export async function getOrders(req, res) {
    try {
        const { data, error } = await supabase
            .from("orders")
            .select(`
                id,
                user_id,
                status,
                total_amount,
                shipping_address,
                created_at,
                updated_at,

                profiles (
                    full_name,
                    avatar_url
                ),

                order_items (
                    id,
                    product_id,
                    price_at_purchase,
                    quantity,
                    created_at,

                    products (
                        id,
                        name,
                        image_url
                    )
                )
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
            "Get all orders error:",
            error
        );

        return res.status(500).json({
            error: "Server error"
        });
    }
}



// Get my orders
export async function getMyOrders(req, res) {
    try {
        // Get authenticated user's ID
        const user_id = req.user.id;

        // Get user's orders
        const { data, error } = await supabase
            .from("orders")
            .select(`
                id,
                user_id,
                status,
                total_amount,
                shipping_address,
                created_at,
                updated_at,

                order_items (
                    id,
                    order_id,
                    product_id,
                    price_at_purchase,
                    quantity,
                    created_at,

                    products (
                        id,
                        name,
                        price,
                        image_url
                    )
                )
            `)
            .eq("user_id", user_id)
            .order("created_at", {
                ascending: false
            });

        if (error) {
            return res.status(500).json({
                error: error.message
            });
        }

        res.json(data);
    } catch (error) {
        console.error("Get my orders error:", error);

        return res.status(500).json({
            error: "Server error"
        });
    }
}


// Get one order
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

export async function getSellerDashboard(req, res) {
    try {
        const seller_id = req.user.id;

        // 1. Get seller's products
        const { data: products, error: productsError } =
            await supabase
                .from("products")
                .select("id, stock")
                .eq("seller_id", seller_id);

        if (productsError) {
            return res.status(500).json({
                error: productsError.message
            });
        }

        // Seller has no products
        if (!products || products.length === 0) {
            return res.json({
                productsCount: 0,
                totalStock: 0,
                ordersCount: 0,
                pendingOrders: 0,
                totalSales: 0
            });
        }

        // Product statistics
        const productsCount = products.length;

        const totalStock = products.reduce(
            (total, product) =>
                total + Number(product.stock || 0),
            0
        );

        const productIds = products.map(
            (product) => product.id
        );

        // 2. Get order items containing seller's products
        const { data: orderItems, error: orderItemsError } =
            await supabase
                .from("order_items")
                .select(`
                    id,
                    order_id,
                    product_id,
                    price_at_purchase,
                    quantity
                `)
                .in("product_id", productIds);

        if (orderItemsError) {
            return res.status(500).json({
                error: orderItemsError.message
            });
        }

        // Seller has no orders yet
        if (!orderItems || orderItems.length === 0) {
            return res.json({
                productsCount,
                totalStock,
                ordersCount: 0,
                pendingOrders: 0,
                totalSales: 0
            });
        }

        // 3. Get unique order IDs
        const orderIds = [
            ...new Set(
                orderItems.map(
                    (item) => item.order_id
                )
            )
        ];

        // 4. Get orders
        const { data: orders, error: ordersError } =
            await supabase
                .from("orders")
                .select(`
                    id,
                    status
                `)
                .in("id", orderIds);

        if (ordersError) {
            return res.status(500).json({
                error: ordersError.message
            });
        }

        // Number of orders containing seller products
        const ordersCount = orders.length;

        // Number of pending orders
        const pendingOrders = orders.filter(
            (order) => order.status === "pending"
        ).length;

        // 5. Calculate seller sales
        // Cancelled orders are not counted as sales.
        const cancelledOrderIds = new Set(
            orders
                .filter(
                    (order) =>
                        order.status === "cancelled"
                )
                .map((order) => order.id)
        );

        const totalSales = orderItems.reduce(
            (total, item) => {

                if (
                    cancelledOrderIds.has(
                        item.order_id
                    )
                ) {
                    return total;
                }

                return (
                    total +
                    Number(item.price_at_purchase || 0) *
                    Number(item.quantity || 0)
                );
            },
            0
        );

        return res.json({
            productsCount,
            totalStock,
            ordersCount,
            pendingOrders,
            totalSales
        });

    } catch (error) {
        console.error(
            "Get seller dashboard error:",
            error
        );

        return res.status(500).json({
            error: "Server error"
        });
    }
}



// Create order

// Create order
export async function createOrder(req, res) {
    try {
        const { shipping_address } = req.body;

        // Validate shipping address
        if (!shipping_address) {
            return res.status(400).json({
                error: "shipping_address is required"
            });
        }

        // User ID comes from authenticated user
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
        const { data: cartItems, error: cartItemsError } =
            await supabase
                .from("cart_items")
                .select(`
                    id,
                    product_id,
                    quantity,
                    products (
                        id,
                        price
                    )
                `)
                .eq("cart_id", cart.id);

        if (cartItemsError) {
            return res.status(500).json({
                error: cartItemsError.message
            });
        }

        // Cart must contain at least one item
        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({
                error: "Cart is empty"
            });
        }

        // Calculate total amount
        const total_amount = cartItems.reduce(
            (total, item) => {
                return total + item.products.price * item.quantity;
            },
            0
        );

        // Order status is controlled by the server
        const status = "pending";

        // Create order
        const { data: order, error: orderError } = await supabase
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

        if (orderError) {
            return res.status(500).json({
                error: orderError.message
            });
        }

        // Create order items
        const orderItems = cartItems.map((item) => ({
            order_id: order.id,
            product_id: item.product_id,
            price_at_purchase: item.products.price,
            quantity: item.quantity
        }));

        const {
            data: createdOrderItems,
            error: orderItemsError
        } = await supabase
            .from("order_items")
            .insert(orderItems)
            .select();

        if (orderItemsError) {
            return res.status(500).json({
                error: orderItemsError.message
            });
        }

        // Clear cart after successfully creating the order
        const { error: clearCartError } = await supabase
            .from("cart_items")
            .delete()
            .eq("cart_id", cart.id);

        if (clearCartError) {
            return res.status(500).json({
                error: clearCartError.message
            });
        }

        // Return complete order
        res.status(201).json({
            order,
            order_items: createdOrderItems
        });
    } catch (error) {
        console.error("Create order error:", error);

        return res.status(500).json({
            error: "Server error"
        });
    }
}




// Update order
export async function updateOrder(req, res) {

    const { id } = req.params;

    const {
        shipping_address
    } = req.body;


    if (!shipping_address) {
        return res.status(400).json({
            error: "shipping_address is required"
        });
    }


    // Only shipping address can be updated
    const { data, error } = await supabase
        .from("orders")
        .update({
            shipping_address
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
            error: "Order not found"
        });
    }


    res.json(data);
}


// Delete order
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

export async function getSellerOrders(req, res) {
    try {
        const seller_id = req.user.id;

        // 1. Get products that belong to this seller
        const { data: products, error: productsError } =
            await supabase
                .from("products")
                .select("id")
                .eq("seller_id", seller_id);

        if (productsError) {
            return res.status(500).json({
                error: productsError.message
            });
        }

        // Seller has no products
        if (!products || products.length === 0) {
            return res.json([]);
        }

        const productIds = products.map(
            (product) => product.id
        );

        // 2. Get order items containing seller's products
        const { data: orderItems, error: orderItemsError } =
            await supabase
                .from("order_items")
                .select(`
                    id,
                    order_id,
                    product_id,
                    price_at_purchase,
                    quantity,
                    created_at,
                    products (
                        id,
                        name,
                        image_url,
                        seller_id
                    )
                `)
                .in("product_id", productIds);

        if (orderItemsError) {
            return res.status(500).json({
                error: orderItemsError.message
            });
        }

        if (!orderItems || orderItems.length === 0) {
            return res.json([]);
        }

        // 3. Get unique order IDs
        const orderIds = [
            ...new Set(
                orderItems.map(
                    (item) => item.order_id
                )
            )
        ];

        // 4. Get the orders
        const { data: orders, error: ordersError } =
            await supabase
                .from("orders")
                .select(`
                    id,
                    user_id,
                    status,
                    total_amount,
                    shipping_address,
                    created_at,
                    updated_at
                `)
                .in("id", orderIds)
                .order("created_at", {
                    ascending: false
                });

        if (ordersError) {
            return res.status(500).json({
                error: ordersError.message
            });
        }

        // 5. Return only this seller's order items
        const result = orders.map((order) => ({
            ...order,

            items: orderItems.filter(
                (item) =>
                    item.order_id === order.id
            )
        }));

        res.json(result);

    } catch (error) {
        console.error(
            "Get seller orders error:",
            error
        );

        return res.status(500).json({
            error: "Server error"
        });
    }
}


export async function getSellerOrder(req, res) {
    try {
        const seller_id = req.user.id;
        const { id } = req.params;

        // 1. Get the order
        const { data: order, error: orderError } =
            await supabase
                .from("orders")
                .select(`
                    id,
                    user_id,
                    status,
                    total_amount,
                    shipping_address,
                    created_at,
                    updated_at
                `)
                .eq("id", id)
                .single();

        if (orderError || !order) {
            return res.status(404).json({
                error: "Order not found"
            });
        }

        // 2. Get this seller's products
        const { data: products, error: productsError } =
            await supabase
                .from("products")
                .select("id")
                .eq("seller_id", seller_id);

        if (productsError) {
            return res.status(500).json({
                error: productsError.message
            });
        }

        const productIds = products.map(
            (product) => product.id
        );

        // 3. Get only order items belonging to this seller
        const { data: orderItems, error: itemsError } =
            await supabase
                .from("order_items")
                .select(`
                    id,
                    order_id,
                    product_id,
                    price_at_purchase,
                    quantity,
                    created_at,
                    products (
                        id,
                        name,
                        image_url,
                        seller_id
                    )
                `)
                .eq("order_id", id)
                .in("product_id", productIds);

        if (itemsError) {
            return res.status(500).json({
                error: itemsError.message
            });
        }

        // Seller has no products in this order
        if (!orderItems || orderItems.length === 0) {
            return res.status(403).json({
                error: "You do not have access to this order"
            });
        }

        // 4. Return order with seller's items only
        return res.json({
            ...order,
            items: orderItems
        });

    } catch (error) {
        console.error(
            "Get seller order error:",
            error
        );

        return res.status(500).json({
            error: "Server error"
        });
    }
}


export async function updateSellerOrderStatus(req, res) {
    try {
        const seller_id = req.user.id;
        const { id } = req.params;
        const { status } = req.body;

        // 1. Validate status
        const allowedStatuses = [
            "pending",
            "processing",
            "shipped",
            "delivered",
            "cancelled"
        ];

        if (!status) {
            return res.status(400).json({
                error: "Status is required"
            });
        }

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                error: "Invalid order status"
            });
        }

        // 2. Get seller's products
        const { data: products, error: productsError } =
            await supabase
                .from("products")
                .select("id")
                .eq("seller_id", seller_id);

        if (productsError) {
            return res.status(500).json({
                error: productsError.message
            });
        }

        if (!products || products.length === 0) {
            return res.status(403).json({
                error: "You do not have access to this order"
            });
        }

        const productIds = products.map(
            (product) => product.id
        );

        // 3. Check whether this order contains
        //    at least one product belonging to this seller
        const { data: sellerOrderItem, error: itemError } =
            await supabase
                .from("order_items")
                .select("id")
                .eq("order_id", id)
                .in("product_id", productIds)
                .limit(1)
                .maybeSingle();

        if (itemError) {
            return res.status(500).json({
                error: itemError.message
            });
        }

        if (!sellerOrderItem) {
            return res.status(403).json({
                error: "You do not have access to this order"
            });
        }

        // 4. Update order status
        const { data, error } =
            await supabase
                .from("orders")
                .update({
                    status
                })
                .eq("id", id)
                .select()
                .single();

        if (error) {
            return res.status(500).json({
                error: error.message
            });
        }

        return res.json({
            message: "Order status updated successfully",
            order: data
        });

    } catch (error) {
        console.error(
            "Update seller order status error:",
            error
        );

        return res.status(500).json({
            error: "Server error"
        });
    }
}


export async function getAdminDashboard(req, res) {
    try {
        // 1. Get users
        const { data: users, error: usersError } =
            await supabase
                .from("profiles")
                .select("id, role");

        if (usersError) {
            return res.status(500).json({
                error: usersError.message
            });
        }

        const usersCount = users.filter(
            (user) => user.role === "user"
        ).length;

        const sellersCount = users.filter(
            (user) => user.role === "seller"
        ).length;


        // 2. Get products
        const { count: productsCount, error: productsError } =
            await supabase
                .from("products")
                .select("*", {
                    count: "exact",
                    head: true
                });

        if (productsError) {
            return res.status(500).json({
                error: productsError.message
            });
        }


        // 3. Get orders
        const { data: orders, error: ordersError } =
            await supabase
                .from("orders")
                .select("id, status, total_amount");

        if (ordersError) {
            return res.status(500).json({
                error: ordersError.message
            });
        }


        // 4. Count orders
        const ordersCount = orders.length;


        // 5. Calculate revenue
        const totalRevenue = orders.reduce(
            (total, order) => {
                if (order.status === "cancelled") {
                    return total;
                }

                return (
                    total +
                    Number(order.total_amount || 0)
                );
            },
            0
        );


        // 6. Return dashboard data
        return res.json({
            usersCount,
            sellersCount,
            productsCount: productsCount || 0,
            ordersCount,
            totalRevenue
        });

    } catch (error) {
        console.error(
            "Get admin dashboard error:",
            error
        );

        return res.status(500).json({
            error: "Server error"
        });
    }
}
 


export async function getSellerAnalytics(req, res) {
    try {
        const seller_id = req.user.id;

        // 1. Get seller products
        const { data: products, error: productsError } =
            await supabase
                .from("products")
                .select("id, name")
                .eq("seller_id", seller_id);

        if (productsError) {
            return res.status(500).json({
                error: productsError.message
            });
        }

        if (!products || products.length === 0) {
            return res.json({
                totalSales: 0,
                totalOrders: 0,
                topProducts: [],
                salesByMonth: []
            });
        }

        const productIds = products.map(
            (product) => product.id
        );

        // 2. Get order items for seller products
        const { data: orderItems, error: orderItemsError } =
            await supabase
                .from("order_items")
                .select(`
                    id,
                    order_id,
                    product_id,
                    price_at_purchase,
                    quantity
                `)
                .in("product_id", productIds);

        if (orderItemsError) {
            return res.status(500).json({
                error: orderItemsError.message
            });
        }

        if (!orderItems || orderItems.length === 0) {
            return res.json({
                totalSales: 0,
                totalOrders: 0,
                topProducts: [],
                salesByMonth: []
            });
        }

        // 3. Get related orders
        const orderIds = [
            ...new Set(
                orderItems.map(
                    (item) => item.order_id
                )
            )
        ];

        const { data: orders, error: ordersError } =
            await supabase
                .from("orders")
                .select(`
                    id,
                    status,
                    created_at
                `)
                .in("id", orderIds);

        if (ordersError) {
            return res.status(500).json({
                error: ordersError.message
            });
        }

        const ordersMap = new Map(
            orders.map((order) => [
                order.id,
                order
            ])
        );

        // Cancelled orders should not count as sales
        const validOrderItems = orderItems.filter(
            (item) => {
                const order = ordersMap.get(
                    item.order_id
                );

                return (
                    order &&
                    order.status !== "cancelled"
                );
            }
        );


        // --------------------------------
        // Total Sales
        // --------------------------------

        const totalSales =
            validOrderItems.reduce(
                (total, item) => {
                    return (
                        total +
                        Number(
                            item.price_at_purchase || 0
                        ) *
                        Number(
                            item.quantity || 0
                        )
                    );
                },
                0
            );


        // --------------------------------
        // Total Orders
        // --------------------------------

        const totalOrders = orderIds.filter(
            (orderId) => {
                const order =
                    ordersMap.get(orderId);

                return (
                    order &&
                    order.status !== "cancelled"
                );
            }
        ).length;


        // --------------------------------
        // Top Products
        // --------------------------------

        const productMap = new Map();

        products.forEach((product) => {
            productMap.set(product.id, {
                id: product.id,
                name: product.name,
                quantity: 0,
                sales: 0
            });
        });


        validOrderItems.forEach((item) => {
            const product =
                productMap.get(
                    item.product_id
                );

            if (!product) {
                return;
            }

            product.quantity += Number(
                item.quantity || 0
            );

            product.sales +=
                Number(
                    item.price_at_purchase || 0
                ) *
                Number(
                    item.quantity || 0
                );
        });


        const topProducts = [
            ...productMap.values()
        ]
            .filter(
                (product) =>
                    product.quantity > 0
            )
            .sort(
                (a, b) =>
                    b.sales - a.sales
            )
            .slice(0, 5);


        // --------------------------------
        // Sales By Month
        // --------------------------------

        const monthlySales = new Map();

        validOrderItems.forEach((item) => {
            const order =
                ordersMap.get(
                    item.order_id
                );

            if (!order) {
                return;
            }

            const date =
                new Date(
                    order.created_at
                );

            const month =
                date.toLocaleDateString(
                    "en-US",
                    {
                        year: "numeric",
                        month: "short"
                    }
                );

            const amount =
                Number(
                    item.price_at_purchase || 0
                ) *
                Number(
                    item.quantity || 0
                );

            monthlySales.set(
                month,
                (monthlySales.get(month) || 0) +
                amount
            );
        });


        const salesByMonth = [
            ...monthlySales.entries()
        ].map(
            ([month, sales]) => ({
                month,
                sales
            })
        );


        return res.json({
            totalSales,
            totalOrders,
            topProducts,
            salesByMonth
        });

    } catch (error) {
        console.error(
            "Get seller analytics error:",
            error
        );

        return res.status(500).json({
            error: "Server error"
        });
    }
}


export async function getAdminAnalytics(req, res) {
    try {
        const { data: orders, error: ordersError } =
            await supabase
                .from("orders")
                .select(`
                    id,
                    status,
                    total_amount,
                    created_at
                `)
                .order("created_at", {
                    ascending: true
                });

        if (ordersError) {
            return res.status(500).json({
                error: ordersError.message
            });
        }

        if (!orders || orders.length === 0) {
            return res.json({
                totalRevenue: 0,
                salesByMonth: []
            });
        }


        // Ignore cancelled orders
        const validOrders = orders.filter(
            (order) =>
                order.status !== "cancelled"
        );


        // Total revenue
        const totalRevenue =
            validOrders.reduce(
                (total, order) => {
                    return (
                        total +
                        Number(
                            order.total_amount || 0
                        )
                    );
                },
                0
            );


        // Sales by month
        const monthlySales = new Map();

        validOrders.forEach((order) => {
            const date =
                new Date(order.created_at);

            const month =
                date.toLocaleDateString(
                    "en-US",
                    {
                        year: "numeric",
                        month: "short"
                    }
                );

            const amount =
                Number(
                    order.total_amount || 0
                );

            monthlySales.set(
                month,
                (monthlySales.get(month) || 0) +
                amount
            );
        });


        const salesByMonth = [
            ...monthlySales.entries()
        ].map(
            ([month, sales]) => ({
                month,
                sales
            })
        );


        return res.json({
            totalRevenue,
            salesByMonth
        });

    } catch (error) {
        console.error(
            "Get admin analytics error:",
            error
        );

        return res.status(500).json({
            error: "Server error"
        });
    }
}


export async function getAdminOverview(req, res) {
    try {
        // Recent orders
        const { data: recentOrders, error: ordersError } =
            await supabase
                .from("orders")
                .select(`
                    id,
                    user_id,
                    status,
                    total_amount,
                    created_at
                `)
                .order("created_at", {
                    ascending: false
                })
                .limit(5);

        if (ordersError) {
            return res.status(500).json({
                error: ordersError.message
            });
        }


        // Recent users
        const { data: recentUsers, error: usersError } =
            await supabase
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
                })
                .limit(5);

        if (usersError) {
            return res.status(500).json({
                error: usersError.message
            });
        }


        return res.json({
            recentOrders: recentOrders || [],
            recentUsers: recentUsers || []
        });

    } catch (error) {
        console.error(
            "Get admin overview error:",
            error
        );

        return res.status(500).json({
            error: "Server error"
        });
    }
}


// Update order status - Admin
export async function updateAdminOrderStatus(req, res) {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const allowedStatuses = [
            "pending",
            "processing",
            "shipped",
            "completed",
            "cancelled"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                error: "Invalid order status"
            });
        }

        const { data: order, error: orderError } =
            await supabase
                .from("orders")
                .select("id")
                .eq("id", id)
                .single();

        if (orderError || !order) {
            return res.status(404).json({
                error: "Order not found"
            });
        }

        const { data, error } =
            await supabase
                .from("orders")
                .update({
                    status
                })
                .eq("id", id)
                .select(`
                    id,
                    user_id,
                    status,
                    total_amount,
                    shipping_address,
                    created_at,
                    updated_at
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
            "Update admin order status error:",
            error
        );

        return res.status(500).json({
            error: "Server error"
        });
    }
}

