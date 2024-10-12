import { useState } from 'react';
import Link from 'next/link';
import { TbNotes, TbBook, TbPencil } from 'react-icons/tb';
import { FaPlus, FaLock } from 'react-icons/fa';
import { FaRegFolderClosed } from "react-icons/fa6";
import { GoSidebarExpand, GoSidebarCollapse } from "react-icons/go";
import { usePathname } from 'next/navigation';
import { useWorkspaceContext } from '@/lib/hooks/context-providers/workspace-context';
import { SkeletonLoader } from '../ui-base/skeleton-loader';
import { Tooltip } from './chat/tooltip';
import '../css/custom-scrollbar.css'
import { Workspace } from '@/lib/types/workspace-types';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { LuPencil } from 'react-icons/lu';
import { RiDeleteBinLine } from 'react-icons/ri';
import { BsThreeDots } from 'react-icons/bs';
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { TextField } from '@mui/material';
import { PATCH as _updateWorkspaceName, DELETE as _deleteWorkspace } from '../../../app/api/workspace/route';
import RequestBuilder from '@/lib/hooks/builders/request-builder';
import { useRouteContext } from '@/lib/hooks/context-providers/route-context';

// #region Sidenav
const Sidenav: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { workspaces, workspacesInitialized, selectWorkspace, updateWorkspaceName, removeWorkspace } = useWorkspaceContext();
  const { push } = useRouteContext();
  const [anchorEl, setAnchorEl] = useState<null | SVGElement>(null);
  const [editingWorkspaceId, setEditingWorkspaceId] = useState<string | null>(null);
  const [newWorkspaceName, setNewWorkspaceName] = useState<string>('');

  const handleMenuOpen = (event: React.MouseEvent<SVGElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setEditingWorkspaceId(null);
    setAnchorEl(null);
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleWorkspaceClick = (workspaceId: string | null) => {
    console.log("selecting workspace ", workspaceId);
    selectWorkspace(workspaceId);
  };

  const isActive = (path: string) => pathname === path;

  const renameWorkspace = (workspaceId: string) => {
    setAnchorEl(null);
    setEditingWorkspaceId(workspaceId);
  }

  const handleRename = (workspaceId: string, newName: string) => {
    console.log(`Renaming workspace ID ${workspaceId} to ${newName}`);
    updateWorkspaceName(workspaceId, newName);

    const requestBuilder = new RequestBuilder()
      .setURL(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/workspaces/${workspaceId}/${newName}`);
    
    _updateWorkspaceName(requestBuilder);

    handleMenuClose(); // Close the menu after renaming
  };

  const handleDelete = (workspaceId: string) => {
    console.log(`Deleting workspace ID ${workspaceId}`);
    removeWorkspace(workspaceId);

    const requestBuilder = new RequestBuilder()
      .setURL(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/workspaces/${workspaceId}`);
    
    _deleteWorkspace(requestBuilder);

    handleMenuClose(); // Close the menu after deleting
  };

  const sortedWorkspaces = workspaces.slice().sort((a, b) => Number(b.createdAt) - Number(a.createdAt));

  // #region JSX
  return (
    <div className="flex flex-row w-fit bg-[#F1F3F8] h-full !overflow-x-visible z-[100] dark:bg-zinc-900 border-r border-gray-300">
      <div className={`flex flex-col transition-all duration-300 ease-in-out ${isCollapsed ? 'w-50 max-w-[50px]' : 'max-w-[320px] w-[250px] '}`}>
        <div className={`flex text-black h-[49px] items-center justify-between w-full mb-1 ${isCollapsed? 'pl-[6px]' : 'pr-2'} dark:text-zinc-100 text-sm border-b border-gray-300`}>
          <div className={`flex w-full justify-between items-center h-[44px]`}>
              {/* <div className={`mr-1`}></div> */}
            <span className={`${isCollapsed ? 'hidden' : 'inline font-medium'} p-3`}>Workspaces</span>
            <div className={"cursor-pointer hover:bg-[#E2E4EA] hover:text-[#5e77d3] rounded-md py-[9px] px-[10px]"} onClick={toggleSidebar}>
              {isCollapsed ? (
                <GoSidebarCollapse className={"cursor-pointer"}/>
              ) : (
                <GoSidebarExpand className={"cursor-pointer"}/>
              )}
            </div>
          </div>
        </div>

        <div
          className={`text-sm p-0 bg-transparent dark:bg-zinc-900 !overflow-x-visible
          ${isCollapsed ? 'scrollbar-hidden no-scrollbar' : 'custom-scrollbar'}`}
          // overflow-y-scroll`}
        >

            {/* 
            // #region List of Items
             */}
          <ul className="!overflow-hidden">
            {!workspacesInitialized ? (
              <SkeletonLoader />
            ) : workspaces.length === 0 ? (
              <></>
            ) : (
              <>
                {sortedWorkspaces.map((workspace: Workspace) => {
                  if (!workspace) return null;
                  return (
                    <SidenavItem
                      key={workspace.id}
                      title={workspace.name}
                      href={`/workspace/${workspace.id}`}
                      isActive={isActive(`/workspace/${workspace.id}`)}
                      onClick={() => handleWorkspaceClick(workspace.id)}
                      icon={<FaRegFolderClosed/>}
                      isCollapsed={isCollapsed}
                      locked={workspace.locked}
                      anchorEl={anchorEl}
                      handleMenuOpen={handleMenuOpen}
                      handleMenuClose={handleMenuClose}
                      isWorkspace={true}
                      workspaceId={workspace.id}
                      editingId={editingWorkspaceId}
                      renameWorkspace={renameWorkspace}
                      newWorkspaceName={newWorkspaceName}
                      setNewWorkspaceName={setNewWorkspaceName}
                      onRename={handleRename}
                      onDelete={handleDelete}
                    />
                  );
                })}
              </>
            )}
          </ul>
        </div>

        {/* 
        // #region New Workspace
         */}
        <div className='list-none'>
          <SidenavItem
            title="Create New"
            href="/workspace/new"
            isActive={isActive('/workspace/new')}
            onClick={() => handleWorkspaceClick(null)}
            isCollapsed={isCollapsed}
            icon={<FaPlus className={`${isActive('/workspace/new') ? 'text-zinc-900 w-3 h-3' : 'w-3 h-3 text-zinc-900'}`} />}
            animatedBorder
            anchorEl={null}
            handleMenuOpen={()=>{}}
            handleMenuClose={()=>{}}
            isWorkspace={false}
          />
        </div>

      </div>

      {/* <button
        onClick={toggleSidebar}
        className="relative mb-4 w-fit my-4 ml-2 rounded-lg px-2 dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 flex z-0
        justify-end items-center bg-transparent border-none text-xl cursor-pointer"
        aria-expanded={!isCollapsed}
      >
        <div className="scale-125 text-black dark:text-zinc-200">{isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}</div>
      </button> */}
    </div>
  );
};

