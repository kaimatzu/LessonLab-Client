import { useState } from 'react';
import Link from 'next/link';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { TbNotes, TbBook, TbPencil } from 'react-icons/tb';
import { FaPlus, FaLock } from 'react-icons/fa';
import { usePathname } from 'next/navigation';
import { useWorkspaceMaterialContext } from '@/lib/hooks/context-providers/workspace-material-context';
import { SkeletonLoader } from '../ui-base/skeleton-loader';
import { Tooltip } from './chat/tooltip';
import '../css/custom-scrollbar.css'
import { Workspace } from '@/redux/slices/workspaceSlice';

const Sidenav: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { workspaces, workspacesInitialized, selectWorkspace } = useWorkspaceMaterialContext();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleWorkspaceClick = (workspaceId: string | null) => {
    console.log("selecting workspace ", workspaceId);
    selectWorkspace(workspaceId);
  };

  const isActive = (path: string) => pathname === path;

  const sortedChats = workspaces.slice().sort((a, b) => Number(b.createdAt) - Number(a.createdAt));

  return (
    <div className="flex flex-row w-fit !overflow-x-visible z-[100] dark:bg-zinc-900 shadow-lg">
      <div className={`flex flex-col transition-all duration-500 ease-in-out ${isCollapsed ? 'w-16 max-w-[0px]' : 'max-w-[370px] w-[250px] '}`}>
        <div className={`text-black mb-2 mt-2 dark:text-zinc-100`}>
          <div className={`flex align-middle p-3 rounded`}>
            <div className={`mr-2`}></div>
            <span className={`${isCollapsed ? 'hidden' : 'inline font-medium'}`}>Materials</span>
          </div>
        </div>

        <div
          className={` bg-transparent dark:bg-zinc-900 !overflow-x-visible 
          ${isCollapsed ? 'scrollbar-hidden no-scrollbar' : 'px-3 custom-scrollbar'} 
          overflow-y-scroll`}
        >

          <ul className="!overflow-hidden">
            {!workspacesInitialized ? (
              <SkeletonLoader />
            ) : workspaces.length === 0 ? (
              <></>
            ) : (
              <>
                {sortedChats.map((workspace: Workspace) => {
                  if (!workspace) return null;
                  return (
                    <SidenavItem
                      key={workspace.id}
                      title={workspace.name}
                      href={`/workspace/${workspace.id}`}
                      isActive={isActive(`/workspace/${workspace.id}`)}
                      onClick={() => handleWorkspaceClick(workspace.id)}
                      icon={workspace.materialType === "LESSON" ? (<TbBook />) : (<TbPencil />)}
                      isCollapsed={isCollapsed}
                      locked={workspace.locked}
                    />
                  );
                })}
              </>
            )}
          </ul>
        </div>

        <div className='list-none p-4'>
          <SidenavItem
            title="Create Workspace"
            href="/workspace/new"
            isActive={isActive('/workspace/new')}
            onClick={() => handleWorkspaceClick(null)}
            isCollapsed={isCollapsed}
            icon={<FaPlus className={`${isCollapsed ? 'hidden' : 'scale-75 hover:text-white'} ${isActive('/workspace/new') ? 'text-primary hover:text-white' : 'text-primary hover:text-white'}`} />}
            animatedBorder
          />
        </div>

      </div>

      <button
        onClick={toggleSidebar}
        className="relative mb-4 w-fit my-4 ml-2 rounded-lg px-2 dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 flex z-0
        justify-end items-center bg-transparent border-none text-xl cursor-pointer"
        aria-expanded={!isCollapsed}
      >
        <div className="scale-125 text-black dark:text-zinc-200">{isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}</div>
      </button>
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
}

const SidenavItem: React.FC<SidenavItemProps> = ({ title, href, isActive, isCollapsed, icon, locked, animatedBorder, onClick }) => {
  return (
    <li>
      {isCollapsed ? (
        <Tooltip text={<span>{title}{locked && <span className="ml-2">(Read-Only)</span>}</span>}>
          <Link
            href={href}
            onClick={onClick}
            className={`flex items-center no-underline rounded mb-1 
            ${isActive ? 'bg-primary text-zinc-900 duration-0'
                : 'hover:bg-yellow-300/80'
              } duration-100 justify-center py-4 ${animatedBorder ? 'border-glow' : ''}`}
          >
            <div className="relative">
              {icon || <TbNotes />}
              {locked && <span className="absolute bottom-0 right-0 transform translate-x-1/2 translate-y-1/2 scale-75"><FaLock /></span>}
            </div>
          </Link>
        </Tooltip>
      ) : (
        <Link
          href={href}
          onClick={onClick}
          className={`flex items-center no-underline rounded mb-1 
          ${isActive ? 'bg-primary text-zinc-900 duration-0'
              : 'hover:bg-yellow-300/80'
            } duration-100 justify-start p-3 ${animatedBorder ? 'border-glow' : ''}`}
        >
          {<div className="mr-2">{icon}</div> || <TbNotes className="mr-2" />}
          <span>{title}</span>
          {locked &&
            <span className="ml-2 scale-75">
              <Tooltip text={<span className="">Read-Only</span>}>
                <FaLock />
              </Tooltip>
            </span>}
        </Link>
      )}
    </li>
  );
};

export default Sidenav;