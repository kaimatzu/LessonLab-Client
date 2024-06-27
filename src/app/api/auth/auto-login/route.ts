import { AuthResponse } from "@/lib/hooks/context-providers/user-context";
import RequestBuilder from "@/lib/hooks/builders/request-builder";

/**
 * Attempts to auto-login the user using the authToken stored in cookies.
 * 
 * This function sends a POST request to the backend server to attempt an auto-login.
 * It uses the `RequestBuilder` class to construct the request, setting the appropriate URL,
 * method, headers, and credentials.
 * 
 * If the auto-login is successful, the server will return the user data. If there is an error
 * during the auto-login process, it logs the error and returns an error message.
 */
export async function POST() {
    const requestBuilder = new RequestBuilder()
    .setURL(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/auto-login`)
        .setMethod("POST")
        .setHeaders({ "Content-Type": "application/json" })
        .setCredentials("include");

    try {
        const response = await fetch(requestBuilder.build());

        if (response.ok) {
            const responseData: AuthResponse = await response.json();
            console.log("Auto-login successful:", responseData);
            return { responseData, success: true };
        } else {
            const errorData = await response.json();
            console.error("Auto-login failed:", errorData);
            return { responseData: errorData, success: false };
        }
    } catch (error) {
        console.error("Error during auto-login:", error);
        return { responseData: { error: "Internal Server Error" }, success: false };
    }
}