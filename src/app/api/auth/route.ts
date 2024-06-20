export interface User {
    userId: string;
    userType: 'STUDENT' | 'TEACHER';
    name: string;
    username: string;
    email: string;
    tokens: number;
}

export interface AuthResponse {
    user: User;
    token: string;
}

/**
 * Fetches all file URLs for a given namespace from the backend server.
 *
 * @param request - The request object.
 */
export async function register(req: Request) {
    const { username, password, userType, name, email } = await req.json();

    try {
        const response = await fetch(`${process.env.SERVER_URL}/api/users/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password, userType, name, email }),
        });

        if (response.ok) {
            const responseData: AuthResponse = await response.json();
            console.log("User registered successfully:", responseData);
            return new Response(JSON.stringify(responseData), { status: 201 });
        } else {
            const errorData = await response.json();
            console.error("Failed to register:", errorData);
            return new Response(JSON.stringify(errorData), { status: response.status });
        }
    } catch (error) {
        console.error("Error registering user:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}

/**
 * Fetches all file URLs for a given namespace from the backend server.
 *
 * @param request - The request object.
 */
export async function login(req: Request) {
    const { identifier, password } = await req.json();

    try {
        const response = await fetch(`${process.env.SERVER_URL}/api/users/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ identifier, password }),
        });

        if (response.ok) {
            const responseData: AuthResponse = await response.json();
            console.log("User logged in successfully:", responseData);
            return new Response(JSON.stringify(responseData), { status: 200 });
        } else {
            const errorData = await response.json();
            console.error("Failed to log in:", errorData);
            return new Response(JSON.stringify(errorData), { status: response.status });
        }
    } catch (error) {
        console.error("Error logging in:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}