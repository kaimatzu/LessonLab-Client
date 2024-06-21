import { AuthResponse } from "@/lib/hooks/user-context";

/**
 * Attempts to auto-login the user using the authToken stored in cookies.
 */
export async function POST() {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/auto-login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include", // Ensure cookies are sent with the request
        });

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