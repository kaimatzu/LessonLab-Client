// workspace.tsx where the upload call is made

"use client";
import { useWorkspaceContext } from "@/lib/hooks/context-providers/workspace-context";
import React, {
  useCallback,
  useEffect,
  useState,
} from "react";
import { IoIosSwap } from "react-icons/io";
import { FetchedFile } from "@/app/api/files/route";
import { MilkdownEditorWrapper } from "../ui/ui-composite/material/milkdown";
import SidenavWorkspace from "../ui/ui-composite/sidenav-workspace";
import { Chat } from "./chat/chat"
import Overlay from "../ui/ui-base/overlay";
import { Workspace } from "@/lib/types/workspace-types";
import CrepeEditor from "../ui/ui-composite/material/milkdownCrepe";
import MaterialArea from "../ui/ui-composite/material/material-area";
import { useSocket } from "@/lib/hooks/useServerEvents";

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

export default function WorkspaceComponent({ workspace }: { workspace: Workspace }) {
  const {
    loading,
    moduleDataLoading,
    selectWorkspace,
    loadWorkspaceData,
    selectedWorkspace,
    selectedModuleId,
  } = useWorkspaceContext();
  
  const { socket, joinWorkspaceRoom, socketConnected } = useSocket();

  const [files, setFiles] = useState<FetchedFile[]>([]);
  const [fetchingFiles, setFetchingFiles] = useState(true);
  const [connectionInitialized, setConnectionInitialized] = useState<boolean>(false);

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

  useEffect(() => { fetchFiles() }, [fetchFiles]);

  const loadWorkspace = useCallback(async () => {
    if (!selectedWorkspace || selectedWorkspace.id !== workspace.id) {
      selectWorkspace(workspace.id);
    }
    loadWorkspaceData(workspace.id, selectedWorkspace);
  }, [workspace.id]);

  useEffect(() => {
    console.log("Socket connected:", socketConnected);
    console.log(loading, selectedWorkspace, socketConnected, connectionInitialized);
    if (!loading && selectedWorkspace?.id && socketConnected && socket.connected && !connectionInitialized) { // Jesus fucking christ
      joinWorkspaceRoom(selectedWorkspace?.id);
      setConnectionInitialized(true);
    }
  }, [loading, socketConnected, connectionInitialized])

  useEffect(() => { loadWorkspace() }, [loadWorkspace]);

  const [isChatOpen, setIsChatOpen] = useState<boolean>(false); // 'chat' or 'markdown'

  const closeChat = () => {
    setIsChatOpen(false);
  };

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
                ? "Switch to Markdown" : "Switch to Chat"}
            </div>
          </button>
        </div>

        {/* <MilkdownEditorWrapper /> */}
        
        {selectedModuleId && !moduleDataLoading ? (
          <>
            <MaterialArea />
            {/* <CrepeEditor /> */}
          </>
        ) : (
          <>No module selected</>
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
      <SidenavWorkspace
        workspace={workspace}
        files={files}
        fetchingFiles={fetchingFiles}
        uploadFileCompletionCallback={fetchFiles}
        handleDeleteFile={handleDeleteFile}
      />
    </div>
  );
}

