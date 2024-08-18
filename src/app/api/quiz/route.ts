import RequestBuilder from '@/lib/hooks/builders/request-builder'
import { openai } from '@ai-sdk/openai'
import { streamObject } from 'ai'
import { z } from 'zod'

// Called by quiz submit
const POST = async (req: Request) => {
  const body = await req.json()
  if (!body) return Response.json({ message: 'Bad request' })

  const { namespaceId, specifications, count, items, prompt } = body

  const requestBuilder = new RequestBuilder() // Calls backend
    .setURL(`${process.env.SERVER_URL}/api/context/quiz`)
    .setMethod('POST')
    .setHeaders({ 'Content-Type': 'application/json' })
    .setBody(JSON.stringify({
      namespaceId: namespaceId,
      items,
      specifications: specifications,
    }))

  const response = await fetch(requestBuilder.build());
  const { context } = await response.json();

  if (context && context.prompt && context.prompt.length > 0) {
    const systemContent = context.prompt[0].content;

    const result = await streamObject({
      system: systemContent,
      model: openai('gpt-4-turbo'),
      schema: z.object({
        items: z
          .union([
            z.object({
              question: z.string(),
              answer: z.string(),
            }),
            z.object({
              question: z.string(),
              choices: z
                .object({
                  content: z.string(),
                  correct: z.boolean(),
                })
                .array()
                .length(4),
            }),
          ])
          .array().length(count),
      }),
      prompt: "Generate a quiz with both multiple choice and identification items"
    })

    // const result = Math.random() < .5 ? await streamObject({
    //   system: systemContent,
    //   model: openai('gpt-4-turbo'),
    //   schema: z.object({
    //     items: z.object({ // Identification
    //       question: z.string(),
    //       answer: z.string(),
    //     }).array().length(count),
    //   }),
    //   prompt: "Generate an identification quiz"
    // }) : await streamObject({
    //   system: systemContent,
    //   model: openai('gpt-4-turbo'),
    //   schema: z.object({
    //     items: z.object({ // Multiple choice
    //       question: z.string(),
    //       choices: z.object({
    //         content: z.string(),
    //         correct: z.boolean(),
    //       }).array().length(4),
    //     }).array().length(count),
    //   }),
    //   prompt: "Generate a multiple choice quiz"
    // })

    return result.toTextStreamResponse()
  } else {
    return Response.json({ message: 'Failed to get context', status: 500 })
  }
}

export { POST }

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