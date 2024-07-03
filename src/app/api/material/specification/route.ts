import RequestBuilder from "@/lib/hooks/builders/request-builder";

/**
 * Retrieves all specifications associated with a workspace.
 *
 * @param requestBuilder - The RequestBuilder instance used to construct the get specifications request.
 * @returns A Promise that resolves to a Response object.
 */
export async function GET(requestBuilder: RequestBuilder) {
    requestBuilder
      // .setURL(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/materials/specifications`)
      .setMethod("GET")
      .setCredentials("include");
  
    try {
      const response = await fetch(requestBuilder.build());
  
      if (response.ok) {
        const specifications = await response.json();
        console.log("Specifications retrieved successfully:", specifications);
        return new Response(JSON.stringify(specifications), { status: 200 });
      } else {
        throw new Error("Failed to retrieve specifications, " + response.statusText);
      }
    } catch (error) {
      console.error("Error retrieving specifications:", error);
      return new Response(JSON.stringify({ error: "Internal Server Error" }), {
        status: 500,
      });
    }
}

/**
 * Sends a POST request to the server to update a specification.
 *
 * @param requestBuilder - The RequestBuilder instance used to construct the update specification request.
 * @returns A Promise that resolves to a Response object.
 */
export async function POST(requestBuilder: RequestBuilder) {
  requestBuilder.setURL(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/materials/specifications/set`)
    .setMethod("POST")
    .setCredentials("include")
    .setHeaders({ 'Content-Type': 'application/json' });

  try {
    const response = await fetch(requestBuilder.build());

    if (response.ok) {
      const responseBody = await response.text();
      const responseData = JSON.parse(responseBody);
      console.log("Specification updated successfully:", responseData);
      return new Response(
        JSON.stringify({ 
          SpecificationID: responseData.SpecificationID,
          SpecificationData: responseData.SpecificationData,
          MaterialID: responseData.MaterialID,
        }),
        { status: 200 }
      );
    } else {
      throw new Error("Failed to update specification, " + response.statusText);
    }
  } catch (error) {
    console.error("Error updating specification:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}


/**
 * Sends a DELETE request to the server to delete a specification.
 *
 * @param requestBuilder - The RequestBuilder instance used to construct the delete specification request.
 * @returns A Promise that resolves to a Response object.
 */
export async function DELETE(requestBuilder: RequestBuilder) {
    requestBuilder.setURL(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/materials/specifications/delete`)
      .setMethod("DELETE")
      .setCredentials("include")
      .setHeaders({ 'Content-Type': 'application/json' });
  
    try {
      const response = await fetch(requestBuilder.build());
  
      if (response.ok) {
        console.log("Specification deleted successfully");
        return new Response(JSON.stringify({ message: "Specification deleted successfully" }), { status: 200 });
      } else {
        throw new Error("Failed to delete specification, " + response.statusText);
      }
    } catch (error) {
      console.error("Error deleting specification:", error);
      return new Response(JSON.stringify({ error: "Internal Server Error" }), {
        status: 500,
      });
    }
  }