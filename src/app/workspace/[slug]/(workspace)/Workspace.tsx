"use client";

import React, { useEffect, useState } from 'react';
import WorkspaceComponent from '@/components/ui/ui-composite/workspace/workspace';
import { useWorkspaceContext } from '@/lib/hooks/context-providers/workspace-context';
import { usePathname, useRouter } from 'next/navigation';
import { Workspace } from '@/lib/types/workspace-types';

export default function WorkspacePage() {
  const { workspaces, removeWorkspace } = useWorkspaceContext();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);  

  let currentWorkspaceId = pathname.split('/').pop() || '';
  let currentWorkspace = workspaces.find((workspace: Workspace) => workspace.id === currentWorkspaceId);
  let currentChat = workspaces.find((chat: Workspace) => chat.id === currentWorkspaceId);

  const router = useRouter();
  
  // Get the current workspace and chat based on the URL slug
  useEffect(() => {
    if (!currentWorkspace || !currentChat) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [pathname, workspaces, currentChat, currentWorkspace]);

  // TODO: Change how this is called to use request builder
  const handleDeleteWorkspace = async (workspaceId: string) => {
    setIsDeleting(true);
    console.log(`/api/files/?namespaceId=${workspaceId}`);
    try {
      const response = await fetch(`/api/files/?namespaceId=${workspaceId}`, {
        method: 'DELETE',
      });
      const responseData = await response.json();
      removeWorkspace(workspaceId);
      console.log(responseData.message);

      // Redirect to the /new page after successful deletion
      router.push('/');
    } catch (error) {
      console.error('Error deleting file:', error);
    }
    setIsDeleting(false);
  };


  return (
    <div className='relative h-full flex justify-center items-center w-full'>
      {isLoading && !currentWorkspace ? (
        <svg
          className="animate-spin h-20 w-20 text-[#d8d8d8] mr-2 snap-center"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (currentWorkspace && currentChat &&
        <WorkspaceComponent workspace={currentWorkspace} />
      )}
    </div>
  );
}