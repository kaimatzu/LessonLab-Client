import { StreamingTextResponse, experimental_streamText } from "ai";

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
// export async function POST(requestBuilder: RequestBuilder) {
//   requestBuilder
//     .setURL(`${process.env.SERVER_URL}/api/context/fetch`)
//     .setMethod("POST")
//     .setHeaders({ "Content-Type": "application/json" });

//   const request = requestBuilder.build();
  
//   const { messages, namespaceId } = await request.json();
//   requestBuilder.setBody(JSON.stringify({ namespaceId, messages }));

//   const response = await fetch(request);

//   const { context } = await response.json();

//   if (context && context.prompt && context.prompt.length > 0) {
//     const systemContent = context.prompt[0].content;

//     const result = await experimental_streamText({
//       system: systemContent,
//       temperature: 0.2,
//       model: openai.chat("gpt-4-turbo"),
//       maxRetries: 8,
//       messages,
//     });

//     return new StreamingTextResponse(result.toAIStream());
//   } else {
//     throw new Error(
//       "Unexpected server response structure: 'prompt' array is missing or empty."
//     );
//   }
// }

export async function POST(request: Request) {
  const { messages, namespaceId } = await request.json();

  const requestBuilder = new RequestBuilder()
    .setURL(`${process.env.SERVER_URL}/api/context/fetch`)
    .setMethod("POST")
    .setHeaders({ "Content-Type": "application/json" })
    .setBody(JSON.stringify({ 
      namespaceId: namespaceId,
      messages: messages,
    }));

  const response = await fetch(requestBuilder.build());
  const { context } = await response.json();

  if (context && context.prompt && context.prompt.length > 0) {
    const systemContent = context.prompt[0].content;

    const result = await experimental_streamText({
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

// NOTE: I move ni og lain na file aron di mag libog ang routing unsa na function ang gi refer. 
/**
 * Embed a piece of text using an embedding model or service.
 * This is a placeholder and needs to be implemented based on your embedding solution.
 *
 * @param text The text to embed.
 * @returns The embedded representation of the text.
 */
// export async function generateQuiz(chunks: string[]): Promise<any> {
//   // You can use any embedding model or service here.
//   // In this example, we use OpenAI's text-embedding-3-small model.


//   // Free LLMs for testing
//   // https://www.edenai.co/post/top-free-llm-tools-apis-and-open-source-models

//   // TODO: Find the AI generation and add this for function calling
//   // Links:
//   // https://www.youtube.com/watch?v=lJJkBaO15Po
//   // https://www.youtube.com/watch?v=UtwDAge75Ag
//   // https://www.youtube.com/watch?v=4vjYkKnGmFs
//   // https://www.youtube.com/watch?v=JaLP0Xi-rEk

//   // https://www.youtube.com/watch?v=c3_SpJX-A28

//   // From Vercel ai SDK docs
//   // https://sdk.vercel.ai/docs/ai-sdk-core/generating-structured-data
//   // https://sdk.vercel.ai/docs/ai-sdk-core/tools-and-tool-calling
//   const functions = [{
//     'name': 'generate_multiple_choice_quiz',
//     'description': 'Generates a multiple choice quiz',
//     'parameters': {
//       'type': 'object',
//       'description': 'A multiple choice quiz',
//       'number': {
//         'type': 'array',
//         'description': 'A multiple choice quiz with questions and answers',
//         'items': {
//           'type': 'object',
//           'description': 'An item in the quiz',
//           'question': {
//             'type': 'string',
//             'description': 'The question of the item'
//           },
//           'choices': {
//             'type': 'array',
//             'description': 'List of choices one of which is the correct answer',
//             'items': {
//               'type': 'string',
//               'description': 'A choice in a multiple choice type question'
//             }
//           }
//         }
//       },
//     },
//   },
//   {
//     'name': 'generate_identification_quiz',
//     'description': 'Generates an identificaiton quiz',
//     'parameters': {
//       'type': 'object',
//       'description': 'An identification quiz',
//       'number': {
//         'type': 'array',
//         'description': 'List of items in the quiz',
//         'items': {
//           'type': 'object',
//           'description': 'An item in the quiz',
//           'question': {
//             'type': 'string',
//             'description': 'The question of the item'
//           },
//           'answer': {
//             'type': 'string',
//             'description': 'The correct answer of the item'
//           }
//         },
//       },
//     }
//   }]

//   // Comment for now
//   // TODO: Use function calling for Quiz generation
//   // const openai = new OpenAI({
//   //   apiKey: config.openAiApiKey,
//   //   organization: config.openAiOrganizationId,
//   // });
//   // try {
//   //   const response = await openai.embeddings.create({
//   //     model: "text-embedding-3-small",
//   //     input: chunks,
//   //     encoding_format: "float",
//   //     dimensions: 1536,
//   //   });
//   //   return response.data;
//   // } catch (error) {
//   //   console.error("Error embedding text with OpenAI:", error);
//   //   throw error;
//   // }
// }
