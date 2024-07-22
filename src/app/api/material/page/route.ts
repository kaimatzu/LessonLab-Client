import RequestBuilder from "@/lib/hooks/builders/request-builder";

/**
 * @param requestBuilder - The RequestBuilder instance used to construct the create material request.
 * @returns A Promise that resolves to a Response object.
 */
export async function POST(requestBuilder: RequestBuilder) {
  requestBuilder.setURL(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/materials/lessons/pages`)
    .setMethod("POST")
    .setCredentials("include")
    .setHeaders({ 'Content-Type': 'application/json' });

  try {
    const response = await fetch(requestBuilder.build());

    if (response.ok) {
      const responseBody = await response.text();
      const responseData = JSON.parse(responseBody);
      console.log("New lesson page created successfully:", responseData);
      return new Response(
        JSON.stringify({ 
          PageID: responseData.PageID,
      }),
        { status: 200 }
      );
    } else {
      throw new Error("Failed to create new lesson page, " + response.statusText);
    }
  } catch (error) {
    console.error("Error creating new lesson page:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}


/**
 * @param requestBuilder - The RequestBuilder instance used to construct the get materials request.
 * @returns A Promise that resolves to a Response object.
 */
export async function GET(requestBuilder: RequestBuilder) {
  requestBuilder
      .setMethod("GET")
      .setCredentials("include");

  try {
      const response = await fetch(requestBuilder.build());

      if (response.ok) {
        const pages = await response.json();
        console.log("Lesson pages retrieved successfully:", pages);

        console.log(pages)
        return new Response(JSON.stringify(pages), { status: 200 });
      } else {
          throw new Error("Failed to retrieve lesson pages, " + response.statusText);
      }
  } catch (error) {
      console.error("Error retrieving lesson pages:", error);
      return new Response(JSON.stringify({ error: "Internal Server Error" }), {
          status: 500,
      });
  }
}

export async function updatePageContent(selectedPageId: string, lessonId: string, content: string) {
  const requestBuilder = new RequestBuilder()
    .setURL(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/materials/lessons/pages/update/content`)
    .setMethod("PATCH")
    .setHeaders({ 'Content-Type': 'application/json' })
    .setBody(JSON.stringify({ pageId: selectedPageId, lessonId: lessonId, newContent: content }))
    .setCredentials("include")
  try {
    const result = await fetch(requestBuilder.build());
    console.log(result);
  } catch (error) {
    console.error('Error updating specification topic:', error);
  }
}