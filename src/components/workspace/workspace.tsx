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
import { BsThreeDots } from "react-icons/bs";
import { FaFolderClosed, FaRegFolderClosed } from "react-icons/fa6";

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
    <div className="flex flex-col h-full w-full !bg-[#F1F3F8]">
      <div className={`flex flex-col z-[200] border-b border-gray-300 select-none text-black w-full mx-0`}>
          <div className={`flex items-center align-middle p-2 rounded text-sm justify-between`}>
              <div className="flex flex-row justify-between max-w-[320px] w-[220px]">
                <div className="flex flex-row items-center justify-start truncate">
                  <div className="mr-4 ml-2">
                    <FaRegFolderClosed/>
                  </div>
                  <span>{workspace.name}</span>
                </div>
                <div className="items-center cursor-pointer pt-1 hover:text-[#5e77d3]">
                  <BsThreeDots />
                </div>
              </div>
              <button className="text-white text-sm h-8 px-2 bg-gradient-to-r from-secondary to-primary rounded-sm hover:opacity-65 focus:outline-none"
              onClick={() => {
                setIsChatOpen(true);
              } }
              > AI Assist</button>
          </div>
      </div>
    <div className="flex flex-row-reverse justify-center items-center h-full w-full">
      <div className="relative flex flex-col h-full w-full items-center justify-start">
        {/* <MilkdownEditorWrapper /> */}
        
        {selectedModuleId && !moduleDataLoading ? (
          <>
            <MaterialArea />
            {/* <CrepeEditor /> */}
          </>
        ) : (
          <>
            <h2 className="mt-20 text-zinc-500 cursor-default select-none">Please select or create a module</h2>
          </>
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
    </div>
  );
}

