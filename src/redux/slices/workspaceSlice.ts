// redux/workspaceSlice.ts
import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../store';
import {GET as getWorkspaces} from '@/app/api/workspace/route';
import {GET as _getSpecifications} from "@/app/api/workspace/specification/route";
import {GET as _getWorkspaceModules, GET as _getWorkspaceModuleData} from "@/app/api/workspace/module/route";
import {GET as _getChatHistory} from "@/app/api/chat/route"
import RequestBuilder from '@/lib/hooks/builders/request-builder';
import {
  Message,
  MessageRole,
  MessageType,
  Module,
  ModuleNode,
  Specification,
  Workspace
} from '@/lib/types/workspace-types';
import {transformModuleDataToTreeFormat} from '@/components/ui/ui-composite/workspace/material/module-tree/data-processing';
import {current} from 'immer';
import {createSelector} from 'reselect';

interface WorkspaceState {
  workspaces: Workspace[];
  workspacesInitialized: boolean;
  selectedWorkspace: Workspace | null;
  selectedSpecificationId: string | null;
  selectedModuleId: string | null;
  selectedModuleNodeId: string | null;
  loading: boolean;
  specificationsLoading: boolean;
  modulesLoading: boolean;
  moduleDataLoading: boolean;
  chatHistoryLoading: boolean,
  chatLoading: boolean;
  selectedModuleData: any;
}

const initialState: WorkspaceState = {
  workspaces: [],
  workspacesInitialized: false,
  selectedWorkspace: null,
  selectedSpecificationId: null,
  selectedModuleId: null,
  selectedModuleNodeId: null,
  loading: false,
  specificationsLoading: false,
  modulesLoading: false,
  moduleDataLoading: false,
  chatHistoryLoading: false,
  chatLoading: false,
  selectedModuleData: null,
};

export const fetchWorkspaces = createAsyncThunk(
  'workspace/fetchWorkspaces',
  async () => {
    const requestBuilder = new RequestBuilder();
    const response = await getWorkspaces(requestBuilder).catch(error => {
      console.error("Error fetching user's workspaces:", error);
      return null;
    });

    if (response && response.ok) {
      const data = await response.json();
      return data.map((workspace: any) => ({
        id: workspace.WorkspaceID,
        name: workspace.WorkspaceName,
        createdAt: workspace.CreatedAt,
        chatHistory: [],
        locked: false,
        // workspaceType: workspace.WorkspaceType,
      }));
    }
    return [];
  }
);

export const fetchSpecifications = createAsyncThunk(
  'workspace/fetchSpecifications',
  async (workspaceId: string) => {
    const requestBuilder = new RequestBuilder().setURL(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/workspaces/specifications/${workspaceId}`);
    const response = await _getSpecifications(requestBuilder).catch(error => {
      console.error("Error fetching specifications:", error);
      return null;
    });

    if (response && response.ok) {
      const data = await response.json();
      const specifications = data.map((spec: any) => ({
        id: spec.SpecificationID,
        name: spec.Name,
        topic: spec.Topic,
        count: 10,
        writingLevel: spec.WritingLevel,
        comprehensionLevel: spec.ComprehensionLevel,
        additionalSpecs: spec.AdditionalSpecs || [],
      }));
      return { workspaceId, specifications };
    }
    return { workspaceId, specifications: [] };
  }
);

export const fetchWorkspaceModules = createAsyncThunk(
  'workspace/fetchWorkspaceModules',
  async (workspaceId: string) => {
    const requestBuilder = new RequestBuilder().setURL(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/workspaces/modules/${workspaceId}`);
    const response = await _getWorkspaceModules(requestBuilder).catch(error => {
      console.error("Error fetching workspace modules:", error);
      return null;
    });

    if (response && response.ok) {
      const data = await response.json();
      const modules: Module[] = data.map((module: any) => ({
        id: module.ModuleID,
        name: module.Name,
        description: module.Description,
        nodes: []
      }));
      return { workspaceId: workspaceId, modules };
    }
    return { workspaceId: workspaceId, modules: [] };
  }
);

