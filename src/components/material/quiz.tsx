import { useState } from 'react'

// NOTE(hans): Update Vercel AI SDK to use `useObject` hook
import { experimental_useObject as useObject } from 'ai/react'
import { z } from 'zod';
import { FetchedFile } from '@/app/api/files/route';
import { Card } from '../ui/ui-base/card';
import { Input } from '../ui/ui-base/input';
import { Button } from '../ui/ui-base/button';

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

  // `object` is the output object
  // `submit` is the callback function to submit the prompt
  const { object, submit } = useObject({
    api: '/api/quiz',
    schema: z.object({ content: z.string() })
  })

  const [files, setFiles] = useState<FetchedFile[]>([]);
  const [fetchingFiles, setFetchingFiles] = useState(true);

  return (
    <div>
      {/* <Button onClick={() => submit('example input')}>Generate</Button> */}
      <Item num={1} />
      {/* {object?.content && <p>{object.content}</p>} */}
    </div>
  )
}

interface Choice {
  content: string
  correct: boolean
}

interface Identification {
  question: string
  answer: string
}

interface MultipleChoice {
  question: string
  choices: Choice[]
}

type ItemType = Identification | MultipleChoice

interface ItemProps {
  item: ItemType
}

interface Props {
  num: number
}

// const Item = ({ item }: ItemProps) => {
const Item = ({ num }: Props) => {

  const [type, setType] = useState('identification')

  return (
    // <Card className='p-4 w-96'>
    <Card className='p-4 w-[1000px]'>
      <div>
        {num}.
      </div>
      <div className='p-4'>
        Whos your daddy?
      </div>
      {/* TODO: Render conditionally here Either identification or multiple choice VVV */}
      <div className='p-4'>
        {type === 'identification' ? (<Input />) : (null)}  {/* TODO: Replace null with multiple choice */}
      </div>
    </Card>

  )

}

// This function finds out if the item type is identification or not
function isIdentification(item: ItemType): item is Identification {
  return (item as Identification).answer !== undefined
}

export default Quiz