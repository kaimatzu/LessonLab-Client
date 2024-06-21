import { AuthResponse } from "@/lib/hooks/user-context";

/**
 * Registers a new user with the provided details.
 * 
 * This function sends a POST request to the backend server to register a new user.
 * It expects the request to contain form-data with the following fields:
 * - username: The desired username for the new user.
 * - password: The desired password for the new user.
 * - userType: The type of user, typically "STUDENT" or "TEACHER".
 * - name: The full name of the new user.
 * - email: The email address of the new user.
 * 
 * If the registration is successful, the server will return the user data and an authToken
 * which will be stored as a cookie for subsequent requests.
 * 
 * @param request - The request object containing the user details.
 * @returns A Response object with the registration result.
 */
export async function POST(request: Request) {
    const formData = await request.formData();

    const username = formData.get("username");
    const password = formData.get("password");
    const userType = formData.get("userType");
    const name = formData.get("name");
    const email = formData.get("email");

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/register`, {
            method: "POST",
            body: formData,
            credentials: 'include',
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
