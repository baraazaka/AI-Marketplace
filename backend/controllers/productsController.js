
import supabase, { supabaseAdmin } from "../config/supabase.js";


//```js
export async function getProducts(req, res) {
    try {
        const { data, error } = await supabase
            .from("products")
            .select(`
                id,
                seller_id,
                category_id,
                name,
                description,
                price,
                stock,
                image_url,
                created_at,
                updated_at,

                categories (
                    id,
                    name
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

        const products = (data || []).map((product) => ({
            ...product,

            category: product.categories?.name || null
        }));

        return res.json(products);

    } catch (error) {
        console.error(
            "Get products error:",
            error
        );

        return res.status(500).json({
            error: "Server error"
        });
    }
}



// Get all products - Admin
export async function getAdminProducts(req, res) {
    try {
        const { data, error } = await supabase
            .from("products")
            .select(`
                id,
                seller_id,
                category_id,
                name,
                description,
                price,
                stock,
                image_url,
                created_at,
                updated_at,

                profiles (
                    full_name,
                    avatar_url
                ),

                categories (
                    id,
                    name
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
            "Get admin products error:",
            error
        );

        return res.status(500).json({
            error: "Server error"
        });
    }
}


// Get my products
export async function getMyProducts(req, res) {
    try {
        const seller_id = req.user.id;

        const { data, error } = await supabase
            .from("products")
            .select("*")
            .eq("seller_id", seller_id)
            .order("created_at", { ascending: false });

        if (error) {
            return res.status(500).json({
                error: error.message
            });
        }

        res.json(data);

    } catch (error) {
        console.error("Get my products error:", error);

        return res.status(500).json({
            error: "Server error"
        });
    }
}


// Get one product
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


// Create product
export async function createProduct(req, res) {
    try {
        const {
            name,
            description,
            price,
            stock,
            brand,
            category_id
        } = req.body;

        const seller_id = req.user.id;


        // Validate required fields
        if (
            !name ||
            !description ||
            price === undefined ||
            stock === undefined ||
            !brand ||
            !category_id
        ) {
            return res.status(400).json({
                error: "All required product fields must be provided"
            });
        }


        // Image is required
        if (!req.file) {
            return res.status(400).json({
                error: "Product image is required"
            });
        }


        const file = req.file;


        // Create unique file name
        const fileExtension =
            file.originalname.split(".").pop();

        const fileName =
            `${seller_id}/${Date.now()}-${Math.random()
                .toString(36)
                .substring(2)}.${fileExtension}`;


        // Upload image to Supabase Storage
        // Use supabaseAdmin because Storage RLS
        // blocks the normal client.
        const { error: uploadError } =
            await supabaseAdmin.storage
                .from("product-images")
                .upload(fileName, file.buffer, {
                    contentType: file.mimetype,
                    upsert: false
                });


        if (uploadError) {
            console.error(
                "Image upload error:",
                uploadError
            );

            return res.status(500).json({
                error: "Failed to upload product image"
            });
        }


        // Get public image URL
        const {
            data: publicUrlData
        } = supabaseAdmin.storage
            .from("product-images")
            .getPublicUrl(fileName);

        const image_url =
            publicUrlData.publicUrl;


        // Insert product into database
        const { data, error } = await supabase
            .from("products")
            .insert([
                {
                    seller_id,
                    category_id: Number(category_id),
                    name: name.trim(),
                    description: description.trim(),
                    price: Number(price),
                    stock: Number(stock),
                    brand: brand.trim(),
                    image_url
                }
            ])
            .select()
            .single();


        if (error) {

            // If database insert fails,
            // remove uploaded image.
            await supabaseAdmin.storage
                .from("product-images")
                .remove([fileName]);

            return res.status(500).json({
                error: error.message
            });
        }


        res.status(201).json(data);

    } catch (error) {
        console.error(
            "Create product error:",
            error
        );

        return res.status(500).json({
            error: "Server error"
        });
    }
}


// Update product

// Update product
export async function updateProduct(req, res) {
    try {
        const { id } = req.params;

        const {
            name,
            description,
            price,
            stock,
            brand,
            category_id
        } = req.body;


        // Get current product
        const { data: currentProduct, error: currentProductError } =
            await supabase
                .from("products")
                .select("*")
                .eq("id", id)
                .single();


        if (currentProductError || !currentProduct) {
            return res.status(404).json({
                error: "Product not found"
            });
        }


        // Prepare product updates
        const updates = {};


        if (name !== undefined) {
            updates.name = name.trim();
        }


        if (description !== undefined) {
            updates.description = description.trim();
        }


        if (price !== undefined) {
            updates.price = Number(price);
        }


        if (stock !== undefined) {
            updates.stock = Number(stock);
        }


        if (brand !== undefined) {
            updates.brand = brand.trim();
        }


        if (category_id !== undefined) {
            updates.category_id = Number(category_id);
        }


        // Check if a new image was uploaded
        if (req.file) {
            const file = req.file;


            // Get file extension
            const fileExtension =
                file.originalname.split(".").pop();


            // Create unique file name
            const seller_id = req.user.id;

            const fileName =
                `${seller_id}/${Date.now()}-${Math.random()
                    .toString(36)
                    .substring(2)}.${fileExtension}`;


            // Upload new image
            const { error: uploadError } =
                await supabaseAdmin.storage
                    .from("product-images")
                    .upload(fileName, file.buffer, {
                        contentType: file.mimetype,
                        upsert: false
                    });


            if (uploadError) {
                console.error(
                    "Image upload error:",
                    uploadError
                );

                return res.status(500).json({
                    error: "Failed to upload new product image"
                });
            }


            // Get new public URL
            const {
                data: publicUrlData
            } = supabaseAdmin.storage
                .from("product-images")
                .getPublicUrl(fileName);


            const newImageUrl =
                publicUrlData.publicUrl;


            // Add new image URL to database update
            updates.image_url = newImageUrl;
        }


        // Update product in database
        const { data, error } = await supabase
            .from("products")
            .update(updates)
            .eq("id", id)
            .select()
            .single();


        if (error) {

            // If database update fails,
            // remove the newly uploaded image.
            if (req.file) {
                const fileExtension =
                    req.file.originalname.split(".").pop();

                // We cannot safely reconstruct the uploaded
                // file name here, so this will be handled
                // in the next improvement.
            }


            return res.status(500).json({
                error: error.message
            });
        }


        // If a new image was uploaded,
        // delete the old image.
        if (req.file && currentProduct.image_url) {

            const oldImageUrl =
                currentProduct.image_url;

            const marker =
                "/product-images/";

            const markerIndex =
                oldImageUrl.indexOf(marker);


            if (markerIndex !== -1) {

                const oldFilePath =
                    decodeURIComponent(
                        oldImageUrl.substring(
                            markerIndex + marker.length
                        )
                    );


                await supabaseAdmin.storage
                    .from("product-images")
                    .remove([oldFilePath]);
            }
        }


        res.json(data);

    } catch (error) {

        console.error(
            "Update product error:",
            error
        );

        return res.status(500).json({
            error: "Server error"
        });
    }
}


export async function deleteProduct(req, res) {
    try {
        const { id } = req.params;

        // Get the product first
        const { data: product, error: productError } =
            await supabase
                .from("products")
                .select("*")
                .eq("id", id)
                .single();

        if (productError || !product) {
            return res.status(404).json({
                error: "Product not found"
            });
        }

        // Delete product from database
        const { data, error } = await supabase
            .from("products")
            .delete()
            .eq("id", id)
            .select()
            .single();

        if (error) {
            return res.status(500).json({
                error: error.message
            });
        }

        // Delete product image from Storage
        if (product.image_url) {
            try {
                const imageUrl = new URL(product.image_url);

                const storagePrefix =
                    "/storage/v1/object/public/product-images/";

                if (
                    imageUrl.pathname.startsWith(
                        storagePrefix
                    )
                ) {
                    const filePath =
                        imageUrl.pathname
                            .replace(storagePrefix, "")
                            .split("?")[0];

                    const { error: storageError } =
                        await supabaseAdmin.storage
                            .from("product-images")
                            .remove([filePath]);

                    if (storageError) {
                        console.error(
                            "Image delete error:",
                            storageError
                        );
                    }
                }
            } catch (error) {
                console.error(
                    "Invalid product image URL:",
                    error
                );
            }
        }

        return res.json({
            message: "Product deleted successfully",
            product: data
        });

    } catch (error) {
        console.error(
            "Delete product error:",
            error
        );

        return res.status(500).json({
            error: "Server error"
        });
    }
}

