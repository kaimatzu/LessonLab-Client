'use client'
import React, { useEffect, useRef, useState } from 'react'

import { experimental_useObject as useObject } from 'ai/react'
import { FetchedFile } from '@/app/api/files/route';
import { Card } from '../ui/ui-base/card';
import { Input } from '../ui/ui-base/input';
import { RadioGroup, RadioGroupItem } from '../ui/ui-base/radio-group';
import { Label } from '../ui/ui-base/label';
import { Button } from '../ui/ui-base/button';
import { useWorkspaceMaterialContext } from '@/lib/hooks/context-providers/workspace-material-context';
import { Workspace } from '@/redux/slices/workspaceSlice';
import { FaCheck, FaXmark } from 'react-icons/fa6';
import RequestBuilder from '@/lib/hooks/builders/request-builder';
import Overlay from '../ui/ui-base/overlay';
import { ANSWER_FIELD } from '@/lib/globals';
import { GeneratedQuizSchema, mapGeneratedQuizToItemType, objectArrayToGiftFormat } from '@/lib/utils';
import { toast } from '../ui/ui-base/use-toast';
import { Switch } from '../ui/ui-base/switch';

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

interface QuizProps {
  generationDisabled: boolean
  workspace: Workspace
}

// Use object for quiz generation
// https://sdk.vercel.ai/docs/reference/ai-sdk-ui/use-object
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

  // TODO: Make a condition to check if quiz is generated then change state based on that
  const [isGenerated, setIsGenerated] = useState<boolean>(true)
  const [checked, setChecked] = useState<boolean>(false)
  const [exportQuizFileName, setExportQuizFileName] = useState<string>('')
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false)
  const [editMode, setEditMode] = useState<boolean>(false)

  // `object` is the output object
  // `submit` is the callback function to submit the prompt
  const { object, submit } = useObject({
    api: '/api/quiz',
    schema: GeneratedQuizSchema,
  })

  const [items, setItems] = useState<ItemType[]>([])
  // const [items, setItems] = useState<ItemType[]>([
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
  //     question: 'Which planet is known as the Red Planet?', choices: [
  //       { content: 'Earth', correct: false },
  //       { content: 'Mars', correct: true },
  //       { content: 'Jupiter', correct: false },
  //       { content: 'Saturn', correct: false },
  //     ]
  //   },
  //   {
  //     question: 'Who painted the Mona Lisa?', choices: [
  //       { content: 'Vincent van Gogh', correct: false },
  //       { content: 'Claude Monet', correct: false },
  //       { content: 'Leonardo da Vinci', correct: true },
  //       { content: 'Pablo Picasso', correct: false },
  //     ]
  //   },
  //   {
  //     question: 'What is the powerhouse of the cell?', choices: [
  //       { content: 'Nucleus', correct: false },
  //       { content: 'Mitochondrion', correct: true },
  //       { content: 'Ribosome', correct: false },
  //       { content: 'Golgi apparatus', correct: false },
  //     ]
  //   },
  // ])

  // NOTE: items not changing
  useEffect(() => {
    console.log('items: ', items)
  }, [items])

  useEffect(() => {
    console.log('object: ', object)
    const mappedObject = mapGeneratedQuizToItemType(object)
    mappedObject ? setItems(mappedObject) : console.log('do nothing')
  }, [object])

  //------------------------//
  // Edit quiz items
  //------------------------//

  const handleEditQuestion = (index: number, value: string) => {
    setItems([
      ...items.slice(0, index),
      {
        ...items[index],
        question: value
      },
      ...items.slice(index + 1)
    ])
  }

  const handleEditAnswer = (index: number, value: string) => {
    setItems([
      ...items.slice(0, index),
      {
        ...items[index],
        answer: value
      },
      ...items.slice(index + 1)
    ])
  }

  const handleEditChoice = (index: number, choiceIndex: number, value: Choice[]) => {
    setItems([
      ...items.slice(0, index),
      {
        ...items[index],
        choices: value
      },
      ...items.slice(index + 1)
    ])
  }

  // Link GIFT format
  // https://docs.moodle.org/404/en/GIFT_format#General_instructions
  const handleExportQuiz = async () => {
    // TODO: Get the object
    // TODO: Optimize this later
    // if (!items) {
    if (!object || !object?.items) {
      toast({
        title: 'Null error',
        description: 'Quiz not generated',
        variant: 'destructive',
      })
      return
    }

    // For test data
    // const convertedItems: ItemType[] = items.map(item => {
    //   return item && ANSWER_FIELD in item ? ({
    //     question: item.question,
    //     answer: item.answer
    //   }) : ({
    //     question: item.question,
    //     choices: [
    //       { content: item.choices && item.choices[0].content, correct: item.choices && item.choices[0].correct },
    //       { content: item.choices && item.choices[1].content, correct: item.choices && item.choices[1].correct },
    //       { content: item.choices && item.choices[2].content, correct: item.choices && item.choices[2].correct },
    //       { content: item.choices && item.choices[3].content, correct: item.choices && item.choices[3].correct },
    //     ]
    //   })
    // })
    // For actual data
    const convertedItems: ItemType[] = items?.map((item: any) => {
      return item && ANSWER_FIELD in item ? ({
        question: item.question,
        answer: item.answer
      }) : ({
        question: item?.question,
        choices: [
          { content: item && item.choices[0].content, correct: item.choices && item.choices[0].correct },
          { content: item && item.choices[1].content, correct: item.choices && item.choices[1].correct },
          { content: item && item.choices[2].content, correct: item.choices && item.choices[2].correct },
          { content: item && item.choices[3].content, correct: item.choices && item.choices[3].correct },
        ]
      })
    })
    const giftFormat = objectArrayToGiftFormat(convertedItems)

    const postRequestBuilder = new RequestBuilder()
      .setURL(`http://localhost:4001/api/exports`)
      .setMethod('POST')
      .setHeaders({ 'Content-Type': 'application/json' })
      .setBody(JSON.stringify({
        filename: exportQuizFileName,
        data: giftFormat,
      }))
    await fetch(postRequestBuilder.build())

    const aTag = document.createElement("a")
    aTag.href = `http://localhost:4001/exports/${exportQuizFileName}.gift`
    aTag.setAttribute("download", exportQuizFileName + '.gift')
    document.body.appendChild(aTag)
    aTag.click()
    aTag.remove()
    setIsExportOpen(false)

    // TODO: Make a DELETE request to server to delete the export file
    // const deleteRequestBuilder = new RequestBuilder()
    //   .setURL(`http://localhost:4001/api/exports`)
    //   .setMethod('DELETE')
    //   .setHeaders({ 'Content-Type': 'application/json' })
    //   .setBody(JSON.stringify({
    //     filename: exportQuizFileName
    //   }))
    // console.log(exportQuizFileName)
    // await fetch(deleteRequestBuilder.build())
  }

  // TODO: Make update in the sidenav during topic change, because it only updates during page reload
  // TODO: Make quiz editable
  // return (
  //   <div className={`flex flex-col gap-4 h-full items-center ${workspace.materialType === 'LESSON' ? '' : `${object?.items ? `justify-start w-full px-20` : `justify-center`}`} overflow-y-scroll no-scrollbar`}>
  //     {object?.items?.length === 0 || !object?.items ? <Button disabled={generationDisabled} onClick={() => {
  //       if (selectedWorkspace) {
  //         const spec = selectedWorkspace.specifications.find(spec => spec.id === selectedSpecificationId)
  //         if (spec) {
  //           submit({ namespaceId: workspace.id, prompt: spec.topic, count: spec.count, spec }) // * Send to AI generation (Calls Client api)
  //         }
  //       }
  //       setIsGenerated(true)
  //     }}>Generate</Button> :
  //       <div className='flex flex-col gap-4 h-full w-full items-center overflow-y-scroll no-scrollbar text-black'>
  //         {object?.items?.map((item: any, index: number) => {
  //           if (!item)
  //             return null
  //           if (ANSWER_FIELD in item) {
  //             return <Item num={index + 1} isChecked={isChecked} item={{ question: item.question, answer: item.answer, }} isEditMode={isEditMode} />
  //           } else if ('choices' in item) {
  //             if (!item.choices)
  //               return null
  //             return <Item num={index + 1} isChecked={isChecked} item={{
  //               question: item.question, choices: [
  //                 { content: item?.choices[0]?.content, correct: item?.choices[0]?.correct },
  //                 { content: item?.choices[1]?.content, correct: item?.choices[1]?.correct },
  //                 { content: item?.choices[2]?.content, correct: item?.choices[2]?.correct },
  //                 { content: item?.choices[3]?.content, correct: item?.choices[3]?.correct },
  //               ]
  //             }} isEditMode={isEditMode} />
  //           }
  //           return null
  //         })}
  //         {isChecked ? (null) : (
  //           <Button className='mt-10' onClick={() => {
  //             if (!isChecked && isGenerated)
  //               setIsChecked(true)
  //           }}>Check</Button>
  //         )}
  //         {isGenerated ? (
  //           <>
  //             <Button className='mt-2' onClick={() => {
  //               setIsExportOpen(true)
  //             }}>Export</Button>
  //             <Button className='mt-2' onClick={() => {
  //               setIsEditMode(true)
  //             }}>Edit</Button>
  //           </>
  //         ) : (null)}
  //         <div className='mb-60' /> {/* For bottom margin so that when scrolling down to the end the last item goes up to the middle */}
  //       </div>
  //     }
  //     <Overlay
  //       isOpen={isExportOpen}
  //       onClose={() => { setIsExportOpen(false) }}
  //       overlayName='Export Quiz'
  //       overlayType='quizExport' >
  //       <div className='p-4'>
  //         <Label>Filename</Label>
  //         <Input className='mb-4 w-90' onChange={(e) => {
  //           setExportQuizFileName(e.currentTarget.value)
  //         }} />
  //         <Button
  //           disabled={exportQuizFileName === ''}
  //           onClick={() => {
  //             handleExportQuiz()
  //           }}>Download</Button>
  //       </div>
  //     </Overlay>
  //   </div >
  // )
  return (
    <div className={`flex flex-col gap-4 h-full items-center ${workspace.materialType === 'LESSON' ? '' : `${items ? `justify-start w-full px-20` : `justify-center`}`} overflow-y-scroll no-scrollbar`}>
      {items.length === 0 || !items ? <Button disabled={generationDisabled} onClick={() => {
        if (selectedWorkspace) {
          const spec = selectedWorkspace.specifications.find(spec => spec.id === selectedSpecificationId)
          if (spec) {
            submit({ namespaceId: workspace.id, prompt: spec.topic, count: spec.count, specification: spec }) // * Send to AI generation (Calls Client api)
          }
        }
        setIsGenerated(true)
      }}>Generate</Button> :
        <div className='flex flex-col gap-4 h-full w-full items-center overflow-y-scroll no-scrollbar text-black'>
          {items.map((item: any, index: number) => {
            if (!item)
              return null
            if (ANSWER_FIELD in item) {
              return <Item
                num={index + 1}
                checked={checked}
                editMode={editMode}
                item={{ question: item.question, answer: item.answer, }}
                onQuestionChange={handleEditQuestion}
                onAnswerChange={handleEditAnswer}
                onChoicesChange={handleEditChoice}
              />
            } else if ('choices' in item) {
              if (!item.choices)
                return null
              return <Item num={index + 1} checked={checked} editMode={editMode} item={{
                question: item.question, choices: [
                  { content: item?.choices[0]?.content, correct: item?.choices[0]?.correct },
                  { content: item?.choices[1]?.content, correct: item?.choices[1]?.correct },
                  { content: item?.choices[2]?.content, correct: item?.choices[2]?.correct },
                  { content: item?.choices[3]?.content, correct: item?.choices[3]?.correct },
                ]
              }}
                onQuestionChange={handleEditQuestion}
                onAnswerChange={handleEditAnswer}
                onChoicesChange={handleEditChoice}
              />
            }
            return null
          })}
          <div className='w-full flex justify-end gap-8'>
            {editMode || checked ? (null) : (
              <Button className='mt-10 w-24' onClick={() => {
                if (!checked && isGenerated)
                  setChecked(true)
              }}>Check</Button>
            )}
            {isGenerated ? (
              <>
                <Button className='mt-10 w-24' variant={'secondary'} onClick={() => {
                  setIsExportOpen(true)
                  console.log('Export mode: ', editMode)
                }}>Export</Button>
                <Button className='mt-10 w-24' variant={'secondary'} onClick={() => {
                  setEditMode(!editMode)
                  console.log('Edit mode: ', editMode)
                }}>{editMode ? 'Save' : 'Edit'}</Button>
              </>
            ) : (null)}
          </div>
          <div className='mb-60' /> {/* For bottom margin so that when scrolling down to the end the last item goes up to the middle */}
        </div>
      }
      <Overlay
        isOpen={isExportOpen}
        onClose={() => { setIsExportOpen(false) }}
        overlayName='Export Quiz'
        overlayType='quizExport' >
        <div className='p-4'>
          <Label>Filename</Label>
          <Input className='mb-4 w-90' onChange={(e) => {
            setExportQuizFileName(e.currentTarget.value)
          }} />
          <Button
            disabled={exportQuizFileName === ''}
            onClick={() => {
              handleExportQuiz()
            }}>Download</Button>
        </div>
      </Overlay>
    </div >
  )
}

