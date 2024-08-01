'use client'
import React, { useState } from 'react'

// NOTE(hans): Update Vercel AI SDK to use `useObject` hook
import { experimental_useObject as useObject } from 'ai/react'
import { z } from 'zod';
import { FetchedFile } from '@/app/api/files/route';
import { Card } from '../ui/ui-base/card';
import { Input } from '../ui/ui-base/input';
import { RadioGroup, RadioGroupItem } from '../ui/ui-base/radio-group';
import { Label } from '../ui/ui-base/label';
import { Button } from '../ui/ui-base/button';
import { useWorkspaceMaterialContext } from '@/lib/hooks/context-providers/workspace-material-context';
import { Workspace } from '@/redux/slices/workspaceSlice';


type Choice = {
  content: string | undefined
  correct: boolean | undefined
}

type Identification = {
  question: string | undefined
  answer: string | undefined
}

type MultipleChoice = {
  question: string | undefined
  choices: Choice[] | undefined
}

// const Choice = z.object({
//   content: z.string(),
//   correct: z.boolean()
// })

// const Identification = z.object({
//   question: z.string(),
//   answer: z.string()
// })

// const MultipleChoice = z.object({
//   question: z.string(),
//   choices: Choice.array().length(4)
// })

type ItemType = Identification | MultipleChoice
// const ItemType = z.union([Identification, MultipleChoice])

type ItemProps = {
  num: number
  item: ItemType
}

type MultipleChoiceProps = {
  choices: Choice[] | undefined
}

const fetchFileUrls = async (workspaceId: string) => {
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
};

// REQUIREMENTS
// A quiz will be a list of items
// each item will be contained in a box
// an item can be multiple choice or identification

// Use object for quiz generation
// https://sdk.vercel.ai/docs/reference/ai-sdk-ui/use-object

interface QuizProps {
  generationDisabled: boolean
  workspace: Workspace
}

