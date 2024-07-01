// client/src/lib/hooks/workspace-material-context.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { GET as getMaterials }  from '@/app/api/material/route';
import RequestBuilder from '@/lib/hooks/builders/request-builder';

export interface Workspace {
  id: string;
  name: string;
  fileUrls: string[];
  createdAt: number;
  locked?: boolean;
  materialType: string
}

export interface WorkspaceMaterialContextValue {
  workspaces: Workspace[];
  workspacesInitialized: boolean;
  addWorkspace: (workspace: Workspace) => void;
  removeWorkspace: (workspaceId: string) => void;
}

const defaultValue: WorkspaceMaterialContextValue = {
  workspaces: [],
  workspacesInitialized: false,
  addWorkspace: () => { },
  removeWorkspace: () => { },
};

export const WorkspaceMaterialContext = createContext<WorkspaceMaterialContextValue>(defaultValue);
export const useWorkspaceMaterialContext = () => useContext(WorkspaceMaterialContext);

export const WorkspaceMaterialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspacesInitialized, setWorkspacesInitialized] = useState(false);

  useEffect(() => {
    const fetchMaterials = async () => {
      const requestBuilder = new RequestBuilder();
      const response = await getMaterials(requestBuilder).catch(error => {
        console.error("Error fetching user's materials:", error);
        return null;
      });

      if (response && response.ok) {
        const data = await response.json();

        const fetchedWorkspaces = data.map((material: any) => ({
          id: material.MaterialID,
          name: material.MaterialName,
          fileUrls: [], 
          createdAt: Date.now(),
          locked: false, 
          materialType: material.MaterialType,
        }));
        
        setWorkspaces(fetchedWorkspaces);
        setWorkspacesInitialized(true); // Set to true after fetching materials
      } else {
        setWorkspacesInitialized(true); // Set to true even if the request fails or returns no data
      }
    };

    fetchMaterials();
  }, []);

  const addWorkspace = (workspace: Workspace) => {
    const updatedWorkspaces = [...workspaces, { ...workspace, createdAt: Date.now() }];
    setWorkspaces(updatedWorkspaces);
  };

  const removeWorkspace = (workspaceId: string) => {
    const updatedWorkspaces = workspaces.filter((workspace) => workspace.id !== workspaceId);
    setWorkspaces(updatedWorkspaces);
  };

  return (
    <WorkspaceMaterialContext.Provider value={{ workspaces, workspacesInitialized, addWorkspace, removeWorkspace }}>
      {children}
    </WorkspaceMaterialContext.Provider>
  );
};