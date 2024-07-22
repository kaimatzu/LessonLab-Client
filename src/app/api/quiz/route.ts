import { openai } from '@ai-sdk/openai'
import { streamObject } from 'ai'
import { z } from 'zod'

const POST = async (req: Request) => {
  const body = await req.json()
  if (!body) return Response.json({ message: 'Bad request' })

  // const count = body.count
  // const prompt = body.prompt
  // console.log()

  const result = await streamObject({
    system: 'Generate a quiz according to the users specifications.',
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
        .length(body.count),
    }),
    prompt: body.prompt
  })

  return result.toTextStreamResponse()
}

export { POST }
