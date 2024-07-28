// material.tsx where the upload call is made

"use client";
import { Page, Specification, useWorkspaceMaterialContext, Workspace } from "@/lib/hooks/context-providers/workspace-material-context";
import React, {
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

export default function Material({ workspace }: { workspace: Workspace }) {
  const {
    getSpecifications,
    getLessonPages,
    loadWorkspaceData,
  } = useWorkspaceMaterialContext();
  const [files, setFiles] = useState<FetchedFile[]>([]);
  const [specifications, setSpecifications] = useState<Specification[]>([]);
  const [lessonPages, setLessonPages] = useState<Page[]>([]);

  const [fetchingFiles, setFetchingFiles] = useState(true);
  const [fetchingSpecifications, setFetchingSpecifications] = useState(true);
  const [fetchingLessonPages, setFetchingLessonPages] = useState(true);
  const [generationDisabled, setGenerationDisabled] = useState(true);

  // TODO: Change how this is called to use request builder and refactor this to api folder
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

  useEffect(() => { fetchFiles() }, [fetchFiles]);

  // const fetchSpecifications = useCallback(async () => {
  //   setFetchingSpecifications(true);
  //   const specifications = await getSpecifications(workspace.id);
  //   console.log(specifications);
  //   console.log(workspace.id)
  //   setSpecifications(specifications);
  //   setFetchingSpecifications(false);
  // }, [workspace.id]);

  // useEffect(() => {fetchSpecifications()}, [fetchSpecifications]);

  // const fetchLessonPages = useCallback(async () => {
  //   if (workspace.materialType === 'LESSON') {
  //     setFetchingLessonPages(true);
  //     const pages = await getLessonPages(workspace.id);
  //     setLessonPages(pages);  
  //     setFetchingLessonPages(false);
  //   } else {
  //     setLessonPages([])
  //   }
  // }, [workspace.id]);

  // useEffect(() => {fetchLessonPages()}, [fetchLessonPages]);

  const loadWorkspace = useCallback(async () => {
    loadWorkspaceData(workspace.id);
  }, [workspace.id])

  useEffect(() => { loadWorkspace() }, [loadWorkspace]);

  const [viewMode, setViewMode] = useState("markdown"); // 'chat' or 'markdown'

  const handleGenerationDisabledChanged = (newValue: boolean) => {
    setGenerationDisabled(newValue)
  }

  return (
    <div className="flex flex-row-reverse justify-center items-center h-full w-full">
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
              <MilkdownEditorWrapper />
            ) : (
              <Quiz generationDisabled={generationDisabled} />
            )}
          </>
        )}

      </div>
      <SidenavMaterial
        workspace={workspace}
        files={files}
        fetchingFiles={fetchingFiles}
        uploadFileCompletionCallback={fetchFiles}
        specifications={specifications}
        fetchingSpecifications={fetchingSpecifications}
        handleDeleteFile={handleDeleteFile}
        onGenerationDisabledChange={handleGenerationDisabledChanged}
      />
    </div>
  );
}