export const fetchWorkspaceModuleData = createAsyncThunk(
  'workspace/fetchWorkspaceModuleData',
  async (moduleRootNodeId: string) => {
    const requestBuilder = new RequestBuilder().setURL(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/workspaces/modules/root/${moduleRootNodeId}`);
    const response = await _getWorkspaceModuleData(requestBuilder).catch(error => {
      console.error("Error fetching workspace modules:", error);
      return null;
    });

    if (response && response.ok) {
      const data = await response.json();
      return { moduleId: moduleRootNodeId, moduleData: data };
    }
    return { moduleId: moduleRootNodeId, moduleData: null };
  }
);

export const fetchWorkspaceChatHistory = createAsyncThunk(
  'workspace/fetchWorkspaceChatHistory',
  async (workspaceId: string) => {
    const requestBuilder = new RequestBuilder().setURL(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/assistant/${workspaceId}`);
    const response = await _getChatHistory(requestBuilder).catch(error => {
      console.error("Error fetching chat history:", error);
      return null;
    });

    if (response && response.ok) {
      const data = await response.json();
      const chatHistory = data.map((message: any) => ({
        id: message.MessageID,
        role: message.Role,
        type: message.Type,
        content: message.Content,
      }));
      return { workspaceId, chatHistory };
    }
    return { workspaceId, chatHistory: [] };
  }
);

const parseContent = (content: string) => {
  let parsedContent = content.trim();
  parsedContent = parsedContent.replace(/\\n/g, '\n');
  return parsedContent;
};

// Helper function to recursively find a node by ID
const findNode = (nodes: ModuleNode[], nodeId: string): ModuleNode | undefined => {
  for (const node of nodes) {
    if (node.id === nodeId) {
      return node; // Node found
    }
    const foundInChildren = findNode(node.children, nodeId);
    if (foundInChildren) {
      return foundInChildren; // Node found in children
    }
  }
  return undefined; // Node not found
};

