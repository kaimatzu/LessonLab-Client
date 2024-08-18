import { toast } from '@/components/ui/ui-base/use-toast'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { ANSWER_FIELD } from './globals'
import { FetchedFile } from '@/app/api/files/route'
import { z } from 'zod'

// type Choice = {
//   content: string | undefined
//   correct: boolean | undefined
// }

// type Identification = {
//   question: string | undefined
//   answer: string | undefined
// }

// type MultipleChoice = {
//   question: string | undefined
//   choices: Choice[] | undefined
// }

// export type ItemType = Identification | MultipleChoice

export const GeneratedQuizSchema = z.object({
  items: z.union([
    z.object({
      question: z.string(),
      answer: z.string(),
    }),
    z.object({
      question: z.string(),
      choices: z.object({
        content: z.string(),
        correct: z.boolean(),
      })
        .array()
        .length(4),
    }),
  ])
    .array(),
})

export type GeneratedQuiz = z.infer<typeof GeneratedQuizSchema>

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function objectToGiftFormat(item: ItemType) {
  if (ANSWER_FIELD in item) {
    return `${item.question} { =${item.answer} }`
  } else {
    return `${item.question} { ${item.choices?.map(choice => {
      return choice.correct ? `=${choice.content} ` : `~${choice.content} `
    })}}`.replace(/,/g, '')
  }
}

export function objectArrayToGiftFormat(items: ItemType[]): string {
  let giftFormat = ''
  items.map(item => {
    giftFormat += (objectToGiftFormat(item) + '\n\n')
  })
  return giftFormat
}

export function jsonToGiftFormat(json: string): string | undefined {
  try {
    const object = JSON.parse(json)
    objectToGiftFormat(object)
    return 'jsonToGiftFormat Unimplemented'
  } catch (error) {
    console.log(error)
    toast({
      title: 'JSON parsing error',
      descriptin: 'Invalid JSON',
      variant: 'destructive',
    })
    return undefined
  }
}

export const fetchFileUrls = async (workspaceId: string) => {
  try {
    const response = await fetch(`/api/files/?namespaceId=${workspaceId}`);
    if (!response.ok) {
      alert('Failed to fetch files response not ok')
      throw new Error('Failed to fetch file URLs');
    }
    const files: FetchedFile[] = await response.json();
    return files;
  } catch (error) {
    alert('Failed to fetch files error')
    console.error('Error fetching file URLs:', error);
    return [];
  }
}

// TODO: Use automapper if needed
// https://automapperts.netlify.app
export const mapGeneratedQuizToItemType = (generatedQuiz: any): ItemType[] => {

  if (generatedQuiz && generatedQuiz.items) {
    return generatedQuiz?.items?.map((item: any) => {
      //   if (!item) {
      //     console.log('--> item is null')
      //     return null
      //   }

      //   if (!item.choices) {
      //     console.log('--> item.choices is null')
      //     return null
      //   }

      //   if (!item.choices[0] || !item.choices[1] || !item.choices[2] || !item.choices[3]) {
      //     console.log('--> item.choice[n] is null')
      //     return null
      //   }

      return 'answer' in item ?
        {
          question: item?.question ?? '',
          answer: item?.answer ?? '',
        } as ItemType
        :
        {
          question: item?.question ?? '',
          choices: [
            { content: item?.choices?.[0]?.content ?? '', correct: item?.choices?.[0]?.correct ?? false },
            { content: item?.choices?.[1]?.content ?? '', correct: item?.choices?.[1]?.correct ?? false },
            { content: item?.choices?.[2]?.content ?? '', correct: item?.choices?.[2]?.correct ?? false },
            { content: item?.choices?.[3]?.content ?? '', correct: item?.choices?.[3]?.correct ?? false },
          ],
        } as ItemType
    })
  }

  return []
}
