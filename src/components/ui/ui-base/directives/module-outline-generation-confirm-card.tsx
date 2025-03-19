import React, { FC, memo } from 'react';
import { Button } from '@mui/material';
import { useSocket } from '@/lib/hooks/useServerEvents';
import { useWorkspaceContext } from '@/lib/hooks/context-providers/workspace-context';
import { useUserContext } from '@/lib/hooks/context-providers/user-context';
import store from '@/redux/store';
import { updateChatLoadingStatus } from '@/redux/slices/workspaceSlice';

interface ModuleOutlineGenerationConfirmCardProps {
  assistantMessageId: string;
  subject: string;
  context_instructions: string;
}

// #region Module Outline Generation Confirm Card
// eslint-disable-next-line react/display-name
const ModuleOutlineGenerationConfirmCard: FC<ModuleOutlineGenerationConfirmCardProps> = memo(({ assistantMessageId, subject, context_instructions }) => {
  const { socket } = useSocket();
  const { selectedWorkspace, chatLoading } = useWorkspaceContext();
  const { user } = useUserContext();

  // Determine if the assistantMessageId is the latest message in chatHistory
  const latestMessageId = selectedWorkspace?.chatHistory[selectedWorkspace.chatHistory.length - 1]?.id;
  const isLatestMessage = assistantMessageId === latestMessageId;
  const hasTokens = user && user.tokens > 0;

  const handleGenerateDirectly = () => {
    if (isLatestMessage) {
      store.dispatch(updateChatLoadingStatus(true));
      socket.emit('module-outline-generation', false, selectedWorkspace?.id, subject, context_instructions);
      console.log(subject, context_instructions);
    }
  };

  const handleGenerateOutline = () => {
    if (isLatestMessage) {
      store.dispatch(updateChatLoadingStatus(true));
      socket.emit('module-outline-generation', true, selectedWorkspace?.id, subject, context_instructions);
      console.log(subject, context_instructions);
    }
  };

  // #region JSX
  return (
    <div className="w-full h-fit rounded bg-transparent">
      <div className="flex justify-between items-center bg-gray-100 rounded">
        <span className="font-bold">Module Outline Generation</span>
      </div>
      <div className="flex justify-end items-center rounded mt-2">
        <Button 
          onClick={handleGenerateDirectly} 
          sx={{ mr: 2, border: 1, borderColor: '#d1d5db', color: (isLatestMessage && hasTokens) ? '#2f2f2f' : '#d1d5db',
            '&.Mui-disabled': {
            borderColor: '#d1d5db',
            color: '#d1d5db',
            },
            ':hover': {
            borderColor: '#5E77D3',
            color: '#5E77D3',
            },
          }}
          disabled={!isLatestMessage || !hasTokens}
        >
          Generate Module Directly
        </Button>
        <Button 
          onClick={handleGenerateOutline} 
          sx={{ border: 1, borderColor: '#d1d5db', color: (isLatestMessage && hasTokens) ? '#2f2f2f' : '#d1d5db',
            '&.Mui-disabled': {
            borderColor: '#d1d5db',
            color: '#d1d5db',
            },
            ':hover': {
            borderColor: '#5E77D3',
            color: '#5E77D3',
            },
          }}
          disabled={!isLatestMessage || !hasTokens}
        >
          Generate Module Outline
        </Button>
      </div>
    </div> 
  );
});

export default ModuleOutlineGenerationConfirmCard;