type ItemProps = {
  num: number
  item: ItemType
  checked: boolean
  editMode: boolean
  onQuestionChange: (index: number, value: string) => void
  onAnswerChange: (index: number, value: string) => void
  onChoicesChange: (index: number, choiceIndex: number, choices: Choice[]) => void
}

export const Item: React.FC<ItemProps> = ({
  num,
  item,
  checked,
  editMode,
  onQuestionChange,
  onAnswerChange,
  onChoicesChange
}) => {
  const [answer, setAnswer] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (value: string) => {
    console.log('User input: ', value)
    setAnswer(value)
  }

  // useEffect(() => {
  //   inputRef && inputRef.current &&
  //     'answer' in item ? (
  //     item.answer = inputRef.current?.value
  //   ) : 'choices' in item ? (
  //     item.choices = inputRef.current?.value
  //   ) : ({})
  // }, [item])

  if (editMode) {
    return (
      // <Card className='p-4 w-96'>
      <Card className='p-4 w-full'>
        <div>
          {num}.
        </div>
        <div className='p-4'>
          {/* TODO: Update the question in the parent component */}
          <Input
            value={item.question}
            onChange={(e) => { onQuestionChange(num - 1, e.currentTarget.value) }}
          />
        </div>
        <div className='p-4'>
          {ANSWER_FIELD in item ? (
            <Input
              ref={inputRef}
              value={item.answer}
              // disabled={checked}
              onChange={(e) => { onAnswerChange(num - 1, e.currentTarget.value) }}
            />
          ) : (
            <EditMultipleChoice
              choices={item.choices}
              onEdit={onChoicesChange} num={num} />
          )}
        </div>
      </Card>
    )
  } else {
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
          {ANSWER_FIELD in item ? (
            <Input
              disabled={checked}
              value={answer}
              onChange={(e) => { handleInputChange(e.currentTarget.value) }}
            />
          ) : (
            <MultipleChoiceRadioGroup
              choices={item.choices}
              disabled={checked}
              onChange={handleInputChange} />
          )}
        </div>
        {checked ? (
          <div className='p-4'>
            <div className='p-2 border border-border rounded-md inline-block'>
              {ANSWER_FIELD in item ? (
                item.answer === answer ? (<FaCheck className='text-green-500' />) : (<FaXmark className='text-red-500' />)
              ) : (
                answer === item?.choices?.find((choice) => choice.correct === true)?.content ? (
                  <FaCheck className='text-green-500' />
                ) : (
                  <FaXmark className='text-red-500' />
                )
              )}
            </div>
          </div>
        ) : (null)}
      </Card>
    )
  }
}

type MultipleChoiceProps = {
  choices: Choice[] | undefined
  disabled: boolean
  onChange: (value: string) => void
}

const MultipleChoiceRadioGroup: React.FC<MultipleChoiceProps> = ({ choices, disabled, onChange }) => {
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

interface EditMultipleChoiceProps {
  num: number
  choices: Choice[] | undefined
  onEdit: (num: number, choiceIndex: number, value: Choice[]) => void
}

const EditMultipleChoice: React.FC<EditMultipleChoiceProps> = ({
  num,
  choices,
  onEdit
}) => {
  return (
    <div className='flex flex-col gap-2'>
      {choices?.map((choice, index) => (
        <div className='flex flex-row gap-4 justify-start items-center' key={index}>
          <Input
            className='w-[50%]'
            value={choice.content}
            onChange={() => onEdit(num - 1, index, choices)}
          />
          <Switch
            value={choice.content ?? ''}
            checked={choice.correct}
            onCheckedChange={() => {
              onEdit(num - 1, index, choices)
              choice.correct = !choice.correct
            }}
          />
          {choice.correct ? 'Correct' : 'Wrong'}
        </div>
      ))}
    </div>
  )
}

export default Quiz