// client/src/lib/hooks/workspace-context.tsx
import React, { createContext, useEffect, useContext } from 'react';
// import { GET as _getSpecifications } from "@/app/api/workspace/specification/route";

import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  fetchWorkspaces,
  fetchSpecifications,
  setSelectedWorkspace,
  setSelectedSpecificationId,
  updateWorkspaceName,
  addWorkspace,
  removeWorkspace,
  addSpecification,
  updateSpecification,
  updateSpecificationName,
  // updateSpecificationCount,
  deleteSpecification,
  selectSpecificationsForSelectedWorkspace,
  updateChatLoadingStatus,
  selectChatHistoryForSelectedWorkspace,
  fetchWorkspaceChatHistory,
  fetchWorkspaceModules,
  selectModulesForSelectedWorkspace,
  setSelectedModuleId,
  fetchWorkspaceModuleData,
  selectSelectedModuleData,
  setSelectedModuleNodeId, updateModuleName, deleteModule, addModule, replaceModuleNodeTitle, insertNode, deleteNode, transferNode,
} from '@/redux/slices/workspaceSlice';
import { RootState } from '@/redux/store';
import {Message, Module, ModuleNode, Specification, Workspace} from '@/lib/types/workspace-types';
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
  specifications: Specification[];
  modules: Module[];
  loading: boolean;
  specificationsLoading: boolean;
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
  updateChatStatus: (value: boolean) => void;
  addModule: (workspaceId: string, module: Module) => void;
  selectModule: (moduleId: string | null) => void;
  updateModuleName: (moduleId: string, workspaceId: string, newName: string) => void;
  deleteModule: (moduleId: string, workspaceId: string) => void;
  insertModuleNode: (workspaceId: string, moduleId: string, newNode: ModuleNode) => void;
  removeModuleNode: (workspaceId: string, moduleId: string, nodeId: string) => void;
  transferModuleNode: (workspaceId: string, moduleId: string, nodeId: string, targetParentId: string | null, relativeIndex: number) => void;
  selectModuleNode: (moduleNodeId: string | null) => void;
  updateModuleNodeName: (moduleId: string, moduleNodeId: string, workspaceId: string, name: string) => void;
}

const defaultValue: WorkspaceContextValue = {
  workspaces: [],
  workspacesInitialized: false,
  selectedWorkspace: null,
  selectedSpecificationId: null,
  selectedModuleId: null,
  selectedModuleNodeId: null,
  specifications: [],
  modules: [],
  loading: false,
  specificationsLoading: false,
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
  addModule: () => { },
  selectModule: () => { },
  updateModuleName: () => { },
  deleteModule: () => { },
  insertModuleNode: () => { },
  removeModuleNode: () => { },
  transferModuleNode: () => { },
  selectModuleNode: () => { },
  updateModuleNodeName: () => { },
  updateChatStatus: () => { },
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
  const loading = useAppSelector((state: RootState) => state.workspace.loading);
  const specifications = useAppSelector(selectSpecificationsForSelectedWorkspace);
  const specificationsLoading = useAppSelector((state: RootState) => state.workspace.specificationsLoading);
  const modules = useAppSelector(selectModulesForSelectedWorkspace);
  const modulesLoading = useAppSelector((state: RootState) => state.workspace.modulesLoading);
  const moduleDataLoading = useAppSelector((state: RootState) => state.workspace.moduleDataLoading);
  const chatLoading = useAppSelector((state: RootState) => state.workspace.chatLoading);
  const chatHistory = useAppSelector(selectChatHistoryForSelectedWorkspace);
  const selectedModuleData = useAppSelector(selectSelectedModuleData);

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
      // TODO: Unload node data from previous selected module to save memory
    }
    console.log("Loading module data in", moduleId);

    if (!selectedModuleId || selectedModuleId !== moduleId) {
      console.log("Setting selected module id", moduleId);
      dispatch(setSelectedModuleId(moduleId));
    }

    if(moduleId) {
      dispatch(fetchWorkspaceModuleData(moduleId));
    }
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

  const deleteSpecificationHandler = (workspaceId: string, specificationId: string) => {
    dispatch(deleteSpecification({ workspaceId, specificationId }));
  };

  const createModule = (workspaceId: string, module: Module) => {
    dispatch(addModule({ workspaceId, module }));
  };

  const selectModule = (moduleId: string | null) => {
    dispatch(setSelectedModuleId(moduleId));
    // dispatch(setSelectedModuleNodeId(moduleId));
    loadModuleData(moduleId!);
  };

  const changeModuleName = (moduleId: string, workspaceId: string, newName: string) => {
    dispatch(updateModuleName({ moduleId, workspaceId, newName }));
  };

  const removeModule = (moduleId: string, workspaceId: string) => {
    dispatch(deleteModule({ moduleId, workspaceId }));
  };

  const insertModuleNode = (workspaceId: string, moduleId: string, newNode: ModuleNode) => {
    dispatch(insertNode({ workspaceId, moduleId, newNode }));
  };

  const removeModuleNode = (workspaceId: string, moduleId: string, nodeId: string) => {
    dispatch(deleteNode({ workspaceId, moduleId, nodeId }));
  };

  const transferModuleNode = (workspaceId: string, moduleId: string, nodeId: string, targetParentId: string | null, relativeIndex: number) => {
    dispatch(transferNode({ workspaceId, moduleId, nodeId, targetParentId, relativeIndex }));
  };

  const selectModuleNode = (moduleNodeId: string | null) => {
    dispatch(setSelectedModuleNodeId(moduleNodeId));
  };

  const updateModuleNodeTitle = (moduleId: string, moduleNodeId: string, workspaceId: string, name: string) => {
    dispatch(replaceModuleNodeTitle({ workspaceId, moduleId, moduleNodeId, name }));
  }

  const updateChatLoadingStatusHandler = (value: boolean) => {
    dispatch(updateChatLoadingStatus(value));
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        workspacesInitialized,
        selectedWorkspace,
        selectedSpecificationId,
        selectedModuleId,
        selectedModuleNodeId,
        specifications,
        modules,
        loading,
        specificationsLoading,
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
        insertModuleNode,
        removeModuleNode,
        transferModuleNode,
        addModule: createModule,
        selectModule,
        updateModuleName: changeModuleName,
        deleteModule: removeModule,
        selectModuleNode,
        updateModuleNodeName: updateModuleNodeTitle,
        updateChatStatus: updateChatLoadingStatusHandler,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};