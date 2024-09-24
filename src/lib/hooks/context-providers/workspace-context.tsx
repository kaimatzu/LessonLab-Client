// client/src/lib/hooks/workspace-context.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { GET as getWorkspaces } from '@/app/api/workspace/route';
import { GET as _getSpecifications } from "@/app/api/workspace/specification/route";
import { POST as _addLessonPage, GET as _getLessonPages } from "@/app/api/workspace/page/route";
import RequestBuilder from '@/lib/hooks/builders/request-builder';

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  fetchWorkspaces,
  fetchSpecifications,
  setSelectedWorkspace,
  setSelectedSpecificationId,
  setSelectedPageId,
  updateWorkspaceName,
  addWorkspace,
  removeWorkspace,
  addSpecification,
  updateSpecification,
  updateSpecificationName,
  // updateSpecificationCount,
  deleteSpecification,
  addLessonPage,
  updateLessonPage,
  updateLessonPageTitle,
  fetchLessonPages,
  selectSpecificationsForSelectedWorkspace,
  selectPagesForSelectedWorkspace,
  updateChatLoadingStatus,
  updateQuizItems,
  updateQuizResults,
  selectChatHistoryForSelectedWorkspace,
  fetchWorkspaceChatHistory,
  fetchWorkspaceModules,
  selectModulesForSelectedWorkspace,
  setSelectedModuleId,
  fetchWorkspaceModuleData,
  selectSelectedModuleData,
  setSelectedModuleNodeId,
} from '@/redux/slices/workspaceSlice';
import { RootState } from '@/redux/store';
import { Message, Module, Page, Specification, Workspace } from '@/lib/types/workspace-types';
import { useSocket } from '../useServerEvents';
import { any } from 'zod';

// #region Wokrspace Context Value Interface
export interface WorkspaceContextValue {
  workspaces: Workspace[];
  workspacesInitialized: boolean;
  selectedWorkspace: Workspace | null;
  selectedSpecificationId: string | null;
  selectedModuleId: string | null;
  selectedModuleNodeId: string | null;
  selectedPageId: string | null;
  specifications: Specification[];
  modules: Module[];
  pages: Page[];
  loading: boolean;
  specificationsLoading: boolean;
  pagesLoading: boolean;
  modulesLoading: boolean;
  moduleDataLoading: boolean;
  chatLoading: boolean;
  chatHistory: Message[];
  selectedModuleData: any;
  loadWorkspaceData: (workspaceId: string, currentSelectedWorkspace: Workspace | null) => void;
  loadModuleData: (moduleId: string) => void;
  selectWorkspace: (workspaceId: string | null) => void;
  selectSpecification: (specificationId: string) => void;
  updateWorkspaceName: (workspaceId: string, newName: string) => void;
  addWorkspace: (workspace: Workspace) => void;
  removeWorkspace: (workspaceId: string) => void;
  updateSpecification: (workspaceId: string, specification: Specification) => void;
  updateSpecificationName: (workspaceId: string, specificationId: string, name: string) => void;
  // updateSpecificationCount: (workspaceId: string, specificationId: string, count: number) => void;
  addSpecification: (workspaceId: string, specification: Specification) => void;
  deleteSpecification: (workspaceId: string, specificationId: string) => void;
  addLessonPage: (lessonId: string, page: Page) => void;
  updateLessonPage: (lessonId: string, updatedPage: Page) => void;
  updateLessonPageTitle: (lessonId: string, pageId: string, title: string) => void;
  updateChatStatus: (value: boolean) => void;
  selectModule: (moduleId: string) => void;
  selectModuleNode: (moduleNodeId: string) => void;
  selectPage: (pageId: string) => void;
  updateQuizItems: () => void;
  updateQuizResults: () => void;
}

const defaultValue: WorkspaceContextValue = {
  workspaces: [],
  workspacesInitialized: false,
  selectedWorkspace: null,
  selectedSpecificationId: null,
  selectedModuleId: null,
  selectedModuleNodeId: null,
  selectedPageId: null,
  specifications: [],
  modules: [],
  pages: [],
  loading: false,
  specificationsLoading: false,
  pagesLoading: false,
  modulesLoading: false,
  moduleDataLoading: false,
  chatLoading: false,
  chatHistory: [],
  selectedModuleData: any,
  loadWorkspaceData: () => { },
  loadModuleData: () => { },
  selectWorkspace: () => { },
  selectSpecification: () => { },
  updateWorkspaceName: () => { },
  addWorkspace: () => { },
  removeWorkspace: () => { },
  updateSpecification: () => { },
  updateSpecificationName: () => { },
  // updateSpecificationCount: () => { },
  addSpecification: () => { },
  deleteSpecification: () => { },
  addLessonPage: () => Promise.resolve(),
  updateLessonPage: () => { },
  updateLessonPageTitle: () => { },
  selectModule: () => { },
  selectModuleNode: () => { },
  selectPage: () => { },
  updateChatStatus: () => { },
  updateQuizItems: () => { },
  updateQuizResults: () => { },
};

export const WorkspaceContext = createContext(defaultValue);
export const useWorkspaceContext = () => useContext(WorkspaceContext);