const Quiz: React.FC<QuizProps> = ({ generationDisabled, workspace }: QuizProps) => {

  const {
    loading,
    workspaces,
    selectedWorkspace,
    specifications,
    specificationsLoading,
    selectedSpecificationId,
    pages,
    updateSpecification,
    updateSpecificationName,
    updateSpecificationCount,
    addSpecification,
    deleteSpecification,
    selectSpecification,
    addLessonPage,
    selectPage,
  } = useWorkspaceMaterialContext();

  // const items: ItemType[] = []
  // const items: ItemType[] = [
  //   { question: 'What faction won in world war 2?', answer: 'Allies' },
  //   { question: 'What continent is China in?', answer: 'Asia' },
  //   { question: 'What is the tallest mountain?', answer: 'Mount Everest' },
  //   {
  //     question: 'What number comes after 68?', choices: [
  //       { content: '70', correct: false },
  //       { content: '69', correct: false },
  //       { content: '67', correct: false },
  //       { content: '420', correct: false },
  //     ]
  //   },
  //   {
  //     question: 'What number comes after 68?', choices: [
  //       { content: '70', correct: false },
  //       { content: '69', correct: false },
  //       { content: '67', correct: false },
  //       { content: '420', correct: false },
  //     ]
  //   },
  //   {
  //     question: 'What number comes after 68?', choices: [
  //       { content: '70', correct: false },
  //       { content: '69', correct: false },
  //       { content: '67', correct: false },
  //       { content: '420', correct: false },
  //     ]
  //   },
  //   {
  //     question: 'What number comes after 68?', choices: [
  //       { content: '70', correct: false },
  //       { content: '69', correct: false },
  //       { content: '67', correct: false },
  //       { content: '420', correct: false },
  //     ]
  //   },
  //   {
  //     question: 'What number comes after 68?', choices: [
  //       { content: '70', correct: false },
  //       { content: '69', correct: false },
  //       { content: '67', correct: false },
  //       { content: '420', correct: false },
  //     ]
  //   },
  // ];

  // `object` is the output object
  // `submit` is the callback function to submit the prompt
  const { object, submit } = useObject({
    api: '/api/quiz',
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
        .array(),
    }),
  })

  const [files, setFiles] = useState<FetchedFile[]>([]);
  const [fetchingFiles, setFetchingFiles] = useState(true);

  return (
    <div className={`flex flex-col gap-4 h-full items-center ${workspace.materialType === 'LESSON ' ? '' : 'justify-center'} overflow-y-scroll no-scrollbar`}>
      {object?.items?.length === 0 || !object || !object.items ? <Button disabled={generationDisabled} onClick={() => {
        workspace.specifications.map((specification: any) => {
          // TODO: Make update in the sidenav during topic change, because it only updates during page reload
          if (specification.id === selectedSpecificationId) {
            if (selectedWorkspace) {
              const spec = selectedWorkspace.specifications.find(spec => spec.id === selectedSpecificationId)
              if (spec)
                submit({ namespaceId: workspace.id, prompt: spec.topic, count: spec.count, specifications }) // * Send to AI generation (Calls NextJS backend)
            }
          }
        })

      }}>Generate</Button> : object?.items?.map((item, index) => {
        // convert from zod to type
        // check what type
        // assign depending on the type
        if (!item)
          return null
        if ('answer' in item) {
          return < Item num={index + 1} item={{ question: item?.question, answer: item?.answer, }} />
        } else if ('choices' in item) {
          if (!item.choices)
            return null
          return < Item num={index + 1} item={{
            question: item?.question, choices: [
              { content: item?.choices[0]?.content, correct: item?.choices[0]?.correct },
              { content: item?.choices[1]?.content, correct: item?.choices[1]?.correct },
              { content: item?.choices[2]?.content, correct: item?.choices[2]?.correct },
              { content: item?.choices[3]?.content, correct: item?.choices[3]?.correct },
            ]
          }} />
        }

        return null
      })
      }
      {/* return < Item num={index + 1} item={{ question: item?.question, answer: item?.answer, }}} />)} */}
      {/* {object?.content && <p>{object.content}</p>} */}
    </div >
  )
  // For testing dummy data
  // return (
  //   <div className='flex flex-col gap-4 h-full items-center overflow-y-scroll no-scrollbar'>
  //     {items.length === 0 ? <Button disabled={generationDisabled} onClick={() => {
  //       workspace.specifications.map(specification => {
  //         // TODO: Make update in the sidenav during topic change, because it only updates during page reload
  //         if (specification.id === selectedSpecificationId)
  //           submit({ namespaceId: workspace.id, prompt: specification.topic, count: specification.numItems }) // * Send to AI generation
  //       })
  //     }}>Generate</Button> : items.map((item, index) => {
  //       // convert from zod to type
  //       // check what type
  //       // assign depending on the type
  //       if (!item)
  //         return null
  //       if ('answer' in item) {
  //         return < Item num={index + 1} item={{ question: item.question, answer: item.answer, }} />
  //       } else if ('choices' in item) {
  //         if (!item.choices)
  //           return null
  //         return < Item num={index + 1} item={{
  //           question: item.question, choices: [
  //             { content: item.choices[0].content, correct: item.choices[0].correct },
  //             { content: item.choices[1].content, correct: item.choices[1].correct },
  //             { content: item.choices[2].content, correct: item.choices[2].correct },
  //             { content: item.choices[3].content, correct: item.choices[3].correct },
  //           ]
  //         }} />
  //       }

  //       return null
  //     })}
  //     {/* return < Item num={index + 1} item={{ question: item?.question, answer: item?.answer, }}} />)} */}
  //     {/* {object?.content && <p>{object.content}</p>} */}
  //   </div>
  // )
}

export const Item = ({ num, item }: ItemProps) => {

  return (
    // <Card className='p-4 w-96'>
    <Card className='p-4 w-[1000px]'>
      <div>
        {num}.
      </div>
      <div className='p-4'>
        {item.question}
      </div>
      <div className='p-4'>
        {'answer' in item ? <Input /> : <MultipleChoiceCard choices={item.choices} />}
      </div>
    </Card>
  )
}

const MultipleChoiceCard = ({ choices }: MultipleChoiceProps) => {

  return (
    <RadioGroup>
      {choices?.map((choice, index) => (
        <div className='flex gap-2' key={index}>
          <RadioGroupItem value={choice.content ?? ''} id={choice.content} />
          <Label htmlFor={choice.content}>{choice.content}</Label>
        </div>
      ))}
    </RadioGroup >
  )
}

export default Quiz