// Helper function to remove a node from the nodes array
const removeNode = (nodes: ModuleNode[], nodeId: string): boolean => {
  // Find the index of the node to delete
  const index = nodes.findIndex(node => node.id === nodeId);
  if (index !== -1) {
    // Remove the node from the array
    nodes.splice(index, 1);
    return true; // Node was found and deleted
  }

  // If the node is not found, check children of each node
  for (const node of nodes) {
    // If node has children, recursively search in the children
    const childIndex = removeNode(node.children, nodeId);
    if (childIndex) {
      return true; // Node was found and deleted in children
    }
  }
  return false; // Node not found in this level and its children
};

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    setSelectedWorkspace: (state, action: PayloadAction<string | null>) => {
      const workspaceId = action.payload;
      state.selectedWorkspace = workspaceId ? state.workspaces.find(workspace => workspace.id === workspaceId) || null : null;
    },
    setSelectedSpecificationId: (state, action: PayloadAction<string | null>) => {
      state.selectedSpecificationId = action.payload;
    },
    setSelectedModuleId: (state, action: PayloadAction<string | null>) => {
      state.selectedModuleId = action.payload;
    },
    setSelectedModuleNodeId: (state, action: PayloadAction<string | null>) => {
      state.selectedModuleNodeId = action.payload;
    },
    updateWorkspaceName: (state, action: PayloadAction<{ workspaceId: string, newName: string }>) => {
      const { workspaceId, newName } = action.payload;
      const workspace = state.workspaces.find(ws => ws.id === workspaceId);
      if (workspace) {
        workspace.name = newName;
      }
      if (state.selectedWorkspace && state.selectedWorkspace.id === workspaceId) {
        state.selectedWorkspace.name = newName;
      }
    },
    addWorkspace: (state, action: PayloadAction<Workspace>) => {
      state.workspaces.push(action.payload);
    },
    removeWorkspace: (state, action: PayloadAction<string>) => {
      state.workspaces = state.workspaces.filter(workspace => workspace.id !== action.payload);
    },
    addSpecification: (state, action: PayloadAction<{ workspaceId: string, specification: Specification }>) => {
      const { workspaceId, specification } = action.payload;
      const workspace = state.workspaces.find(ws => ws.id === workspaceId);
      if (workspace) {
        workspace.specifications.push(specification);
      }
      if (state.selectedWorkspace && state.selectedWorkspace.id === workspaceId) {
        state.selectedWorkspace.specifications.push(specification);
      }
    },
    updateSpecification: (state, action: PayloadAction<{ workspaceId: string, specification: Specification }>) => {
      const { workspaceId, specification } = action.payload;
      const workspace = state.workspaces.find(ws => ws.id === workspaceId);
      if (workspace && workspace.specifications) {
        const specIndex = workspace.specifications.findIndex(spec => spec.id === specification.id);
        if (specIndex > -1) {
          workspace.specifications[specIndex] = specification;
        }
      }
      if (state.selectedWorkspace && state.selectedWorkspace.id === workspaceId && state.selectedWorkspace.specifications) {
        const specIndex = state.selectedWorkspace.specifications.findIndex(spec => spec.id === specification.id);
        if (specIndex > -1) {
          state.selectedWorkspace.specifications[specIndex] = specification;
        }
      }
    },
    updateSpecificationName: (state, action: PayloadAction<{ workspaceId: string, specificationId: string, name: string }>) => {
      const { workspaceId, specificationId, name } = action.payload;
      const workspace = state.workspaces.find(ws => ws.id === workspaceId);
      if (workspace) {
        const spec = workspace.specifications.find(spec => spec.id === specificationId);
        if (spec) {
          spec.name = name;
        }
      }
      if (state.selectedWorkspace && state.selectedWorkspace.id === workspaceId) {
        const spec = state.selectedWorkspace.specifications.find(spec => spec.id === specificationId);
        if (spec) {
          spec.name = name;
        }
      }
    },
    // updateSpecificationCount: (state, action: PayloadAction<{ workspaceId: string, specificationId: string, count: number }>) => {
    //   const { workspaceId, specificationId, count } = action.payload;
    //   const workspace = state.workspaces.find(ws => ws.id === workspaceId);
    //   if (workspace) {
    //     if (workspace.workspaceType === 'LESSON') {
    //       return
    //     }
    //     const spec = workspace.specifications.find(spec => spec.id === specificationId);
    //     if (spec) {
    //       spec.count = count;
    //     }
    //   }
    //   if (state.selectedWorkspace && state.selectedWorkspace.id === workspaceId) {
    //     if (state.selectedWorkspace.workspaceType === 'LESSON') {
    //       return
    //     }
    //     const spec = state.selectedWorkspace.specifications.find(spec => spec.id === specificationId);
    //     if (spec) {
    //       spec.count = count;
    //     }
    //   }
    // },
    deleteSpecification: (state, action: PayloadAction<{ workspaceId: string, specificationId: string }>) => {
      const { workspaceId, specificationId } = action.payload;
      const workspace = state.workspaces.find(ws => ws.id === workspaceId);
      if (workspace) {
        workspace.specifications = workspace.specifications.filter(spec => spec.id !== specificationId);
      }
      if (state.selectedWorkspace && state.selectedWorkspace.id === workspaceId) {
        state.selectedWorkspace.specifications = state.selectedWorkspace.specifications.filter(spec => spec.id !== specificationId);
      }
    },
    updateChatLoadingStatus: (state, action: PayloadAction<boolean>) => {
      state.chatLoading = action.payload;
    },
    addChatHistory: (state, action: PayloadAction<{ workspaceId: string, id: string, role: MessageRole, type: MessageType, content: string }>) => {
      const { workspaceId, id, role, type, content } = action.payload;
      const workspace = state.workspaces.find(ws => ws.id === workspaceId);
      if (workspace) {
        workspace.chatHistory.push({ id, role, type, content });
      }
      if (state.selectedWorkspace && state.selectedWorkspace.id === workspaceId) {
        state.selectedWorkspace.chatHistory.push({ id, role, type, content });
      }
    },
    updateChatMessage: (state, action: PayloadAction<{ workspaceId: string, id: string, contentDelta: string }>) => {
      const { workspaceId, id, contentDelta: content } = action.payload;
      const workspace = state.workspaces.find(ws => ws.id === workspaceId);
      if (workspace) {
        const message = workspace.chatHistory.find(ch => ch.id === id);
        if (message) message.content += content;
      }
      if (state.selectedWorkspace && state.selectedWorkspace.id === workspaceId) {
        const message = state.selectedWorkspace.chatHistory.find(ch => ch.id === id);
        if (message) message.content += content;
      }
    },
    replaceChatMessage: (state, action: PayloadAction<{ workspaceId: string, id: string, content: string }>) => {
      const { workspaceId, id, content } = action.payload;
      const workspace = state.workspaces.find(ws => ws.id === workspaceId);
      if (workspace) {
        const message = workspace.chatHistory.find(ch => ch.id === id);
        if (message) message.content = content;
      }
      if (state.selectedWorkspace && state.selectedWorkspace.id === workspaceId) {
        const message = state.selectedWorkspace.chatHistory.find(ch => ch.id === id);
        if (message) message.content = content;
      }
    },
    addModule: (state, action: PayloadAction<{ workspaceId: string, module: Module }>) => {
      const { workspaceId, module } = action.payload;
      const workspace = state.workspaces.find(ws => ws.id === workspaceId);
      if (workspace) {
        workspace.modules.push(module);
      }
      if (state.selectedWorkspace && state.selectedWorkspace.id === workspaceId) {
        state.selectedWorkspace.modules.push(module);
      }
    },
    updateModuleName: (state, action: PayloadAction<{ workspaceId: string; moduleId: string; newName: string }>) => {
      const { workspaceId, moduleId, newName } = action.payload;
      const workspace = state.workspaces.find(ws => ws.id === workspaceId);

      if (workspace) {
        const md = workspace.modules.find(mod => mod.id === moduleId);

        if (md) {
          md.name = newName;
        }
      }

      if (state.selectedWorkspace && state.selectedWorkspace.id === workspaceId) {
        const selectedModule = state.selectedWorkspace.modules.find(mod => mod.id === moduleId);

        if (selectedModule) {
          selectedModule.name = newName;
        }
      }
    },
    deleteModule: (state, action: PayloadAction<{ workspaceId: string; moduleId: string }>) => {
      const { workspaceId, moduleId } = action.payload;

      // Find the workspace
      const workspace = state.workspaces.find(ws => ws.id === workspaceId);

      if (workspace) {
        // Find the index of the module to delete
        const moduleIndex = workspace.modules.findIndex(mod => mod.id === moduleId);

        // If the module exists, remove it
        if (moduleIndex !== -1) {
          workspace.modules.splice(moduleIndex, 1);
        }
      }

      // Optionally, also remove from selectedWorkspace if it is the current workspace
      if (state.selectedWorkspace && state.selectedWorkspace.id === workspaceId) {
        const selectedModuleIndex = state.selectedWorkspace.modules.findIndex(mod => mod.id === moduleId);

        if (selectedModuleIndex !== -1) {
          state.selectedWorkspace.modules.splice(selectedModuleIndex, 1);
        }
      }
    },
    insertNode: (state, action: PayloadAction<{ workspaceId: string; moduleId: string; newNode: ModuleNode }>) => {
      const { workspaceId, moduleId, newNode } = action.payload;

      // Find the workspace
      const workspace = state.workspaces.find(ws => ws.id === workspaceId);

      if (workspace) {
        // Find the module
        const md = workspace.modules.find(md => md.id === moduleId);

        if (md) {
          if (newNode.parent) {
            // If the new node has a parent, find the parent node and insert as a child
            const parentNode = findNode(md.nodes, newNode.parent);
            if (parentNode) {
              parentNode.children.push(newNode);
            } else {
              console.error("Parent node not found");
            }
          } else {
            // If no parent, push it as a top-level node
            md.nodes.push(newNode);
          }
        } else {
          console.error("Module not found");
        }
      } else {
        console.error("Workspace not found");
      }

      // Optionally, also insert the node into the selected workspace if it matches
      if (state.selectedWorkspace && state.selectedWorkspace.id === workspaceId) {
        const selectedModule = state.selectedWorkspace.modules.find(md => md.id === moduleId);

        if (selectedModule) {
          if (newNode.parent) {
            const selectedParentNode = findNode(selectedModule.nodes, newNode.parent);
            if (selectedParentNode) {
              selectedParentNode.children.push(newNode);
            } else {
              console.error("Parent node not found in selected workspace");
            }
          } else {
            selectedModule.nodes.push(newNode);
          }
        }
      }
    },
    deleteNode: (state, action: PayloadAction<{ workspaceId: string; moduleId: string; nodeId: string }>) => {
      const { workspaceId, moduleId, nodeId } = action.payload;

      // Helper function to recursively search and delete a node
      const deleteNodeRecursively = (nodes: ModuleNode[], nodeIdToDelete: string): boolean => {
        const index = nodes.findIndex(node => node.id === nodeIdToDelete);
        if (index !== -1) {
          nodes.splice(index, 1); // Remove the node from the array
          return true; // Node was found and deleted
        }

        // Check children of each node
        for (const node of nodes) {
          if (deleteNodeRecursively(node.children, nodeIdToDelete)) {
            return true; // Node was found and deleted in children
          }
        }
        return false; // Node not found
      };

      // Find the workspace
      const workspace = state.workspaces.find(ws => ws.id === workspaceId);

      if (workspace) {
        // Find the module
        const md = workspace.modules.find(md => md.id === moduleId);

        if (md) {
          const success = deleteNodeRecursively(md.nodes, nodeId); // Start recursive deletion
          if (!success) {
            console.error("Node not found");
          }
        } else {
          console.error("Module not found");
        }
      } else {
        console.error("Workspace not found");
      }

      // Optionally, also delete the node from the selected workspace if it matches
      if (state.selectedWorkspace && state.selectedWorkspace.id === workspaceId) {
        const selectedModule = state.selectedWorkspace.modules.find(md => md.id === moduleId);

        if (selectedModule) {
          const success = deleteNodeRecursively(selectedModule.nodes, nodeId); // Start recursive deletion
          if (!success) {
            console.error("Node not found in selected workspace");
          }
        }
      }
    },
    transferNode: (state, action: PayloadAction<{ workspaceId: string; moduleId: string; nodeId: string; targetParentId: string | null; relativeIndex:
          number }>) => {
      const { workspaceId, moduleId, nodeId, targetParentId, relativeIndex } = action.payload;

      const workspace = state.workspaces.find(ws => ws.id === workspaceId);

      if (workspace) {
        const module = workspace.modules.find(md => md.id === moduleId);

        if (module) {
          // Step 1: Find the node to be moved
          const nodeToMove = findNode(module.nodes, nodeId);

          if (nodeToMove) {
            // Step 2: Remove the node from its current parent
            removeNode(module.nodes, nodeId);

            // Step 3: Set the new parent
            nodeToMove.parent = targetParentId;

            // Step 4: Insert the node into the new parent's children
            if (targetParentId) {
              const targetParentNode = findNode(module.nodes, targetParentId);
              if (targetParentNode) {
                // Add the node as a child of the target parent
                if (!targetParentNode.children) {
                  targetParentNode.children = [];
                }
                // Insert at the specified relative index
                targetParentNode.children.splice(relativeIndex, 0, nodeToMove);
              } else {
                console.error("Target parent node not found");
              }
            } else {
              // If targetParentId is null, push to the top level
              module.nodes.splice(relativeIndex, 0, nodeToMove);
            }
          } else {
            console.error("Node to move not found");
          }
        } else {
          console.error("Module not found");
        }
      } else {
        console.error("Workspace not found");
      }

      console.log("Updated Workspace Data via transfer");

      // Optionally, also update the selected workspace if it matches
      if (state.selectedWorkspace && state.selectedWorkspace.id === workspaceId) {
        const selectedModule = state.selectedWorkspace.modules.find(md => md.id === moduleId);
        if (selectedModule) {
          const selectedNodeToMove = findNode(selectedModule.nodes, nodeId);
          if (selectedNodeToMove) {
            removeNode(selectedModule.nodes, nodeId);
            selectedNodeToMove.parent = targetParentId;
            if (targetParentId) {
              const selectedTargetParentNode = findNode(selectedModule.nodes, targetParentId);
              if (selectedTargetParentNode) {
                if (!selectedTargetParentNode.children) {
                  selectedTargetParentNode.children = [];
                }
                selectedTargetParentNode.children.splice(relativeIndex, 0, selectedNodeToMove);
              }
            } else {
              selectedModule.nodes.splice(relativeIndex, 0, selectedNodeToMove);
            }
          }
        }
      }

      console.log("Updated Selected Workspace Data via transfer");
    },
    replaceModuleNodeContent: (state, action: PayloadAction<{ workspaceId: string, moduleId: string, moduleNodeId: string, content: string }>) => {
      const { workspaceId, moduleId, moduleNodeId, content } = action.payload;
    
      // Recursive function to find and update the node content
      const findAndUpdateNode = (nodes: ModuleNode[], nodeId: string, newContent: string): boolean => {
        for (const node of nodes) {
          if (node.id === nodeId) {
            node.content = parseContent(newContent); // Update the content if the node is found
            return true;
          }
          if (node.children && node.children.length > 0) {
            if (findAndUpdateNode(node.children, nodeId, newContent)) {
              return true; // Return true if the node is found in the children
            }
          }
        }
        return false;
      };
    
      const workspace = state.workspaces.find(ws => ws.id === workspaceId);
      if (workspace) {
        const md = workspace.modules.find(md => md.id === moduleId);
        if (md) {
          const success = findAndUpdateNode(md.nodes, moduleNodeId, content); // Traverse and update the content
          if (!success) {
            console.error("Replacing module node content failed. Module node not found");
          }
        } else {
          console.error("Replacing module node content failed. Module not found");
        }
      }
    
      if (state.selectedWorkspace && state.selectedWorkspace.id === workspaceId) {
        const md = state.selectedWorkspace.modules.find(md => md.id === moduleId);
        if (md) {
          const success = findAndUpdateNode(md.nodes, moduleNodeId, content); // Traverse and update the content
          if (!success) {
            console.error("Replacing module node content failed. Module node not found");
          }
        } else {
          console.error("Replacing module node content failed. Module not found");
        }
      }
    },
    replaceModuleNodeTitle: (state, action: PayloadAction<{ workspaceId: string, moduleId: string, moduleNodeId: string, name: string }>) => {
      const { workspaceId, moduleId, moduleNodeId, name } = action.payload;

      console.log("Redux node name:", workspaceId, moduleId, moduleNodeId, name);

      // Recursive function to find and update the node content
      const findAndUpdateNode = (nodes: ModuleNode[], nodeId: string, newTitle: string): boolean => {
        for (const node of nodes) {
          if (node.id === nodeId) {
            node.name = newTitle;
            return true;
          }
          if (node.children && node.children.length > 0) {
            if (findAndUpdateNode(node.children, nodeId, newTitle)) {
              return true; // Return true if the node is found in the children
            }
          }
        }
        return false;
      };

      const workspace = state.workspaces.find(ws => ws.id === workspaceId);
      if (workspace) {
        const md = workspace.modules.find(md => md.id === moduleId);
        if (md) {
          const success = findAndUpdateNode(md.nodes, moduleNodeId, name); // Traverse and update the content
          if (!success) {
            console.error("Replacing module node name failed. Module node not found");
          }
        } else {
          console.error("Replacing module node name failed. Module not found");
        }
      }

      if (state.selectedWorkspace && state.selectedWorkspace.id === workspaceId) {
        const md = state.selectedWorkspace.modules.find(md => md.id === moduleId);
        if (md) {
          const success = findAndUpdateNode(md.nodes, moduleNodeId, name); // Traverse and update the name
          if (!success) {
            console.error("Replacing module node name failed. Module node not found");
          }
        } else {
          console.error("Replacing module node name failed. Module not found");
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkspaces.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWorkspaces.fulfilled, (state, action: PayloadAction<Workspace[]>) => {
        state.loading = false;
        state.workspaces = action.payload;
        state.workspacesInitialized = true;
      })
      .addCase(fetchWorkspaces.rejected, (state) => {
        state.loading = false;
        state.workspacesInitialized = true;
      })
      .addCase(fetchSpecifications.pending, (state) => {
        state.specificationsLoading = true;
      })
      .addCase(fetchSpecifications.fulfilled, (state, action: PayloadAction<{ workspaceId: string, specifications: Specification[] }>) => {
        state.specificationsLoading = false;
        const { workspaceId, specifications } = action.payload;
        const workspace = state.workspaces.find(ws => ws.id === workspaceId);
        if (workspace) {
          workspace.specifications = specifications;
        }
        if (state.selectedWorkspace && state.selectedWorkspace.id === workspaceId) {
          state.selectedWorkspace.specifications = specifications;
        }
      })
      .addCase(fetchSpecifications.rejected, (state) => {
        state.specificationsLoading = false;
      })
      .addCase(fetchWorkspaceModules.pending, (state) => {
        state.modulesLoading = true;
      })
      .addCase(fetchWorkspaceModules.fulfilled, (state, action: PayloadAction<{ workspaceId: string, modules: Module[] }>) => {
        state.modulesLoading = false;
        const { workspaceId, modules } = action.payload;
        const workspace = state.workspaces.find(ws => ws.id === workspaceId);
        if (workspace) {
          workspace.modules = modules;
        }
        if (state.selectedWorkspace && state.selectedWorkspace.id === workspaceId) {
          state.selectedWorkspace.modules = modules;
        }
      })
      .addCase(fetchWorkspaceModules.rejected, (state) => {
        state.modulesLoading = false;
      })
      .addCase(fetchWorkspaceModuleData.pending, (state) => {
        state.moduleDataLoading = true;
      })
      .addCase(fetchWorkspaceModuleData.fulfilled, (state, action: PayloadAction<{ moduleId: string, moduleData: any }>) => {
        state.moduleDataLoading = false;
        const { moduleId, moduleData } = action.payload;
        state.selectedModuleData = moduleData.tree;

        const parseNodeRecursively = (node: ModuleNode): ModuleNode => {
          return {
            ...node,
            content: parseContent(node.content), 
            children: node.children.length > 0 ? node.children.map(parseNodeRecursively) : [] 
          };
        };

        const workspace = state.workspaces.find(ws => ws.id === moduleData.WorkspaceID);
        if (workspace) {
          const md = workspace.modules.find((md => md.id === moduleId));
          
          if (md) {
            if (moduleData.retrievalSource === 'database') {
              const data = transformModuleDataToTreeFormat(md, moduleData.tree);
              md.nodes = data[0].nodes;
            } else { // 'buffer'

              md.id = moduleData.tree.id;
              md.name = moduleData.tree.name;
              md.description = moduleData.tree.description;
      
              md.nodes = moduleData.tree.nodes.map(parseNodeRecursively);
            }
          }

          console.log("Module loaded:", JSON.stringify(current(md), null, 2));
        }
        if (state.selectedWorkspace && state.selectedWorkspace.id === moduleData.WorkspaceID) {
          const md = state.selectedWorkspace.modules.find(md => md.id === moduleId);
          if (md) {
            if (moduleData.retrievalSource === 'database') {
              const data = transformModuleDataToTreeFormat(md, moduleData.tree);
              md.nodes = data[0].nodes;
            } else { // 'buffer'
              md.id = moduleData.tree.id;
              md.name = moduleData.tree.name;
              md.description = moduleData.tree.description;

              md.nodes = moduleData.tree.nodes.map(parseNodeRecursively);
            }
          }
          
          console.log("Module loaded:", JSON.stringify(current(md), null, 2));
        }
      })
      .addCase(fetchWorkspaceModuleData.rejected, (state) => {
        state.moduleDataLoading = false;
      })
      .addCase(fetchWorkspaceChatHistory.pending, (state) => {
        state.chatHistoryLoading = true;
      })
      .addCase(fetchWorkspaceChatHistory.fulfilled, (state, action: PayloadAction<{ workspaceId: string, chatHistory: Message[] }>) => {
        state.chatHistoryLoading = false;
        const { workspaceId, chatHistory } = action.payload;
        const workspace = state.workspaces.find(ws => ws.id === workspaceId);
        console.log("Chat history: ", chatHistory);
        if (workspace) {
          workspace.chatHistory = chatHistory;
        }
        if (state.selectedWorkspace && state.selectedWorkspace.id === workspaceId) {
          state.selectedWorkspace.chatHistory = chatHistory;
        }
      })
      .addCase(fetchWorkspaceChatHistory.rejected, (state) => {
        state.chatHistoryLoading = false;
      });
  },
});

