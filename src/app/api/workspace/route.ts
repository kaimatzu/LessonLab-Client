import RequestBuilder from "@/lib/hooks/builders/request-builder";

/**
 * Sends a POST request to the server for creating a new workspace.
 *
 * This function uses the `RequestBuilder` class to construct the request, 
 * setting the appropriate URL, method, credentials, and headers.
 * It then sends the request using the `fetch` API and processes the response.
 *
 * If the workspace creation is successful, the function returns a `Response` object
 * containing the workspace data. If there is an error during the creation process,
 * it logs the error and returns a `Response` object with an error message.
 *
 * Usage:
 * 
 * ```typescript
 * import { POST as createWorkspace } from '@/app/api/workspaces/create/route';
 * import RequestBuilder from "@/lib/hooks/builders/request-builder";
 * 
 * const handleCreateWorkspace = async (title: string) => {
 *   const requestBuilder = new RequestBuilder()
 *     .setBody({
 *       workspaceName: title,
 *       workspaceType: "LESSON"
 *     });
 *     
 *   const response = await createWorkspace(requestBuilder);
 *   if (response.ok) {
 *     const responseData = await response.json();
 *     console.log("Workspace created successfully:", responseData);
 *   } else {
 *     console.error("Failed to create workspace");
 *   }
 * };
 * ```
 * 
 * @param requestBuilder - The RequestBuilder instance used to construct the create workspace request.
 * @returns A Promise that resolves to a Response object.
 */
export async function POST(requestBuilder: RequestBuilder) {
  requestBuilder.setURL(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/workspaces/create`)
    .setMethod("POST")
    .setCredentials("include")
    .setHeaders({ 'Content-Type': 'application/json' });

  try {
    const response = await fetch(requestBuilder.build());

    if (response.ok) {
      const responseBody = await response.text();
      const responseData = JSON.parse(responseBody);
      console.log("Workspace created successfully:", responseData);
      return new Response(
        JSON.stringify({ 
          WorkspaceID: responseData.workspace.WorkspaceID,
          WorkspaceName: responseData.workspace.WorkspaceName,
          WorkspaceType: responseData.workspace.WorkspaceType,
          SpecificationID: responseData.specificationID
      }),
        { status: 200 }
      );
    } else {
      throw new Error("Failed to create workspace, " + response.statusText);
    }
  } catch (error) {
    console.error("Error creating workspace:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}


/**
 * Retrieves all workspaces associated with the authenticated user.
 *
 * This function uses the `RequestBuilder` class to construct the request, 
 * setting the appropriate URL, method, and credentials.
 * It then sends the request using the `fetch` API and processes the response.
 *
 * If the retrieval is successful, the function returns a `Response` object
 * containing the list of workspaces. If there is an error during the retrieval process,
 * it logs the error and returns a `Response` object with an error message.
 *
 * Usage:
 * 
 * ```typescript
 * import { GET as getWorkspaces } from '@/app/api/workspaces/route';
 * import RequestBuilder from "@/lib/hooks/builders/request-builder";
 * 
 * const handleGetWorkspaces = async () => {
 *   const requestBuilder = new RequestBuilder();
 *     
 *   const response = await getWorkspaces(requestBuilder);
 *   if (response.ok) {
 *     const workspaces = await response.json();
 *     console.log("Workspaces retrieved successfully:", workspaces);
 *   } else {
 *     console.error("Failed to retrieve workspaces");
 *   }
 * };
 * ```
 * 
 * @param requestBuilder - The RequestBuilder instance used to construct the get workspaces request.
 * @returns A Promise that resolves to a Response object.
 */
export async function GET(requestBuilder: RequestBuilder) {
  requestBuilder.setURL(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/workspaces`)
      .setMethod("GET")
      .setCredentials("include");

  try {
      const response = await fetch(requestBuilder.build());

      if (response.ok) {
          const workspaces = await response.json();
          console.log("Workspaces retrieved successfully:", workspaces);

          const filteredWorkspaces = workspaces.map((workspace: any) => ({
              WorkspaceID: workspace.WorkspaceID,
              WorkspaceName: workspace.WorkspaceName,
              WorkspaceType: workspace.WorkspaceType,
              CreatedAt: workspace.CreatedAt
          }));

          return new Response(JSON.stringify(filteredWorkspaces), { status: 200 });
      } else {
          throw new Error("Failed to retrieve workspaces, " + response.statusText);
      }
  } catch (error) {
      console.error("Error retrieving workspaces:", error);
      return new Response(JSON.stringify({ error: "Internal Server Error" }), {
          status: 500,
      });
  }
}

export async function PATCH(requestBuilder: RequestBuilder) {
  requestBuilder
      // .setURL(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/workspaces`)
      .setMethod("PATCH")
      .setCredentials("include");

  try {
      const response = await fetch(requestBuilder.build());

      if (response.ok) {
          return new Response(JSON.stringify({}), { status: 200 });
      } else {
          throw new Error("Failed to update workspace, " + response.statusText);
      }
  } catch (error) {
      console.error("Error updating workspace:", error);
      return new Response(JSON.stringify({ error: "Internal Server Error" }), {
          status: 500,
      });
  }
}

export async function DELETE(requestBuilder: RequestBuilder) {
  requestBuilder
      .setMethod("DELETE")
      .setCredentials("include");

  try {
      const response = await fetch(requestBuilder.build());

      if (response.ok) {
          return new Response(JSON.stringify({}), { status: 204 });
      } else {
          throw new Error("Failed to delete workspace, " + response.statusText);
      }
  } catch (error) {
      console.error("Error delete workspace:", error);
      return new Response(JSON.stringify({ error: "Internal Server Error" }), {
          status: 500,
      });
  }
}