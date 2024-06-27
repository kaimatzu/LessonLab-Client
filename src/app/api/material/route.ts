import RequestBuilder from "@/lib/hooks/builders/request-builder";

/**
 * Sends a POST request to the server for creating a new material.
 *
 * This function uses the `RequestBuilder` class to construct the request, 
 * setting the appropriate URL, method, credentials, and headers.
 * It then sends the request using the `fetch` API and processes the response.
 *
 * If the material creation is successful, the function returns a `Response` object
 * containing the material data. If there is an error during the creation process,
 * it logs the error and returns a `Response` object with an error message.
 *
 * Usage:
 * 
 * ```typescript
 * import { POST as createMaterial } from '@/app/api/materials/create/route';
 * import RequestBuilder from "@/lib/hooks/builders/request-builder";
 * 
 * const handleCreateMaterial = async (title: string) => {
 *   const requestBuilder = new RequestBuilder()
 *     .setBody({
 *       materialName: title,
 *       materialType: "LESSON"
 *     });
 *     
 *   const response = await createMaterial(requestBuilder);
 *   if (response.ok) {
 *     const responseData = await response.json();
 *     console.log("Material created successfully:", responseData);
 *   } else {
 *     console.error("Failed to create material");
 *   }
 * };
 * ```
 * 
 * @param requestBuilder - The RequestBuilder instance used to construct the create material request.
 * @returns A Promise that resolves to a Response object.
 */
export async function POST(requestBuilder: RequestBuilder) {
    requestBuilder.setURL(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/materials/create`)
      .setMethod("POST")
      .setCredentials("include")
      .setHeaders({ 'Content-Type': 'application/json' });

    try {
      const response = await fetch(requestBuilder.build());
  
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