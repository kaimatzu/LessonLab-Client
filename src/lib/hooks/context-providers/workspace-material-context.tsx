// client/src/lib/hooks/workspace-material-context.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { GET as getMaterials } from '@/app/api/material/route';
import { GET as _getSpecifications } from "@/app/api/material/specification/route";
import { POST as _addLessonPage, GET as _getLessonPages } from "@/app/api/material/page/route";
import RequestBuilder from '@/lib/hooks/builders/request-builder';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  fetchMaterials,
  fetchSpecifications,
  setSelectedWorkspace,
  setSelectedSpecificationId,
  setSelectedPageId,
  updateWorkspaceName,
  addWorkspace,
  removeWorkspace,
  addSpecification,
  updateSpecification,
  deleteSpecification,
  addLessonPage,
  updateLessonPage,
  fetchLessonPages,
  selectSpecificationsForSelectedWorkspace,
  selectPagesForSelectedWorkspace
} from '@/redux/slices/workspaceSlice';
import { RootState } from '@/redux/store';

export interface AdditionalSpecification {
  id: string;
  content: string;
}

export interface Specification {
  id: string;
  name: string;
  topic: string;
  writingLevel: string;
  comprehensionLevel: string;
  additionalSpecs: AdditionalSpecification[];
}

export interface Page {
  id: string;
  title: string;
  content: string;
}

export interface Workspace {
  id: string;
  name: string;
  fileUrls: string[];
  createdAt: number;
  locked?: boolean;
  materialType: string;
  specifications: Specification[];
  pages: Page[];
}

export interface WorkspaceMaterialContextValue {
  workspaces: Workspace[];
  workspacesInitialized: boolean;
  selectedWorkspace: Workspace | null;
  selectedSpecificationId: string | null;
  selectedPageId: string | null;
  specifications: Specification[];
  pages: Page[];
  loading: boolean;
  specificationsLoading: boolean;
  loadWorkspaceData: (workspaceId: string, currentSelectedWorkspace: Workspace | null) => void;
  selectWorkspace: (workspaceId: string | null) => void;
  selectSpecification: (specificationId: string) => void;
  updateWorkspaceName: (workspaceId: string, newName: string) => void;
  addWorkspace: (workspace: Workspace) => void;
  removeWorkspace: (workspaceId: string) => void;
  updateSpecification: (workspaceId: string, specification: Specification) => void;
  addSpecification: (workspaceId: string, specification: Specification) => void;
  deleteSpecification: (workspaceId: string, specificationId: string) => void;
  addLessonPage: (lessonId: string, page: Page) => void;
  updateLessonPage: (lessonId: string, updatedPage: Page) => void;
  selectPage: (pageId: string) => void;
}

const defaultValue: WorkspaceMaterialContextValue = {
  workspaces: [],
  workspacesInitialized: false,
  selectedWorkspace: null,
  selectedSpecificationId: null,
  selectedPageId: null,
  specifications: [],
  pages: [],
  loading: false,
  specificationsLoading: false,
  loadWorkspaceData: () => { },
  selectWorkspace: () => { },
  selectSpecification: () => { },
  updateWorkspaceName: () => { },
  addWorkspace: () => { },
  removeWorkspace: () => { },
  updateSpecification: () => { },
  // getSpecifications: async (): Promise<Specification[]> => {
  //   return [];
  // },
  addSpecification: () => { },
  deleteSpecification: () => { },
  // getLessonPages: async(): Promise<Page[]> => {
  //   return []
  // },
  addLessonPage: () => Promise.resolve(),
  updateLessonPage: () => { },
  selectPage: () => { },
};

export const WorkspaceMaterialContext = createContext(defaultValue);
export const useWorkspaceMaterialContext = () => useContext(WorkspaceMaterialContext);