export const {
  setSelectedWorkspace,
  setSelectedSpecificationId,
  setSelectedModuleId,
  setSelectedModuleNodeId,
  updateWorkspaceName,
  addWorkspace,
  removeWorkspace,
  addSpecification,
  updateSpecification,
  updateSpecificationName,
  // updateSpecificationCount,
  deleteSpecification,
  updateChatLoadingStatus,
  addChatHistory,
  updateChatMessage,
  replaceChatMessage,
  addModule,
  updateModuleName,
  deleteModule,
  insertNode,
  deleteNode,
  transferNode,
  replaceModuleNodeContent,
  replaceModuleNodeTitle,
} = workspaceSlice.actions;

// Directly return the input when no transformation is needed
export const selectWorkspaces = (state: RootState) => state.workspace.workspaces;
export const selectWorkspacesInitialized = (state: RootState) => state.workspace.workspacesInitialized;
export const selectSelectedWorkspace = (state: RootState) => state.workspace.selectedWorkspace;
export const selectSelectedSpecificationId = (state: RootState) => state.workspace.selectedSpecificationId;
export const selectLoading = (state: RootState) => state.workspace.loading;
export const selectSpecificationsLoading = (state: RootState) => state.workspace.specificationsLoading;
export const selectChatHistoryLoading = (state: RootState) => state.workspace.chatHistoryLoading;

