import RequestBuilder from '@/lib/hooks/builders/request-builder'
import { openai } from '@ai-sdk/openai'
import { streamObject } from 'ai'
import { z } from 'zod'

// Called by quiz submit
const POST = async (req: Request) => {
  const body = await req.json()
  if (!body) return Response.json({ message: 'Bad request' })

  const namespaceId = body.namespaceId
  const specifications = body.specifications
  const count = body.count
  const items = body.items
  const prompt = body.prompt

  const requestBuilder = new RequestBuilder() // Calls backend
    .setURL(`${process.env.SERVER_URL}/api/context/quiz`)
    .setMethod('POST')
    .setHeaders({ 'Content-Type': 'application/json' })
    .setBody(JSON.stringify({
      namespaceId: namespaceId,
      // messages: messages, // send quiz objects (idk)
      items,
      specifications: specifications,
    }))

  const response = await fetch(requestBuilder.build());
  const { context } = await response.json();

  // console.log('Client: Context value:', context)

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
          .array()
          .length(count),
      }),
      prompt: "Generate a quiz according to the context"
    })

    return result.toTextStreamResponse()
  } else {
    return Response.json({ message: 'Failed to get context', status: 500 })
  }
}

export { POST }
