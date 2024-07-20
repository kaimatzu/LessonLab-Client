import { useState } from 'react'

// NOTE(hans): Update Vercel AI SDK to use `useObject` hook
import { experimental_useObject as useObject } from 'ai/react'
import { z } from 'zod';
import { FetchedFile } from '@/app/api/files/route';
import { Card } from '../ui/ui-base/card';

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
      <button onClick={() => submit('example input')}>Generate</button>
      <Item />
      {/* {object?.content && <p>{object.content}</p>} */}
    </div>
  )
}

const Item = () => {

  return (
    <Card className='p-4'>
      <div>
        Question part over here
      </div>
    </Card>
  )

}

export default Quiz