// Only memoize if transformations or derived data is necessary

// Memoized selector for specifications in the selected workspace
export const selectSpecificationsForSelectedWorkspace = createSelector(
  (state: RootState) => state.workspace.selectedWorkspace?.specifications,
  (specifications) => specifications || []
);

// Memoized selector for modules in the selected workspace
export const selectModulesForSelectedWorkspace = createSelector(
  (state: RootState) => state.workspace.selectedWorkspace?.modules,
  (modules) => modules || []
);

// Memoized selector for the current specification based on the selected specification ID
export const selectCurrentSpecification = createSelector(
  (state: RootState) => state.workspace.selectedWorkspace?.specifications || [],
  (state: RootState) => state.workspace.selectedSpecificationId,
  (specifications, selectedSpecificationId) =>
    specifications.find((spec) => spec.id === selectedSpecificationId) || null
);

// Memoized selector for selected module data
export const selectSelectedModuleData = createSelector(
  (state: RootState) => state.workspace.selectedModuleData,
  (selectedModuleData) => selectedModuleData || null
);

// Memoized selector for chat history in the selected workspace
export const selectChatHistoryForSelectedWorkspace = createSelector(
  (state: RootState) => state.workspace.selectedWorkspace?.chatHistory,
  (chatHistory) => chatHistory || []
);

