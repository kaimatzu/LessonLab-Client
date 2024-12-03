import RequestBuilder from "@/lib/hooks/builders/request-builder";
import { AuthResponse } from "@/lib/hooks/context-providers/user-context";

/**
 * Authenticates a user with the provided credentials.
 * 
 * This function sends a POST request to the backend server to authenticate the user.
 * It uses the `RequestBuilder` class to construct the request, setting the appropriate URL,
 * method, and credentials.
 * It expects the request to contain form-data with the following fields:
 * - username: The username of the user.
 * - password: The password of the user.
 * 
 * If the authentication is successful, the server will return the user data and an authToken
 * which will be stored as a cookie for subsequent requests.
 * 
 * Usage:
 * 
 * ```typescript
 * import { POST as loginUser } from '@/app/api/users/login/route';
 * import RequestBuilder from "@/lib/hooks/builders/request-builder";
 * 
 * const handleLogin = async (credentials: { username: string; password: string; }) => {
 *   const { identifier, password } = credentials;
 *   const formData = new FormData();
 *   formData.append('identifier', identifier);
 *   formData.append('password', password);
 *   
 *   const requestBuilder = new RequestBuilder()
 *     .setBody(formData);
 *     
 *   const response = await loginUser(requestBuilder);
 *   if (response.ok) {
 *     const responseData = await response.json();
 *     console.log("User logged in successfully:", responseData);
 *   } else {
 *     console.error("Failed to log in");
 *   }
 * };
 * ```
 * 
 * @param requestBuilder - The RequestBuilder instance used to construct the login request.
 * @returns A Response object with the authentication result.
 */
export async function POST(requestBuilder: RequestBuilder) {

    requestBuilder
        .setURL(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/login`)
        .setMethod("POST")
        .setCredentials("include");

    try {
        const response = await fetch(requestBuilder.build());

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