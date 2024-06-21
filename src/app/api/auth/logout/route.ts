/**
 * Logs out the currently authenticated user.
 * 
 * This function sends a POST request to the backend server to log out the user.
 * It clears the `authToken` cookie on the server side and sends a confirmation response.
 * The function uses the `fetch` API to make the request and includes credentials to ensure
 * the `HttpOnly` cookie is sent with the request.
 * 
 * If the logout is successful, the function returns `true`. If there is an error during
 * the logout process, it logs the error and returns `false`.
 * 
 * Usage:
 * 
 * ```typescript
 * import { POST as logout } from '@/app/api/auth/logout/route';
 * 
 * const handleLogout = async () => {
 *   const success = await logout();
 *   if (success) {
 *     clearUser(); // Clear user context and perform any other cleanup
 *   }
 * };
 * ```
 * 
 * @returns A boolean indicating the success of the logout operation.
 */
export async function POST() {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/logout`, {
            method: "POST",
            credentials: "include", // Ensure cookies are sent with the request
        });

        if (response.ok) {
            return true;
        } else {
            console.error("Failed to log out");
            return false;
        }
    } catch (error) {
        console.error("Error during logout:", error);
        return false;
    }
}