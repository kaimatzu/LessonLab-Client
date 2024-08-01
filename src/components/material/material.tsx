// material.tsx where the upload call is made

"use client";
import { useWorkspaceMaterialContext } from "@/lib/hooks/context-providers/workspace-material-context";
import React, {
  useCallback,
  useEffect,
  useState,
} from "react";
import { IoIosSwap } from "react-icons/io";
import { FetchedFile } from "@/app/api/files/route";
import { MilkdownEditorWrapper } from "../ui/ui-composite/chat/milkdown";
import SidenavMaterial from "../ui/ui-composite/sidenav-material";
import Quiz from "./quiz";
import { Chat } from "./chat/chat"
import Overlay from "../ui/ui-base/overlay";
import { Workspace } from "@/redux/slices/workspaceSlice";

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
    selectWorkspace,
    loadWorkspaceData,
    selectedWorkspace,
  } = useWorkspaceMaterialContext();
  const [files, setFiles] = useState<FetchedFile[]>([]);
  const [fetchingFiles, setFetchingFiles] = useState(true);
  const [generationDisabled, setGenerationDisabled] = useState(true);
  // const [name, setName] = useState('')
  // const [topic, setTopic] = useState('')

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

  // TODO: move this to workspace context provider
  const fetchFiles = useCallback(async () => {
    setFetchingFiles(true);
    const files = await fetchFileUrls(workspace.id);
    setFiles(files);
    setFetchingFiles(false);
  }, [workspace.id]);

  // TODO: update workspace data (specifications)
  const handleWorkspaceChange = (newWorkspace: Workspace) => {
    workspace = newWorkspace
  }

  useEffect(() => { fetchFiles() }, [fetchFiles]);

  const loadWorkspace = useCallback(async () => {
    if (!selectedWorkspace || selectedWorkspace.id !== workspace.id) {
      selectWorkspace(workspace.id);
    }
    loadWorkspaceData(workspace.id, selectedWorkspace);
  }, [workspace.id]);

  useEffect(() => { loadWorkspace() }, [loadWorkspace]);

  const [isChatOpen, setIsChatOpen] = useState<boolean>(false); // 'chat' or 'markdown'

  const closeChat = () => {
    setIsChatOpen(false);
  };

  const handleGenerationDisabledChanged = (newValue: boolean) => {
    setGenerationDisabled(newValue)
  }

  return (
    <div className="flex flex-row-reverse justify-center items-center h-full w-full">
      <div className="relative flex flex-col h-full w-full py-10 items-center justify-start ">
        <div className="flex flex-row h-fit w-full items-start justify-start">
          <button
            onClick={() => {
              setIsChatOpen(true);
            }
            }
            className="mb-4 px-4 bg-transparent text-zinc-950 rounded-md"
          >
            <div className="flex flex-row items-start justify-start text-foreground">
              <IoIosSwap className="w-6 h-6 mr-2" />
              {isChatOpen
                ? (workspace.materialType === 'LESSON' ? "Switch to Markdown" : "Switch to Quiz")
                : "Switch to Chat"}
            </div>
          </button>
        </div>

        {workspace.materialType === "LESSON" ? (
          <MilkdownEditorWrapper />
        ) : (
          <Quiz generationDisabled={generationDisabled} workspace={workspace} />
        )}

        <Overlay isOpen={isChatOpen} onClose={closeChat} overlayName={"Chat"} overlayType="chat">
          <Chat
            workspace={workspace}
            fetchingFiles={fetchingFiles}
            files={files}
            fetchFiles={fetchFiles}
            handleDeleteFile={handleDeleteFile}
          />
        </Overlay>

      </div>
      <SidenavMaterial
        workspace={workspace}
        files={files}
        fetchingFiles={fetchingFiles}
        uploadFileCompletionCallback={fetchFiles}
        // specifications={specifications}
        // fetchingSpecifications={fetchingSpecifications}
        handleDeleteFile={handleDeleteFile}
        onGenerationDisabledChange={handleGenerationDisabledChanged}
      />
    </div>
  );
}

