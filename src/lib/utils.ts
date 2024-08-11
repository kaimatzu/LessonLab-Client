import { ItemType } from '@/components/material/quiz'
import { toast } from '@/components/ui/ui-base/use-toast'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { ANSWER_FIELD } from './globals'


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

export function objectListToGiftFormat(items: ItemType[]): string {
  let giftFormat = ''
  items.map(item => {
    giftFormat += (objectToGiftFormat(item) + '\n\n')
  })
  return giftFormat
}

export function jsonToGiftFormat(json: string): string | undefined {
  // Can only be
  try {
    JSON.parse(json)
    return 'jsonToGiftFormat Unimplemented'
  } catch (error) {
    console.log(error)
    toast({
      title: 'JSON error',
      descriptin: 'Invalid JSON',
      variant: 'destructive',
    })
    return undefined
  }
}