export const WorkspaceMaterialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const workspaces = useAppSelector((state: RootState) => state.workspace.workspaces);
  const workspacesInitialized = useAppSelector((state: RootState) => state.workspace.workspacesInitialized);
  const selectedWorkspace = useAppSelector((state: RootState) => state.workspace.selectedWorkspace);
  const selectedSpecificationId = useAppSelector((state: RootState) => state.workspace.selectedSpecificationId);
  const selectedPageId = useAppSelector((state: RootState) => state.workspace.selectedPageId);
  const loading = useAppSelector((state: RootState) => state.workspace.loading);
  const specifications = useAppSelector(selectSpecificationsForSelectedWorkspace);
  const specificationsLoading = useAppSelector((state: RootState) => state.workspace.pagesLoading);
  const pages = useAppSelector(selectPagesForSelectedWorkspace);

  useEffect(() => {
    dispatch(fetchMaterials());
  }, [dispatch]);

  const loadWorkspaceData = (workspaceId: string) => {
    if (!selectedWorkspace || selectedWorkspace.id !== workspaceId) {
      dispatch(setSelectedWorkspace(workspaceId));
    }
    dispatch(fetchSpecifications(workspaceId)).then((action) => {
      if (fetchSpecifications.fulfilled.match(action)) {
        console.log("Fetch fullfilled")
        const specifications = action.payload.specifications;
        if (specifications.length > 0) {
          dispatch(setSelectedSpecificationId(specifications[0].id));
        }
      }
    });
    dispatch(fetchLessonPages(workspaceId)).then((action) => {
      if (fetchLessonPages.fulfilled.match(action)) {
        const pages = action.payload.pages;
        if (pages.length > 0) {
          dispatch(setSelectedPageId(pages[0].id));
        }
      }
    });
  };

  const selectWorkspace = (workspaceId: string | null) => {
    dispatch(setSelectedWorkspace(workspaceId));
  };

  const selectSpecification = (specificationId: string) => {
    dispatch(setSelectedSpecificationId(specificationId));
  };

  const updateWorkspaceNameHandler = (workspaceId: string, newName: string) => {
    dispatch(updateWorkspaceName({ workspaceId, newName }));
  };

  const addWorkspaceHandler = (workspace: Workspace) => {
    dispatch(addWorkspace(workspace));
  };

  const removeWorkspaceHandler = (workspaceId: string) => {
    dispatch(removeWorkspace(workspaceId));
  };

  const addSpecificationHandler = (workspaceId: string, specification: Specification) => {
    dispatch(addSpecification({ workspaceId, specification }));
  };

  const updateSpecificationHandler = (workspaceId: string, specification: Specification) => {
    dispatch(updateSpecification({ workspaceId, specification }));
  };

  const deleteSpecificationHandler = (workspaceId: string, specificationId: string) => {
    dispatch(deleteSpecification({ workspaceId, specificationId }));
  };

  const addLessonPageHandler = (lessonId: string, page: Page) => {
    dispatch(addLessonPage({ lessonId, page }));
  };

  const updateLessonPageHandler = (lessonId: string, updatedPage: Page) => {
    dispatch(updateLessonPage({ lessonId, updatedPage }));
  };

  const selectPage = (pageId: string) => {
    dispatch(setSelectedPageId(pageId));
  };

  return (
    <WorkspaceMaterialContext.Provider
      value={{
        workspaces,
        workspacesInitialized,
        selectedWorkspace,
        selectedSpecificationId,
        selectedPageId,
        specifications,
        pages,
        loading,
        specificationsLoading,
        loadWorkspaceData,
        selectWorkspace,
        selectSpecification,
        updateWorkspaceName: updateWorkspaceNameHandler,
        addWorkspace: addWorkspaceHandler,
        removeWorkspace: removeWorkspaceHandler,
        addSpecification: addSpecificationHandler,
        updateSpecification: updateSpecificationHandler,
        deleteSpecification: deleteSpecificationHandler,
        addLessonPage: addLessonPageHandler,
        updateLessonPage: updateLessonPageHandler,
        selectPage,
      }}
    >
      {children}
    </WorkspaceMaterialContext.Provider>
  );
};