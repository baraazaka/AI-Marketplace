
import supabase from "../config/supabase.js";


// Signup
export async function signup(req, res) {

    const {
        email,
        password,
        full_name
    } = req.body;


    // Validate required fields
    if (!email || !password || !full_name) {
        return res.status(400).json({
            error: "email, password and full_name are required"
        });
    }


    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
        email,
        password
    });


    if (error) {
        return res.status(400).json({
            error: error.message
        });
    }


    const user = data.user;


    if (!user) {
        return res.status(400).json({
            error: "User could not be created"
        });
    }


    // Create profile
    // Role is controlled by the server
    const { error: profileError } = await supabase
        .from("profiles")
        .insert([
            {
                id: user.id,
                full_name,
                role: "user"
            }
        ]);


    if (profileError) {
        return res.status(500).json({
            error: profileError.message
        });
    }


    res.status(201).json({
        message: "User created successfully",
        user: {
            id: user.id,
            email: user.email
        }
    });
}


// Login
export async function login(req, res) {

    const {
        email,
        password
    } = req.body;


    // Validate required fields
    if (!email || !password) {
        return res.status(400).json({
            error: "email and password are required"
        });
    }


    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });


    if (error) {
        return res.status(401).json({
            error: error.message
        });
    }


    res.json({
        message: "Login successful",
        user: {
            id: data.user.id,
            email: data.user.email
        },
        access_token: data.session.access_token
    });
}

