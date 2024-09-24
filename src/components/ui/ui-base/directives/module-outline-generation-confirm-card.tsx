import React, { FC, memo } from 'react';
import { Button } from '@mui/material';
import { useSocket } from '@/lib/hooks/useServerEvents';
import { useWorkspaceContext } from '@/lib/hooks/context-providers/workspace-context';
import store from '@/redux/store';
import { updateChatLoadingStatus } from '@/redux/slices/workspaceSlice';

interface ModuleOutlineGenerationConfirmCardProps {
  assistantMessageId: string;
  subject: string;
  context_instructions: string;
}

// #region Module Outline Generation Confirm Card
const ModuleOutlineGenerationConfirmCard: FC<ModuleOutlineGenerationConfirmCardProps> = memo(({ assistantMessageId, subject, context_instructions }) => {
  const { socket } = useSocket();
  const { selectedWorkspace, chatLoading } = useWorkspaceContext();

  // Determine if the assistantMessageId is the latest message in chatHistory
  const latestMessageId = selectedWorkspace?.chatHistory[selectedWorkspace.chatHistory.length - 1]?.id;
  const isLatestMessage = assistantMessageId === latestMessageId;

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
    <div className="w-full h-fit border border-gray-300 rounded p-2 bg-transparent">
      <div className="flex justify-between items-center bg-gray-100 p-2 rounded">
        <span className="font-bold">Module Outline Generation</span>
      </div>
      <div className="flex justify-end items-center bg-gray-200 p-2 rounded mt-2">
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleGenerateDirectly} 
          sx={{ mr: 2, bgcolor: isLatestMessage ? 'blue.500' : 'blue.700' }}
          disabled={!isLatestMessage}
        >
          Generate Module Directly
        </Button>
        <Button 
          variant="contained" 
          color="success" 
          onClick={handleGenerateOutline} 
          sx={{ bgcolor: isLatestMessage ? 'green.500' : 'green.700' }}
          disabled={!isLatestMessage}
        >
          Generate Module Outline
        </Button>
      </div>
    </div> 
  );
});

export default ModuleOutlineGenerationConfirmCard;
