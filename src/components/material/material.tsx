// material.tsx where the upload call is made

"use client";
import { useChat } from "ai/react";
import { ChatMessage } from "./chat-message";
import UploadButton from "../ui/ui-composite/upload-button";
import { Workspace } from "@/lib/hooks/context-providers/workspace-material-context";
import { PromptGrid } from "../ui/ui-composite/prompt-grid";
import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Tooltip } from "../ui/ui-composite/tooltip";
import FileCard from "../ui/ui-base/file-card";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { FetchedFile } from "@/app/api/files/route";
import { MilkdownEditorWrapper } from "../ui/ui-composite/milkdown";
import RequestBuilder from "@/lib/hooks/builders/request-builder";
import SidenavMaterial from "../ui/ui-composite/sidenav-material";
import { Message } from "ai";
import { SkeletonLoader } from "../ui/ui-base/skeleton-loader";

const fetchFileUrls = async (workspaceId: string) => {
  try {
    // TODO: Change how this is called to use request builder
    const response = await fetch(`/api/files/?namespaceId=${workspaceId}`);
    if (!response.ok) {
      alert("Failed to fetch files response not ok");
      throw new Error("Failed to fetch file URLs");
    }
    const files: FetchedFile[] = await response.json();
    return files;
  } catch (error) {
    alert("Failed to fetch files error");
    console.error("Error fetching file URLs:", error);
    return [];
  }
};

