import { AuthResponse } from "@/lib/hooks/user-context";

/**
 * Authenticates a user with the provided credentials.
 * 
 * This function sends a POST request to the backend server to authenticate the user.
 * It expects the request to contain form-data with the following fields:
 * - username: The username of the user.
 * - password: The password of the user.
 * 
 * If the authentication is successful, the server will return the user data and an authToken
 * which will be stored as a cookie for subsequent requests.
 * 
 * @param request - The request object containing the user credentials.
 * @returns A Response object with the authentication result.
 */
export async function POST(request: Request) {
    const formData = await request.formData();

    const identifier = formData.get("identifier");
    const password = formData.get("password");

    console.log("Route: ", identifier, password);
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/login`, {
            method: "POST",
            body: formData,
            credentials: 'include',
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