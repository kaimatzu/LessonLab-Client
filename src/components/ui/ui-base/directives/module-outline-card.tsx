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
import { PATCH as _updateChatMessage } from '@/app/api/chat/route';
import RequestBuilder from '@/lib/hooks/builders/request-builder';
import CheckIcon from '@mui/icons-material/Check';
import { SlRefresh } from "react-icons/sl";
import { RiDeleteBinLine } from "react-icons/ri";

interface ModuleOutlineCardProps {
  moduleId: string;
  assistantMessageId: string;
  subject: string;
  context_instructions: string;
  children: React.ReactNode;
}

// #region Module Outline Card
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
            
            const requestBuilder = new RequestBuilder()
              .setBody(JSON.stringify({ messageId: assistantMessageId, newContent: newContent}));

            _updateChatMessage(requestBuilder);

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
    socket.emit('confirm-module-outline-response', "cancel", selectedWorkspace?.id, moduleId, null, subject, context_instructions);
  };

  const handleSubmit = () => {
    console.log("Submit clicked");
    socket.emit('confirm-module-outline-response', "submit", selectedWorkspace?.id, moduleId, treeFormat, subject, context_instructions);
  };

  // #region JSX
  return (
    <div className="w-full h-fit rounded bg-transparent">
      <div className="flex justify-between items-center bg-gray-100 rounded">
        {treeFormat ? treeFormat.name : (
          <span className="loading-text">Creating Module Outline</span>
        )}
        {renderStatusIcon()}
      </div>
      <div className="mt-2">
        {treeFormat && <ModuleTree treeFormat={treeFormat} />}
      </div>
      <div className="flex justify-end items-center rounded pt-4 my-2 border-t border-gray-300">
        <Button 
          onClick={handleSubmit} 
          disabled={!treeFormat || !isLatestMessage} 
          startIcon={<CheckIcon/>}
          sx={{ mr: 2, border: 1, borderColor: '#d1d5db', color: !treeFormat || !isLatestMessage ? '#d1d5db' : '#2f2f2f',
            '&.Mui-disabled': {
            borderColor: '#d1d5db',
            color: '#d1d5db',
            },
            ':hover': {
            borderColor: '#5E77D3',
            color: '#5E77D3',
            },
           }}
        >
          Submit
        </Button>
        <Button 
          onClick={handleRegenerate} 
          disabled={!treeFormat || !isLatestMessage}
          startIcon={<SlRefresh/>}
          sx={{ mr: 2, color: !treeFormat || !isLatestMessage ? '#d1d5db' : '#2f2f2f',
            '&.Mui-disabled': {
            borderColor: '#d1d5db',
            color: '#d1d5db',
            },
            ':hover': {
            backgroundColor: '#E2E4EA',
            },
           }}
        >
          Regenerate
        </Button>
        <Button 
          onClick={handleDiscard} 
          disabled={!treeFormat || !isLatestMessage}
          startIcon={<RiDeleteBinLine/>}
          sx={{ color: !treeFormat || !isLatestMessage ? '#d1d5db' : 'red',
            '&.Mui-disabled': {
            color: '#d1d5db',
            },
            ':hover': {
            backgroundColor: '#E2E4EA',
            },
           }}
        >
          Discard
        </Button>
      </div>
    </div> 
  );
});

export default ModuleOutlineCard;