export default function Material({ workspace }: { workspace: Workspace }) {
  const [files, setFiles] = useState<FetchedFile[]>([]);
  const [fetchingFiles, setFetchingFiles] = useState(true);
  const [materialType, setMaterialType] = useState("LESSON"); // either 'quiz' or 'lesson' sets either quiz or lesson generation

  // TODO: Change how this is called to use request builder
  const handleDeleteFile = async (documentId: string) => {
    console.log(
      `/api/files/?documentId=${documentId}&namespaceId=${workspace.id}`
    );
    try {
      const response = await fetch(
        `/api/files/?documentId=${documentId}&namespaceId=${workspace.id}`,
        {
          method: "DELETE",
        }
      );
      const responseData = await response.json();
      console.log(responseData.message);
      fetchFiles();
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const fetchFiles = useCallback(async () => {
    setFetchingFiles(true);
    const files = await fetchFileUrls(workspace.id);
    setFiles(files);
    setFetchingFiles(false);
  }, [workspace.id]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const [viewMode, setViewMode] = useState("markdown"); // 'chat' or 'markdown'

  // TODO: Get from generated content from backend
  const initialContent = `# Milkdown Vanilla Commonmark

> You're scared of a world where you're needed.

This is a demo for using Milkdown with **Vanilla Typescript**.

*Italic*

\`This is a 'Code' element\`

\`\`\`
#include <stdio.h>
int main() {
    printf("Hello world\\n");
    return 0;
}`;

  return (
    <div className="flex flex-row-reverse justify-center items-center h-full w-full">
      <div className="relative flex flex-col h-full py-24 items-center justify-start w-full">
        <button
          onClick={() =>
            setViewMode(viewMode === "chat" ? "markdown" : "chat")
          }
          className="mb-4 px-4 py-2 bg-primary text-zinc-950 rounded-md"
        >
          {viewMode === "chat"
            ? "Switch to Markdown"
            : "Switch to Chat"}
        </button>

        {viewMode === "chat" ? (
          <Chat
            workspace={workspace}
            fetchingFiles={fetchingFiles}
            files={files}
            fetchFiles={fetchFiles}
            handleDeleteFile={handleDeleteFile}
          />
        ) : (
          <>
            {workspace.materialType === "LESSON" ? (
              <MilkdownEditorWrapper initialContent={initialContent} />
            ) : (
              <SkeletonLoader /> // Placeholder
            )}
          </>
        )}

      </div>
      <SidenavMaterial workspace={workspace} files={files} fetchingFiles={fetchingFiles} uploadCompletionCallback={fetchFiles} handleDeleteFile={handleDeleteFile} />
    </div>
  );
}

interface ChatProps {
  workspace: Workspace;
  fetchingFiles: boolean;
  files: FetchedFile[];
  fetchFiles: () => Promise<void>;
  handleDeleteFile: (documentId: string) => Promise<void>;
}

const Chat: React.FC<ChatProps> = ({
  workspace,
  fetchingFiles,
  files,
  fetchFiles,
  handleDeleteFile,
}) => {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      body: { namespaceId: workspace.id },
    });

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

  return (
    <>
      <div className={messages.length > 0 ? "h-full w-full" : "w-full"}>
        {messages.map((m: Message) => (
          <div
            key={m.id}
            className="whitespace-pre-wrap max-w-fit w-full"
          >
            <ChatMessage key={m.id} message={m} />
          </div>
        ))}
        {isLoading && (
          <div className="animate-pulse bg-gray-500 dark:bg-zinc-500 h-4 w-4 rotate-45 rounded-sm"></div>
        )}
        <div className={documentTrayIsOpen ? "h-[70%]" : "h-1/3"}></div>
      </div>

      {messages.length === 0 && (
        <div className="relative flex flex-col items-center justify-center h-full">
          {!fetchingFiles &&
            (files.length > 0 ? (
              <PromptGrid
                prompts={prompts}
                activePromptIndex={activePromptIndex}
                onMouseOver={(index: number) =>
                  setActivePromptIndex(index)
                }
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
      <form
        onSubmit={(e: React.FormEvent<HTMLFormElement>) =>
          handleSubmit(e)
        }
        className="fixed bottom-0 w-full max-w-[300px] sm:max-w-[400px] md:max-w-2xl z-50 pb-10"
      >
        {/* Prompt area */}
        <div className="flex flex-row items-center h-fit mb-4">
          <textarea
            className={
              "p-4 px-5 border-gray-300 bg-white/80 text-black dark:border-zinc-100 dark:bg-zinc-950/80 dark:text-zinc-100 rounded flex-grow mr-4 backdrop-blur-lg shadow-md overflow-y-auto resize-none " +
              (isLoading ? "cursor-not-allowed" : "cursor-text")
            }
            value={input}
            placeholder={
              isLoading
                ? "Responding..."
                : "Chat with this workspace..."
            }
            disabled={isLoading}
            onChange={handleInputChange}
            onKeyDown={(e: any) => {
              if (e.key === "Enter" && !e.shiftKey) {
                // If user doesn't press shift key while pressing enter
                e.preventDefault(); // prevents from going to new line
                handleSubmit(e); // instead submit the prompt
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
              text={
                workspace.locked
                  ? "Read-Only Workspace"
                  : "Add PDF documents (do not upload private files)"
              }
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

        {/* Document Tray */}
        <div className="flex flex-col items-center bg-white/80 dark:bg-zinc-950 backdrop-blur-lg border border-gray-300 dark:border-zinc-100/10 rounded shadow-md">
          <button
            onClick={toggleOpen}
            className={`flex flex-row items-center justify-center font-normal cursor-pointer w-full p-2 gap-1 transition duration-200 ease-in-out hover:bg-slate-50 dark:hover:bg-zinc-900 ${documentTrayIsOpen ? "border-b dark:border-zinc-100/10" : ""}`}
          >
            <span className="text-gray-500 dark:text-zinc-500 text-sm">
              {workspace.locked
                ? "View Documents"
                : "Manage Documents"}{" "}
              {fetchingFiles ? (
                <>
                  (
                  <div className="inline-block w-2 h-4 mx-0 translate-y-1 bg-gray-200 dark:bg-zinc-200 animate-pulse" />
                  )
                </>
              ) : (
                `(${files.length})`
              )}
            </span>
            <div
              className={
                "-rotate-90 text-gray-500 dark:text-gray-500 scale-105"
              }
            >
              {documentTrayIsOpen ? (
                <FiChevronRight />
              ) : (
                <FiChevronLeft />
              )}
            </div>
          </button>
          {documentTrayIsOpen && (
            <div className="p-2 py-5 max-h-[120px] overflow-auto no-scrollbar">
              {files.length > 0 ? (
                <div className="flex flex-wrap gap-x-2 gap-y-5 ">
                  {files.map((file) => (
                    <FileCard
                      key={file.name}
                      fileUrl={file.url}
                      handleDeleteFile={() =>
                        handleDeleteFile(
                          file.documentId
                        )
                      }
                      readOnly={workspace.locked}
                    />
                  ))}
                </div>
              ) : fetchingFiles ? (
                <div className="text-gray-500 text-sm animate-pulse">
                  Fetching documents...
                </div>
              ) : (
                <div className="text-gray-500 text-sm">
                  No documents uploaded
                </div>
              )}
            </div>
          )}
        </div>
      </form>
    </>
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
