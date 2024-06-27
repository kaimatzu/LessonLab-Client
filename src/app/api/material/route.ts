/**
 * Sends a POST request to the server for creating a new material.
 *
 * @param request - The request object containing the data.
 * @returns A Promise that resolves to a Response object.
 */
export async function POST(request: Request) {
    try {
        const requestBody = await request.text();
        console.log(requestBody)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/materials/create`,
        {
            method: "POST",
            headers: {
              'Content-Type': 'application/json'
            },
            body: requestBody,
            credentials: "include",
          }
      );
  
      if (response.ok) {
        const responseBody = await response.text();
        const responseData = JSON.parse(responseBody);
        console.log("Material created successfully:", responseData);
        return new Response(
          JSON.stringify({ 
            MaterialID: responseData.MaterialID,
            MaterialName: responseData.MaterialName,
            MaterialType: responseData.MaterialType,
        }),
          { status: 200 }
        );
      } else {
        throw new Error("Failed to create material, " + response.statusText);
      }
    } catch (error) {
      console.error("Error creating material:", error);
      return new Response(JSON.stringify({ error: "Internal Server Error" }), {
        status: 500,
      });
    }
  }