import RequestBuilder from "@/lib/hooks/builders/request-builder";

/**
 * @param requestBuilder - The RequestBuilder instance used to construct the create module request.
 * @returns A Promise that resolves to a Response object.
 */
export async function POST(requestBuilder: RequestBuilder) {
  requestBuilder.setURL(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/workspaces/modules/create`)
    .setMethod("POST")
    .setCredentials("include")
    .setHeaders({ 'Content-Type': 'application/json' });

  try {
    const response = await fetch(requestBuilder.build());

    if (response.ok) {
      const responseBody = await response.text();
      const responseData = JSON.parse(responseBody);
      console.log("New module created successfully:", responseData);
      return new Response(
        JSON.stringify({
          moduleID: responseData.moduleID,
          moduleNodeID: responseData.moduleNodeID,
      }),
        { status: 200 }
      );
    } else {
      throw new Error("Failed to create new module, " + response.statusText);
    }
  } catch (error) {
    console.error("Error creating new module:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}

/**
 * @param requestBuilder - The RequestBuilder instance used to construct the create workspace request.
 * @returns A Promise that resolves to a Response object.
 */
export async function insertNode(requestBuilder: RequestBuilder) {
  requestBuilder.setURL(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/workspaces/modules/insert`)
    .setMethod("POST")
    .setCredentials("include")
    .setHeaders({ 'Content-Type': 'application/json' });

  try {
    const response = await fetch(requestBuilder.build());

    if (response.ok) {
      const responseBody = await response.text();
      const responseData = JSON.parse(responseBody);
      console.log("New module node inserted successfully:", responseData);
      return new Response(
        JSON.stringify({ 
          moduleNodeID: responseData.moduleNodeID,
      }),
        { status: 200 }
      );
    } else {
      throw new Error("Failed to insert new module node, " + response.statusText);
    }
  } catch (error) {
    console.error("Error inserting new module node:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}

/**
 * @param requestBuilder - The RequestBuilder instance used to construct the get module data request.
 * @returns A Promise that resolves to a Response object.
 */
export async function GET(requestBuilder: RequestBuilder) {
  requestBuilder
    .setMethod("GET")
    .setCredentials("include")
    .setHeaders({ 'Content-Type': 'application/json' });

  try {
    const response = await fetch(requestBuilder.build());

    if (response.ok) {
      const responseBody = await response.text();
      const responseData = JSON.parse(responseBody);
      console.log("Fetched workspace modules/data:", responseData);
      return new Response(
        JSON.stringify(responseData),
        { status: 200 }
      );
    } else {
      throw new Error("Failed to fetch workspace modules/data, " + response.statusText);
    }
  } catch (error) {
    console.error("Error fetching workspace modules/data:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
