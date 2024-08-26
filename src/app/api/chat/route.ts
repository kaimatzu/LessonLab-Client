import { StreamingTextResponse, experimental_streamText, streamText } from "ai";

import { openai } from "@ai-sdk/openai";
import RequestBuilder from "@/lib/hooks/builders/request-builder";

export const runtime = "edge";

/**
 * Handles the POST request for the chat route.
 * 
 * This function sends a POST request to the backend server to fetch the context for the chat.
 * It uses the `RequestBuilder` class to construct the request, setting the appropriate URL,
 * method, headers, and body. The function processes the server's response to extract the context
 * and uses it to generate a chat response.
 * 
 * If the context contains a valid prompt, the function interacts with the OpenAI model to generate
 * a streaming chat response. If the prompt is missing or empty, it throws an error.
 * 
 * Usage:
 * 
 * ```typescript
 * import { POST as chat } from '@/app/api/chat/route';
 * 
 * const handleChat = async (messages, namespaceId) => {
 *   const requestBuilder = new RequestBuilder()
 *     .setBody(JSON.stringify({ namespaceId, messages }))
 *     .setHeaders({ "Content-Type": "application/json" });
 *   
 *   try {
 *     const response = await chat(requestBuilder);
 *     // Handle the streaming response
 *   } catch (error) {
 *     console.error("Error during chat interaction:", error);
 *   }
 * };
 * ```
 * 
 * @param requestBuilder - The RequestBuilder instance used to construct the chat request.
 * @returns A StreamingTextResponse object containing the result of the chat interaction.
 * @throws An error if the expected prompt structure is not present in the server response.
 */

export async function POST(request: Request) {
  const { messages, namespaceId, specifications } = await request.json();

  const requestBuilder = new RequestBuilder()
    .setURL(`${process.env.SERVER_URL}/api/context/fetch`)
    .setMethod("POST")
    .setHeaders({ "Content-Type": "application/json" })
    .setBody(JSON.stringify({
      namespaceId: namespaceId,
      messages: messages,
      specifications: specifications,
    }));

  const response = await fetch(requestBuilder.build());
  const { context } = await response.json();

  if (context && context.prompt && context.prompt.length > 0) {
    const systemContent = context.prompt[0].content;

    const result = await streamText({
      system: systemContent,
      temperature: 0.2,
      model: openai.chat("gpt-4-turbo"),
      maxRetries: 8,
      messages,
    });

    return new StreamingTextResponse(result.toAIStream());
  } else {
    throw new Error(
      "Unexpected server response structure: 'prompt' array is missing or empty."
    );
  }
}

export async function GET (requestBuilder: RequestBuilder) {
  requestBuilder
    .setMethod("GET")
    .setHeaders({ 'Content-Type': 'application/json' })
    .setCredentials("include");

  try {
    const response = await fetch(requestBuilder.build());

    if (response.ok) {
      const chatHistory = await response.json();
      console.log("Chat history retrieved successfully:", chatHistory);
      return new Response(JSON.stringify(chatHistory), { status: 200 });
    } else {
      throw new Error("Failed to retrieve chat history, " + response.statusText);
    }
  } catch (error) {
    console.error("Error retrieving chatHistory:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}