// workspace.tsx where the upload call is made

"use client";
import { useWorkspaceContext } from "@/lib/hooks/context-providers/workspace-context";
import React, {
  useCallback,
  useEffect,
  useState,
} from "react";
import { FetchedFile } from "@/app/api/files/route";
import SidenavWorkspace from "../ui/ui-composite/sidenav-workspace";
import { Chat } from "./chat/chat"
import Overlay from "../ui/ui-base/overlay";
import { Workspace } from "@/lib/types/workspace-types";
import MaterialArea from "../ui/ui-composite/material/material-area";
import { useSocket } from "@/lib/hooks/useServerEvents";
import { BsThreeDots } from "react-icons/bs";
import { FaRegFolderClosed } from "react-icons/fa6";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { RiDeleteBinLine } from "react-icons/ri";
import { LuPencil } from "react-icons/lu";

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

// #region Workspace Component
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
  const [anchorEl, setAnchorEl] = useState<null | SVGElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<SVGElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };
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

  // #region JSX
  return (
    <div className="flex flex-col h-full w-full !bg-[#F1F3F8]">
      <div className={`flex flex-col z-[200] border-b border-gray-300 select-none text-black w-full mx-0`}>
          <div className={`flex items-center align-middle p-2 rounded text-sm justify-between`}>
              <div className="flex flex-row justify-between max-w-[320px] w-[220px]">
                <div className="flex flex-row items-center justify-start truncate">
                  <div className="mr-4 ml-2">
                    <FaRegFolderClosed/>
                  </div>
                  <span className="max-w-[120px] truncate">{workspace.name}</span>
                </div>
                <div className="items-center cursor-pointer pt-1 hover:text-[#5e77d3]">
                    <BsThreeDots onClick={(event) => handleMenuOpen(event)}/>
                </div>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    slotProps={{
                      paper: {
                        sx: {
                          backgroundColor: '#f1f3f8', // Custom background color
                          borderRadius: '8px',           // Rounded corners
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                          padding: '6px',
                        },
                      },
                    }}
                  >
                    <MenuItem onClick={()=>{}} sx={{ fontSize: '0.875rem', borderRadius: '8px' }}>
                      <LuPencil className="mr-2"/>
                      Rename
                    </MenuItem>
                    <MenuItem onClick={()=>{}} sx={{ fontSize: '0.875rem', color: 'red', borderRadius: '8px' }}>
                      <RiDeleteBinLine className="mr-2"/>
                      Delete
                    </MenuItem>
                  </Menu>
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
