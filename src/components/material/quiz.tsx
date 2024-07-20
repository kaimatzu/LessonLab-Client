import { useState } from 'react'

// NOTE(hans): Update Vercel AI SDK to use `useObject` hook
import { experimental_useObject as useObject } from 'ai/react'
import { z } from 'zod';
import { FetchedFile } from '@/app/api/files/route';
import { Card } from '../ui/ui-base/card';
import { Input } from '../ui/ui-base/input';
import { RadioGroup, RadioGroupItem } from '../ui/ui-base/radio-group';
import { Label } from '../ui/ui-base/label';
import { Button } from '../ui/ui-base/button';

type Choice = {
  content: string
  correct: boolean
}

type Identification = {
  question: string
  answer: string
}

type MultipleChoice = {
  question: string
  choices: Choice[]
}

type ItemType = Identification | MultipleChoice

type ItemProps = {
  num: number
  item: ItemType
}

type MultipleChoiceProps = {
  choices: Choice[]
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
const Quiz = () => {

  // const items: ItemType[] = []
  const items: ItemType[] = [
    { question: 'What faction won in world war 2?', answer: 'Allies' },
    { question: 'What continent is China in?', answer: 'Asia' },
    { question: 'What is the tallest mountain?', answer: 'Mount Everest' },
    {
      question: 'What is the number after 68?', choices: [
        { content: '70', correct: false },
        { content: '69', correct: false },
        { content: '67', correct: false },
        { content: '420', correct: false },
      ]
    },
  ];

  // `object` is the output object
  // `submit` is the callback function to submit the prompt
  const { object, submit } = useObject({
    api: '/api/quiz',
    schema: z.object({ content: z.string() })
  })

  const [files, setFiles] = useState<FetchedFile[]>([]);
  const [fetchingFiles, setFetchingFiles] = useState(true);

  return (
    <div className='flex flex-col gap-4'>
      {items.length === 0 ? <Button onClick={() => submit('example input')}>Generate</Button> : items.map((item, index) => <Item num={index + 1} item={item} />)}
      {/* {object?.content && <p>{object.content}</p>} */}
    </div>
  )
}

const Item = ({ num, item }: ItemProps) => {

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
        {'answer' in item ? <Input /> : <MultipleChoice choices={item.choices} />}
      </div>
    </Card>
  )
}

const MultipleChoice = ({ choices }: MultipleChoiceProps) => {

  return (
    <RadioGroup>
      {choices.map((choice, index) => (
        <div className='flex gap-2' key={index}>
          <RadioGroupItem value={choice.content} id={choice.content} />
          <Label htmlFor={choice.content}>{choice.content}</Label>
        </div>
      ))}
    </RadioGroup >
  )
}

export default Quiz