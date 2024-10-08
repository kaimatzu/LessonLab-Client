import RequestBuilder from "@/lib/hooks/builders/request-builder";
import { AuthResponse } from "@/lib/hooks/context-providers/user-context";

/**
 * Registers a new user with the provided details.
 * 
 * This function sends a POST request to the backend server to register a new user.
 * It uses the `RequestBuilder` class to construct the request, setting the appropriate URL,
 * method, and credentials.
 * It expects the request to contain form-data with the following fields:
 * - username: The desired username for the new user.
 * - password: The desired password for the new user.
 * - userType: The type of user, "STUDENT" or "TEACHER".
 * - name: The full name of the new user.
 * - email: The email address of the new user.
 * 
 * If the registration is successful, the server will return the user data and an authToken
 * which will be stored as a cookie for subsequent requests.
 * 
 * Usage:
 * 
 * ```typescript
 * import { POST as registerUser } from '@/app/api/users/register/route';
 * import RequestBuilder from "@/lib/hooks/builders/request-builder";
 * 
 * const handleRegister = async (userDetails: { username: string; password: string; userType: string; name: string; email: string; }) => {
 *   const { username, password, userType, name, email } = userDetails;
 *   const formData = new FormData();
 *   formData.append('username', username);
 *   formData.append('password', password);
 *   formData.append('userType', userType);
 *   formData.append('name', name);
 *   formData.append('email', email);
 *   
 *   const requestBuilder = new RequestBuilder()
 *     .setBody(formData);
 *     
 *   const response = await registerUser(requestBuilder);
 *   if (response.ok) {
 *     const responseData = await response.json();
 *     console.log("User registered successfully:", responseData);
 *   } else {
 *     console.error("Failed to register user");
 *   }
 * };
 * ```
 * 
 * @param requestBuilder - The RequestBuilder instance used to construct the register user request.
 * @returns A Response object with the registration result.
 */
export async function POST(requestBuilder: RequestBuilder) {
    requestBuilder.setURL(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/register`)
        .setMethod("POST")
        .setCredentials("include");

    try {
        const response = await fetch(requestBuilder.build());

        if (response.ok) {
            const responseData: AuthResponse = await response.json();
            console.log("User registered successfully:", responseData);
            return new Response(JSON.stringify(responseData), { status: 201 });
        } else {
            const errorData = await response.json();
            console.error("Failed to register:", errorData);
            const { message } = errorData
            return new Response(JSON.stringify(message), { status: response.status });
        }
    } catch (error) {
        console.error("Error registering user:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}
