import React, { FC, memo, useEffect, useState } from 'react';
import { CircularProgress, Button } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import './module-outline-card.css';
import ModuleTree from '../../ui-composite/module-tree/ModuleTree';
import { transformModuleOutlineToTreeFormat } from '../../ui-composite/module-tree/data-processing';
import { Module } from '../../ui-composite/module-tree/types';
import { useSocket } from '@/lib/hooks/useServerEvents';
import { useWorkspaceContext } from '@/lib/hooks/context-providers/workspace-context';
import store from '@/redux/store';
import { replaceChatMessage } from '@/redux/slices/workspaceSlice';

interface ModuleOutlineCardProps {
  moduleId: string;
  assistantMessageId: string;
  subject: string;
  context_instructions: string;
  children: React.ReactNode;
}

const ModuleOutlineCard: FC<ModuleOutlineCardProps> = memo(({ moduleId, assistantMessageId, subject, context_instructions, children }) => {
  type Status = 'In progress' | 'Done' | 'Error';
  const [status, setStatus] = useState<Status>('In progress');
  const [treeFormat, setTreeFormat] = useState<Module | null>(null); // Typed state for treeFormat

  const [initialized, setInitialized] = useState<boolean>(false);

  const { socket } = useSocket();
  const { selectedWorkspace } = useWorkspaceContext();

  // Determine if the assistantMessageId is the latest message in chatHistory
  const latestMessageId = selectedWorkspace?.chatHistory[selectedWorkspace.chatHistory.length - 1]?.id;
  const isLatestMessage = assistantMessageId === latestMessageId;

  useEffect(() => {
    if (!initialized && !children) {
      console.log("Initializing outline card...");
      console.log("Emitting module-outline-inject-content");
      socket.emit('module-outline-inject-content', selectedWorkspace?.id, assistantMessageId, moduleId, subject, context_instructions);
      attachListener();
    }

    setInitialized(true);
  }, [initialized]);

  useEffect(() => {
    if (children && React.isValidElement(children) && typeof children.props.children === 'string') {
      console.log("Children", children);
      try {
        const parsedData = JSON.parse(children.props.children);
        console.log('Parsed JSON:', parsedData);
        const treeFormatData = transformModuleOutlineToTreeFormat(parsedData);
        console.log('Tree format:', treeFormatData);
        setTreeFormat(treeFormatData[0] as Module);
        setStatus('Done');
      } catch (error) {
        console.error('Failed to parse JSON:', error);
        setStatus('Error');
      }
    }
  }, [children]);

  // TODO: detach this process from the component into an independent background process
  const attachListener = () => {
    console.log("Clearing existing listener and attaching a new one...");
  
    // Clear the existing listener before attaching a new one
    socket.removeAllListeners('module-outline-data');
  
    // Attach the new listener
    socket.once('module-outline-data', (receivedAssistantMessageId, receivedWorkspaceId, moduleId, moduleOutlineData) => {
      if (receivedAssistantMessageId === assistantMessageId && receivedWorkspaceId === selectedWorkspace?.id) {
        try {
          const targetMessage = selectedWorkspace?.chatHistory.find((msg) => msg.id === assistantMessageId);
  
          console.log("Target message:", targetMessage);
          if (targetMessage) {
            const newContent = replaceDirectiveWithContent(targetMessage.content, moduleOutlineData);
  
            console.log("New content:", newContent);
  
            store.dispatch(
              replaceChatMessage({ 
                workspaceId: selectedWorkspace?.id!, 
                id: assistantMessageId, 
                content: newContent // Update the message content in the Redux store
            }));
  
            console.log(moduleOutlineData);
            const parsedData = JSON.parse(moduleOutlineData);
            console.log('Parsed JSON:', parsedData);
            const treeFormatData = transformModuleOutlineToTreeFormat(parsedData);
            console.log('Tree format:', treeFormatData);
            setTreeFormat(treeFormatData[0] as Module);
            setStatus('Done');
          }
        } catch (error) {
          console.error('Failed to parse JSON:', error);
          setStatus('Error');
        }
      }
    });
  
    console.log("Emitting directive-ready");
    socket.emit('directive-ready', assistantMessageId, selectedWorkspace?.id);
  };
  

  const replaceDirectiveWithContent = (message: string, content: string): string => {
    const regex = new RegExp(`:::module_outline\\{[^}]*\\}([\\s\\S]*?):::`, 'g');
    return message.replace(regex, (match, p1) => {
      return match.replace(p1, `\n${content}\n`);
    });
  };
  

  const renderStatusIcon = () => {
    switch (status) {
      case 'In progress':
        return <CircularProgress size={24} />;
      case 'Done':
        return <CheckCircleIcon color="success" className="pop-in" />;
      case 'Error':
        return <ErrorIcon color="error" className="pop-in" />;
      default:
        return null;
    }
  };

  const handleRegenerate = () => {
    console.log("Regenerate clicked");
    setTreeFormat(null);
    setStatus('In progress');
    console.log("Emitting module-outline-inject-content");
    socket.emit('module-outline-inject-content', selectedWorkspace?.id, assistantMessageId, moduleId, subject, context_instructions);
    attachListener();
  };

  const handleDiscard = () => {
    console.log("Discard clicked");
    socket.emit('confirm-module-outline-response', "cancel", selectedWorkspace?.id);
  };

  const handleSubmit = () => {
    console.log("Submit clicked");
    socket.emit('confirm-module-outline-response', "submit", selectedWorkspace?.id);
  };

  return (
    <div className="w-full h-fit border border-gray-300 rounded p-2 bg-transparent">
      <div className="flex justify-between items-center bg-gray-100 p-2 rounded">
        {treeFormat ? treeFormat.name : (
          <span className="loading-text">Creating Module Outline</span>
        )}
        {renderStatusIcon()}
      </div>
      <div className="mt-2">
        {treeFormat && <ModuleTree treeFormat={treeFormat} />}
      </div>
      <div className="flex justify-end items-center bg-gray-200 p-2 rounded mt-2">
        <Button 
          variant="contained" 
          color="inherit" 
          onClick={handleRegenerate} 
          disabled={!treeFormat || !isLatestMessage} 
          sx={{ mr: 2, bgcolor: !treeFormat || !isLatestMessage ? 'grey.700' : 'grey.500' }}
        >
          Regenerate
        </Button>
        <Button 
          variant="contained" 
          color="error" 
          onClick={handleDiscard} 
          disabled={!treeFormat || !isLatestMessage} 
          sx={{ mr: 2, bgcolor: !treeFormat || !isLatestMessage ? 'red.700' : 'red.500' }}
        >
          Discard
        </Button>
        <Button 
          variant="contained" 
          color="success" 
          onClick={handleSubmit} 
          disabled={!treeFormat || !isLatestMessage} 
          sx={{ bgcolor: !treeFormat || !isLatestMessage ? 'green.700' : 'green.500' }}
        >
          Submit
        </Button>
      </div>
    </div> 
  );
});

export default ModuleOutlineCard;
