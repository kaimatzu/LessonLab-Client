import { openai } from '@ai-sdk/openai'
import { streamObject } from 'ai'
import { z } from 'zod'

const POST = async (req: Request) => {
  const body = await req.json()
  if (!body) return Response.json({ message: 'Bad request' })

  // const count = body.count
  // const prompt = body.prompt
  // console.log(prompt)

  const result = await streamObject({
    system: 'You are a quiz generator that will generate questions and the answer keys according to the user\'s topic.',
    model: openai('gpt-3.5-turbo'),
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
        .array()
      // .length(body.count),
    }),
    prompt: body.prompt
  })

  return result.toTextStreamResponse()
}

export { POST }

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