export const selectSelectedWorkspaceModuleContent = createSelector(
  [
    (state: RootState) => state.workspace.selectedWorkspace,
    (state: RootState) => state.workspace.selectedModuleId,
    (state: RootState) => state.workspace.selectedModuleNodeId,
  ],
  (selectedWorkspace, selectedModuleId, selectedModuleNodeId): [string, string] | null => {
    if (!selectedWorkspace || !selectedModuleId || !selectedModuleNodeId) {
      console.error("All id fields are required to select module content.");
      return null;
    }

    const md = selectedWorkspace.modules.find(module => module.id === selectedModuleId);
    
    if (!md) {
      console.error("Module not found.");
      return null;
    }

    // Recursive function to find the node content
    const findNodeContent = (nodes: ModuleNode[], nodeId: string): [string, string] | null => {
      for (const node of nodes) {
        if (node.id === nodeId) {
          return [node.id, node.content];
        }
        if (node.children && node.children.length > 0) {
          const content = findNodeContent(node.children, nodeId); // Recursive call
          if (content !== null) {
            return content;
          }
        }
      }
      return null; // Return null if node is not found
    };

    // Start recursive search from the root nodes of the module
    const nodeContent = findNodeContent(md.nodes, selectedModuleNodeId);
    
    return nodeContent || null; 
  }
);

export default workspaceSlice.reducer;