// #region Workspace Provider
export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const dispatch = useAppDispatch();
  const workspaces = useAppSelector((state: RootState) => state.workspace.workspaces);
  const workspacesInitialized = useAppSelector((state: RootState) => state.workspace.workspacesInitialized);
  const selectedWorkspace = useAppSelector((state: RootState) => state.workspace.selectedWorkspace);
  const selectedSpecificationId = useAppSelector((state: RootState) => state.workspace.selectedSpecificationId);
  const selectedModuleId = useAppSelector((state: RootState) => state.workspace.selectedModuleId);
  const selectedModuleNodeId = useAppSelector((state: RootState) => state.workspace.selectedModuleNodeId);
  const selectedPageId = useAppSelector((state: RootState) => state.workspace.selectedPageId);
  const loading = useAppSelector((state: RootState) => state.workspace.loading);
  const specifications = useAppSelector(selectSpecificationsForSelectedWorkspace);
  const specificationsLoading = useAppSelector((state: RootState) => state.workspace.specificationsLoading);
  const modules = useAppSelector(selectModulesForSelectedWorkspace);
  const pages = useAppSelector(selectPagesForSelectedWorkspace);
  const modulesLoading = useAppSelector((state: RootState) => state.workspace.modulesLoading);
  const moduleDataLoading = useAppSelector((state: RootState) => state.workspace.moduleDataLoading);
  const pagesLoading = useAppSelector((state: RootState) => state.workspace.pagesLoading);
  const chatLoading = useAppSelector((state: RootState) => state.workspace.chatLoading);
  const chatHistory = useAppSelector(selectChatHistoryForSelectedWorkspace);
  const selectedModuleData = useAppSelector(selectSelectedModuleData);

  const { socket, socketConnected, joinWorkspaceRoom } = useSocket();

  useEffect(() => {
    dispatch(fetchWorkspaces());
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
    // dispatch(fetchLessonPages(workspaceId)).then((action) => {
    //   if (fetchLessonPages.fulfilled.match(action)) {
    //     const pages = action.payload.pages;
    //     if (pages.length > 0) {
    //       dispatch(setSelectedPageId(pages[0].id));
    //     }
    //   }
    // });
    dispatch(fetchWorkspaceModules(workspaceId)).then((action) => {
      if (fetchWorkspaceModules.fulfilled.match(action)) {
        const modules = action.payload.modules;
        console.log("Workspace modules", modules);
        // if (modules.length > 0) {
        //   dispatch(setSelectedPageId(pages[0].id));
        // }
      }
    });
    
    dispatch(fetchWorkspaceChatHistory(workspaceId));

  };

  const loadModuleData = (moduleId: string) => {
    if (selectedModuleId) {
      // Unload node data from previous selected module to save memory
    }
    console.log("Loading module data in", moduleId);

    if (!selectedModuleId || selectedModuleId !== moduleId) {
      console.log("Setting selected module id", moduleId);
      dispatch(setSelectedModuleId(moduleId));
    }
    dispatch(fetchWorkspaceModuleData(moduleId));
  }

  const selectWorkspace = (workspaceId: string | null) => {
    dispatch(setSelectedWorkspace(workspaceId));
    dispatch(setSelectedModuleId(null));
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

  const updateSpecificationNameHandler = (workspaceId: string, specificationId: string, name: string) => {
    dispatch(updateSpecificationName({ workspaceId, specificationId, name }))
  };

  // const updateSpecificationCountHandler = (workspaceId: string, specificationId: string, count: number) => {
  //   dispatch(updateSpecificationCount({ workspaceId, specificationId, count }))
  // };

  const deleteSpecificationHandler = (workspaceId: string, specificationId: string) => {
    dispatch(deleteSpecification({ workspaceId, specificationId }));
  };

  const addLessonPageHandler = (lessonId: string, page: Page) => {
    dispatch(addLessonPage({ lessonId, page }));
  };

  const updateLessonPageHandler = (lessonId: string, updatedPage: Page) => {
    dispatch(updateLessonPage({ lessonId, updatedPage }));
  };

  const updateLessonPageTitleHandler = (lessonId: string, pageId: string, title: string) => {
    dispatch(updateLessonPageTitle({ lessonId, pageId, title }))
  };

  const selectModule = (moduleId: string | null) => {
    dispatch(setSelectedModuleId(null));
    loadModuleData(moduleId!);
  };

  const selectModuleNode = (moduleNodeId: string | null) => {
    console.log("Selecting module node:", moduleNodeId);
    dispatch(setSelectedModuleNodeId(moduleNodeId));
  };

  const selectPage = (pageId: string) => {
    dispatch(setSelectedPageId(pageId));
  };

  const updateChatLoadingStatusHandler = (value: boolean) => {
    dispatch(updateChatLoadingStatus(value));
  }
  
  const updateQuizItemsHandler = () => {
    dispatch(updateQuizItems())
  }

  const updateQuizReusltsHandler = () => {
    dispatch(updateQuizResults())
  }

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        workspacesInitialized,
        selectedWorkspace,
        selectedSpecificationId,
        selectedModuleId,
        selectedModuleNodeId,
        selectedPageId,
        specifications,
        modules,
        pages,
        loading,
        specificationsLoading,
        pagesLoading,
        modulesLoading,
        moduleDataLoading,
        chatLoading,
        chatHistory,
        selectedModuleData,
        loadWorkspaceData,
        loadModuleData,
        selectWorkspace,
        selectSpecification,
        updateWorkspaceName: updateWorkspaceNameHandler,
        addWorkspace: addWorkspaceHandler,
        removeWorkspace: removeWorkspaceHandler,
        addSpecification: addSpecificationHandler,
        updateSpecification: updateSpecificationHandler,
        updateSpecificationName: updateSpecificationNameHandler,
        // updateSpecificationCount: updateSpecificationCountHandler,
        deleteSpecification: deleteSpecificationHandler,
        addLessonPage: addLessonPageHandler,
        updateLessonPage: updateLessonPageHandler,
        updateLessonPageTitle: updateLessonPageTitleHandler,
        selectModule,
        selectModuleNode,
        selectPage,
        updateQuizItems: updateQuizItemsHandler,
        updateQuizResults: updateQuizReusltsHandler,
        updateChatStatus: updateChatLoadingStatusHandler,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};