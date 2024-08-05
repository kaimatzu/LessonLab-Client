'use client'
import React, { useState } from 'react'

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
import { FaCheck, FaXmark } from 'react-icons/fa6';

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
  isChecked: boolean
}

type MultipleChoiceProps = {
  choices: Choice[] | undefined
  disabled: boolean
  onChange: (value: string) => void
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

  const [isGenerated, setIsGenerated] = useState<boolean>(false)
  const [isChecked, setIsChecked] = useState<boolean>(false)
  // const [files, setFiles] = useState<FetchedFile[]>([])
  // const [fetchingFiles, setFetchingFiles] = useState(true)

  // const items: ItemType[] = []
  // const items: ItemType[] = [
  //   { question: 'Which side won in World War II?', answer: 'Allies' },
  //   { question: 'Which side lost in World War II?', answer: 'Axis' },
  //   { question: 'What continent is China in?', answer: 'Asia' },
  //   { question: 'What is the largest ocean?', answer: 'Pacific' },
  //   { question: 'What is the tallest mountain?', answer: 'Everest' },
  //   {
  //     question: 'What number comes after 68?', choices: [
  //       { content: '70', correct: false },
  //       { content: '69', correct: true },
  //       { content: '67', correct: false },
  //       { content: '420', correct: false },
  //     ]
  //   },
  //   {
  //     question: 'What number comes after 68?', choices: [
  //       { content: '70', correct: false },
  //       { content: '69', correct: true },
  //       { content: '67', correct: false },
  //       { content: '420', correct: false },
  //     ]
  //   },
  //   {
  //     question: 'What number comes after 68?', choices: [
  //       { content: '70', correct: false },
  //       { content: '69', correct: true },
  //       { content: '67', correct: false },
  //       { content: '420', correct: false },
  //     ]
  //   },
  //   {
  //     question: 'What number comes after 68?', choices: [
  //       { content: '70', correct: false },
  //       { content: '69', correct: true },
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

  // TODO: Make update in the sidenav during topic change, because it only updates during page reload
  return (
    <div className={`flex flex-col gap-4 h-full items-center ${workspace.materialType === 'LESSON' ? '' : `${object ? `justify-start` : `justify-center`}`} overflow-y-scroll no-scrollbar text-black`}>
      {object?.items?.length === 0 || !object || !object.items ? <Button className='text-black' disabled={generationDisabled} onClick={() => {
        workspace.specifications.map(specification => {
          // TODO: Make update in the sidenav-material during topic change, because it only updates during page reload
          if (specification.id === selectedSpecificationId) {
            if (selectedWorkspace) {
              const spec = selectedWorkspace.specifications.find(spec => spec.id === selectedSpecificationId)
              if (spec)
                submit({ namespaceId: workspace.id, prompt: spec.topic, count: spec.count, specifications }) // * Send to AI generation (Calls NextJS backend)
            }
          }
        })
        setIsGenerated(true)
      }}>Generate</Button> :
        <div className='flex flex-col gap-4 h-full items-center overflow-y-scroll no-scrollbar text-black'>
          {object?.items?.map((item: any, index: number) => {
            if (!item)
              return null
            if ('answer' in item) {
              return < Item num={index + 1} isChecked={isChecked} item={{ question: item.question, answer: item.answer, }} />
            } else if ('choices' in item) {
              if (!item.choices)
                return null
              return < Item num={index + 1} isChecked={isChecked} item={{
                question: item.question, choices: [
                  { content: item?.choices[0]?.content, correct: item?.choices[0]?.correct },
                  { content: item?.choices[1]?.content, correct: item?.choices[1]?.correct },
                  { content: item?.choices[2]?.content, correct: item?.choices[2]?.correct },
                  { content: item?.choices[3]?.content, correct: item?.choices[3]?.correct },
                ]
              }} />
            }
            return null
          })}
          {isChecked ? (null) : (
            <Button className='mt-10 text-black' onClick={() => {
              if (!isChecked && isGenerated)
                setIsChecked(true)
            }}>Check</Button>
          )}
          <div className='pb-40' /> {/* For bottom margin so that when scrolling down to the end the last item goes up to the middle */}
        </div>
      }
    </div >
  )
}

export const Item: React.FC<ItemProps> = ({ num, item, isChecked }) => {
  const [answer, setAnswer] = useState<string>('')

  const handleInputChange = (value: string) => {
    console.log('User input: ', value)
    setAnswer(value)
  }

  return (
    // <Card className='p-4 w-96'>
    <Card className='p-4 w-full'>
      <div>
        {num}.
      </div>
      <div className='p-4'>
        {item.question}
      </div>
      <div className='p-4'>
        {'answer' in item ? (
          <Input
            disabled={isChecked}
            onChange={(e) => { handleInputChange(e.currentTarget.value) }}
          />
        ) : (
          <MultipleChoiceCard
            choices={item.choices}
            disabled={isChecked}
            onChange={handleInputChange} />
        )}
      </div>
      {isChecked ? (
        <div className='p-4'>
          <div className='p-2 border border-border rounded-md inline-block'>
            {'answer' in item ? (
              item.answer === answer ? (<FaCheck className='text-green-500' />) : (<FaXmark className='text-red-500' />)
            ) : (
              <>{answer === item?.choices?.find((choice) => choice.correct === true)?.content ? (
                <FaCheck className='text-green-500' />
              ) : (
                <FaXmark className='text-red-500' />
              )}</>
            )}
          </div>
        </div>
      ) : (null)}
    </Card>
  )
}

const MultipleChoiceCard: React.FC<MultipleChoiceProps> = ({ choices, disabled, onChange }) => {
  return (
    <RadioGroup onValueChange={onChange}>
      {choices?.map((choice, index) => (
        <div className='flex gap-2' key={index}>
          <RadioGroupItem value={choice.content ?? ''} id={choice.content} disabled={disabled} />
          <Label htmlFor={choice.content}>{choice.content}</Label>
        </div>
      ))}
    </RadioGroup >
  )
}

export default Quiz