// workspace.tsx where the upload call is made

"use client";

import { ChatMessage } from "./chat-message";
import UploadButton from "@/components/ui/ui-base/chat/upload-button";
import { useWorkspaceContext } from "@/lib/hooks/context-providers/workspace-context";
import { PromptGrid } from "@/components/ui/ui-base/chat/prompt-grid";
import React, {
  ChangeEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { Tooltip } from "@/components/ui/ui-base/chat/tooltip";
import { FetchedFile } from "@/app/api/files/route";
import { Specification, Workspace } from "@/lib/types/workspace-types";
import { useSocket } from "@/lib/hooks/useServerEvents";
import { Message } from '@/lib/types/workspace-types';
import { useUserContext } from "@/lib/hooks/context-providers/user-context";

interface ChatProps {
  workspace: Workspace;
  fetchingFiles: boolean;
  files: FetchedFile[];
  fetchFiles: () => Promise<void>;
  handleDeleteFile: (documentId: string) => Promise<void>;
}

export const Chat: React.FC<ChatProps> = ({
  workspace,
  fetchingFiles,
  files,
  fetchFiles,
  handleDeleteFile,
}) => {
  const [input, setInput] = useState<string>("");
  
  const {
    specifications,
    selectedSpecificationId,
    selectedWorkspace,
    chatLoading,
    chatHistory,
    updateChatStatus,
  } = useWorkspaceContext();

  const { user } = useUserContext();

  const { sendMessageToAssistant } = useSocket();

  const getCurrentSpecifications = (): Specification | {} => {
    const specToLoad = selectedSpecificationId
      ? specifications.find(spec => spec.id === selectedSpecificationId)
      : specifications[0];

    return specToLoad ? specToLoad : {};
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  }

  const handleChatSubmit = (event?: {
    preventDefault?: () => void;
  }) => {
    console.log("Submit prompt to server: ", input);
    updateChatStatus(true);
    if (selectedWorkspace) {
      sendMessageToAssistant(input, user?.userId!, selectedWorkspace.id, selectedWorkspace.chatHistory);
    } else {
      console.error("Not connected to workspace!");
    }
    setInput("");
  }

  // setPrompts is unused in this example, but imagine generating prompts based on the workspace content... :-)
  const [prompts, setPrompts] = useState<Prompt[]>([
    {
      id: "1",
      name: `Tell me about the content in the \"${workspace.name}\" workspace`,
      description: "",
      content: `Tell me about the content in the \"${workspace.name}\" workspace`,
      folderId: null,
    },
    {
      id: "2",
      name: `Give me some quotes about \"${workspace.name}\" from the content.`,
      description: "",
      content: `Give me some quotes about \"${workspace.name}\" from the content.`,
      folderId: null,
    },
    {
      id: "3",
      name: `Write me an essay about \"${workspace.name}\" from the content.`,
      description: "",
      content: `Write me an essay about \"${workspace.name}\" from the content.`,
      folderId: null,
    },
    {
      id: "4",
      name: `Tell me something I might not know about \"${workspace.name}\"`,
      description: "",
      content: `Tell me something I might not know about \"${workspace.name}\"`,
      folderId: null,
    },
  ]);

  const [activePromptIndex, setActivePromptIndex] = useState<number>(0);
  const promptListRef = useRef<HTMLDivElement | null>(null);

  const [shouldSubmit, setShouldSubmit] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // For submitting prompt by pressing on one of the prompts in the prompt grid
  const handlePromptSubmit = (prompt: Prompt) => {
    handleInputChange({
      target: { value: prompt.content },
    } as ChangeEvent<HTMLInputElement>);
    setShouldSubmit(true);
  };

  const [documentTrayIsOpen, setDocumentTrayIsOpen] = useState(false);

  const toggleOpen = () => {
    setDocumentTrayIsOpen(!documentTrayIsOpen);
  };

  // Side effect for when `handlePromptSubmit` is called. This should do a submit event like activating the onSubmit callback
  useEffect(() => {
    if (shouldSubmit) {
      const form = document.querySelector("form");
      if (form) {
        form.dispatchEvent(new Event("submit", { cancelable: true }));
        form.requestSubmit();
        setShouldSubmit(false);
      }
    }
  }, [shouldSubmit]);

  useEffect(() => {
    if (documentTrayIsOpen) {
      fetchFiles();
    }
  }, [documentTrayIsOpen, fetchFiles]);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Chat history section */}
      <div className="flex-grow overflow-y-auto overflow-x-hidden p-4"> 
        {chatHistory.length > 0 ? (
          <>
            {chatHistory.map((m: Message) => (
              <div key={m.id} className="whitespace-pre-wrap w-full">
                <ChatMessage key={m.id} message={m} />
              </div>
            ))}
            {chatLoading && (
              <div className="animate-pulse bg-gray-500 dark:bg-zinc-500 h-4 w-4 rotate-45 rounded-sm"></div>
            )}
            <div className={documentTrayIsOpen ? "h-[70%]" : "h-1/3"}></div>
            <div ref={bottomRef} />
          </>
        ) : (
          <div className="relative flex flex-col items-center justify-center h-full">
            {!fetchingFiles && (files.length > 0 ? (
              <PromptGrid
                prompts={prompts}
                activePromptIndex={activePromptIndex}
                onMouseOver={(index: number) => setActivePromptIndex(index)}
                promptListRef={promptListRef}
                handleSubmit={handlePromptSubmit}
              />
            ) : (
              <div className="text-gray-500 dark:text-zinc-500 text-sm">
                {workspace.name === "Empty Workspace"
                  ? 'This is an example workspace with no uploaded documents for context. Try ask a question about "Richard Feynman" or any other workspace.'
                  : "No documents in this workspace... upload below!"}
              </div>
            ))}
          </div>
        )}
      </div>
  
      {/* Chat form section */}
      <form
        onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleChatSubmit(e)}
        className="w-full bg-white dark:bg-gray-800 pb-8 px-8 box-border"
      >
        {/* Prompt area */}
        <div className="flex flex-row items-center h-fit">
          <textarea
            className={
              "p-4 px-5 bg-[#E6EEF3] text-foreground focus:outline-none rounded-md flex-grow mr-4 overflow-y-auto resize-none box-border" +
              (chatLoading ? "cursor-not-allowed" : "cursor-text")
            }
            value={input}
            placeholder={chatLoading ? "Responding..." : "Message Assistant"}
            disabled={chatLoading}
            onChange={handleInputChange}
            onKeyDown={(e: any) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault(); // prevents from going to new line
                handleChatSubmit(e); // instead submit the prompt
              }
            }}
            rows={1}
            style={{
              height: "auto",
              maxHeight: "30vh",
              overflow: "auto",
              scrollbarColor: "transparent transparent",
            }}
            ref={(textarea) => {
              if (textarea) {
                textarea.style.height = "auto";
                textarea.style.height = `${Math.min(textarea.scrollHeight, window.innerHeight * 0.3)}px`;
                if (!isFocused) {
                  textarea.focus();
                  setIsFocused(true);
                }
              }
            }}
          />
          <div className="flex-shrink-0 relative">
            <Tooltip
              text={workspace.locked ? "Read-Only Workspace" : "Add PDF documents (do not upload private files)"}
              position="top"
            >
              <UploadButton
                workspaceId={workspace.id}
                uploadCompletionCallback={fetchFiles}
                locked={workspace.locked ?? false}
              />
            </Tooltip>
          </div>
        </div>
      </form>
    </div>
  );
};

/**
 * Extracts the documentId from a given file URL.
 * Assumes the URL pattern is:
 * https://domain/[namespaceId]/[documentId]/[filename]
 *
 * @param fileUrl - The URL of the file from which to extract the documentId.
 * @returns The extracted documentId or an empty string if the URL is invalid.
 */
export function getDocumentIdFromFileUrl(fileUrl: string): string {
  try {
    // Parsing the URL to get the pathname
    const url = new URL(fileUrl);
    const pathSegments = url.pathname
      .split("/")
      .filter((part) => part.trim() !== "");

    // Assuming the documentId is always the second segment in the path
    const documentId = pathSegments[1]; // 0: namespaceId, 1: documentId, 2: filename
    return documentId;
  } catch (error) {
    console.error("Error extracting documentId from URL:", error);
    return "";
  }
}