interface SidenavItemProps {
  title: string;
  href: string;
  isActive: boolean;
  isCollapsed: boolean;
  icon?: React.ReactNode;
  locked?: boolean;
  animatedBorder?: boolean;
  onClick?: () => void;
  anchorEl?: null | SVGElement;  // Add anchorEl prop
  handleMenuOpen?: (event: React.MouseEvent<SVGElement>) => void;  // Add handleMenuOpen prop
  handleMenuClose?: () => void;
  isWorkspace: boolean;
  workspaceId?: string;
  editingId?: string | null; // Track the ID of the workspace being edited
  renameWorkspace?: (workspaceId: string) => void;
  newWorkspaceName?: string; // New name for the workspace
  setNewWorkspaceName?: (name: string) => void; // Setter for the new workspace name
  onRename?: (workspaceId: string, newName: string) => void; // Rename function
  onDelete?: (workspaceId: string) => void; // Delete function
}

const SidenavItem: React.FC<SidenavItemProps> = ({ title, href, isActive, isCollapsed, icon, locked, animatedBorder,
  onClick, anchorEl, handleMenuOpen, handleMenuClose, isWorkspace, workspaceId, editingId, renameWorkspace, newWorkspaceName, setNewWorkspaceName,
  onRename, onDelete }) => {

  const { push } = useRouteContext();

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRename!(editingId!, newWorkspaceName!); // Pass the workspace ID and new name
  };

  const handleDelete = (e: React.UIEvent) => {
    e.preventDefault();
    push('/workspace/new');
    onDelete!(workspaceId!);
  }
  
  return (
    <li>
      {isCollapsed ? (
        <Tooltip text={<span>{title}{locked && <span className="ml-2">(Read-Only)</span>}</span>}>
          <Link
            href={href}
            onClick={onClick}
            className={`flex items-center no-underline rounded-md my-0.5 mx-1.5 h-[32px]
              ${isActive ? 'bg-[#dce3fa] text-[#5e77d3] duration-0'
                : 'hover:bg-gray-300'
              } duration-100 justify-start py-[9px] px-[10px] ${animatedBorder ? 'border-glow' : ''}`}
          >
            <div className="relative">
              {icon || <TbNotes />}
              {locked && <span className="absolute transform translate-x-1/2 translate-y-1/2 scale-75"><FaLock /></span>}
            </div>
          </Link>
        </Tooltip>
      ) : (
        <div>
          {editingId === undefined || editingId !== workspaceId ? (
              <Link
              href={href}
              onClick={onClick}
              className={`flex items-center no-underline rounded-md my-0.5 mx-1.5 h-[32px] group
                ${isActive ? 'bg-[#dce3fa] text-[#5e77d3] duration-0'
                    : 'hover:bg-[#E2E4EA]'
                } duration-100 justify-between py-[6px] px-[10px] ${animatedBorder ? 'border-glow' : ''} text-sm text-center align-center truncate`}
            >
              <div className="flex flex-row items-center max-w-[200px]">
                {icon ? <div className="mr-3">{icon}</div> : <TbNotes className="mr-2" />}
                <span>{title}</span>
                {locked &&
                <span className="ml-2 scale-75">
                  <Tooltip text={<span className="">Read-Only</span>}>
                    <FaLock />
                  </Tooltip>
                </span>}
              </div>
              {isWorkspace && (
                <div className="items-center cursor-pointer pt-1 hover:text-[#5e77d3] opacity-0 group-hover:opacity-100">
                  <BsThreeDots onClick={(event) => handleMenuOpen ? handleMenuOpen(event) : undefined}/>
                </div>
              )}
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
                <MenuItem onClick={() => { renameWorkspace!(workspaceId!) }} sx={{ fontSize: '0.875rem', borderRadius: '8px' }}>
                  <LuPencil className="mr-2"/>
                  Rename
                </MenuItem>
                <MenuItem onClick={handleDelete} sx={{ fontSize: '0.875rem', color: 'red', borderRadius: '8px' }}>
                  <RiDeleteBinLine className="mr-2"/>
                  Delete
                </MenuItem>
              </Menu>
            </Link>
          ) : (
            <form onSubmit={handleRenameSubmit}>
              {/* <div className="flex-1 truncate"> */}
                <div className="flex items-center px-1 py-4">
                  <TextField
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName!(e.target.value)}
                    className="flex-grow border rounded resize-none"
                    placeholder="New name..."
                    size='small'
                    rows={1}
                  />
                  <CheckIcon className="ml-2 cursor-pointer" onClick={handleRenameSubmit} />
                  <CloseIcon className="ml-1 cursor-pointer" onClick={handleMenuClose} />
                </div>
              {/* </div> */}
            </form>
          )}
  
        </div>
      )}
    </li>
  );
};

export default Sidenav;