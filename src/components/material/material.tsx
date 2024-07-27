// material.tsx where the upload call is made

"use client";
import { Page, useWorkspaceMaterialContext, Workspace } from "@/lib/hooks/context-providers/workspace-material-context";
import React, {
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";
import { IoIosSwap } from "react-icons/io";
import { FetchedFile } from "@/app/api/files/route";
import { MilkdownEditorWrapper } from "../ui/ui-composite/milkdown";
import SidenavMaterial from "../ui/ui-composite/sidenav-material";
import Quiz from "./quiz";
import { Chat } from "./chat/chat"

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

// isGenerationDisabled context
interface GenerationDisabledContextProps {
  generationDisabled: boolean
  setGenerationDisabled: (val: boolean) => void
}

export const IsGenerationDisabledContext = createContext<GenerationDisabledContextProps | undefined>(undefined)

export const IsGenerationDisabledProvider = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  const [generationDisabled, setGenerationDisabled] = useState<boolean>(true)

  return <IsGenerationDisabledContext.Provider value={{ generationDisabled, setGenerationDisabled }}>{children}</IsGenerationDisabledContext.Provider>
}

export default function Material({ workspace }: { workspace: Workspace }) {
  const { workspaces, removeWorkspace,
    selectedWorkspace,
    selectedPageId
  } = useWorkspaceMaterialContext();
  const [files, setFiles] = useState<FetchedFile[]>([]);
  const [fetchingFiles, setFetchingFiles] = useState(true);
  const [materialType, setMaterialType] = useState("LESSON"); // either 'quiz' or 'lesson' sets either quiz or lesson generation

  const [lessonPage, setLessonPage] = useState<Page>({ id: '', title: '', content: '' });

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
      <IsGenerationDisabledProvider>
        <div className="relative flex flex-col h-full w-full py-10 items-center justify-start ">
          <div className="flex flex-row h-fit w-full items-start justify-start">
            <button
              onClick={() =>
                setViewMode(viewMode === "chat" ? "markdown" : "chat")
              }
              className="mb-4 px-4 bg-transparent text-zinc-950 rounded-md"
            >
              <div className="flex flex-row items-start justify-start text-foreground">
                <IoIosSwap className="w-6 h-6 mr-2" />
                {viewMode === "chat"
                  ? (workspace.materialType === 'LESSON' ? "Switch to Markdown" : "Switch to Quiz")
                  : "Switch to Chat"}
              </div>
            </button>
          </div>

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
                <>
                  <MilkdownEditorWrapper initialContent={
                    initialContent
                  } />
                </>
              ) : (
                <Quiz />
                // <SkeletonLoader /> // Placeholder
              )}
            </>
          )}

        </div>
        <SidenavMaterial workspace={workspace} files={files} fetchingFiles={fetchingFiles} uploadCompletionCallback={fetchFiles} handleDeleteFile={handleDeleteFile} />
      </IsGenerationDisabledProvider>
    </div>
  );
}

