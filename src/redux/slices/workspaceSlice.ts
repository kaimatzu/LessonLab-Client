// redux/workspaceSlice.ts
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { GET as getWorkspaces } from '@/app/api/workspace/route';
import { GET as _getSpecifications } from "@/app/api/workspace/specification/route";
import { POST as _addLessonPage, GET as _getLessonPages } from "@/app/api/workspace/page/route";
import { GET as _getChatHistory } from "@/app/api/chat/route"
import RequestBuilder from '@/lib/hooks/builders/request-builder';
import { MessageType, Page, Specification, Workspace, Message } from '@/lib/types/workspace-types';

interface WorkspaceState {
  workspaces: Workspace[];
  workspacesInitialized: boolean;
  selectedWorkspace: Workspace | null;
  selectedSpecificationId: string | null;
  selectedPageId: string | null;
  loading: boolean;
  specificationsLoading: boolean;
  pagesLoading: boolean;
  chatHistoryLoading: boolean,
  chatLoading: boolean;
}

const initialState: WorkspaceState = {
  workspaces: [],
  workspacesInitialized: false,
  selectedWorkspace: null,
  selectedSpecificationId: null,
  selectedPageId: null,
  loading: false,
  specificationsLoading: false,
  pagesLoading: false,
  chatHistoryLoading: false,
  chatLoading: false,
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
      const fetchedWorkspaces = data.map((workspace: any) => ({
        id: workspace.WorkspaceID,
        name: workspace.WorkspaceName,
        createdAt: workspace.CreatedAt,
        chatHistory: [],
        locked: false,
        // workspaceType: workspace.WorkspaceType,
      }));
      return fetchedWorkspaces;
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

export const fetchLessonPages = createAsyncThunk(
  'workspace/fetchLessonPages',
  async (lessonId: string) => {
    const requestBuilder = new RequestBuilder().setURL(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/workspaces/lessons/pages/${lessonId}`);
    const response = await _getLessonPages(requestBuilder).catch(error => {
      console.error("Error fetching lesson pages:", error);
      return null;
    });

    if (response && response.ok) {
      const data = await response.json();
      const pages = data.map((page: any) => ({
        id: page.PageID,
        title: page.PageTitle,
        content: page.Content,
      }));
      return { lessonId, pages };
    }
    return { lessonId, pages: [] };
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
        content: message.Content,
      }));
      return { workspaceId, chatHistory };
    }
    return { workspaceId, chatHistory: [] };
  }
);

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
    setSelectedPageId: (state, action: PayloadAction<string | null>) => {
      state.selectedPageId = action.payload;
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
    addLessonPage: (state, action: PayloadAction<{ lessonId: string, page: Page }>) => {
      const { lessonId, page } = action.payload;
      const workspace = state.workspaces.find(ws => ws.id === lessonId);
      if (workspace) {
        workspace.pages.push(page);
      }
      if (state.selectedWorkspace && state.selectedWorkspace.id === lessonId) {
        state.selectedWorkspace.pages.push(page);
      }
    },
    updateLessonPage: (state, action: PayloadAction<{ lessonId: string, updatedPage: Page }>) => {
      const { lessonId, updatedPage } = action.payload;
      const workspace = state.workspaces.find(ws => ws.id === lessonId);
      if (workspace) {
        const pageIndex = workspace.pages.findIndex(page => page.id === updatedPage.id);
        if (pageIndex > -1) {
          workspace.pages[pageIndex] = updatedPage;
        }
      }
      if (state.selectedWorkspace && state.selectedWorkspace.id === lessonId) {
        const pageIndex = state.selectedWorkspace.pages.findIndex(page => page.id === updatedPage.id);
        if (pageIndex > -1) {
          state.selectedWorkspace.pages[pageIndex] = updatedPage;
        }
      }
    },
    updateLessonPageTitle: (state, action: PayloadAction<{ lessonId: string, pageId: string, title: string }>) => {
      const { lessonId, pageId, title } = action.payload;
      const workspace = state.workspaces.find(ws => ws.id === lessonId);
      if (workspace) {
        const page = workspace.pages.find(page => page.id === pageId);
        if (page) {
          page.title = title;
        }
      }
      if (state.selectedWorkspace && state.selectedWorkspace.id === lessonId) {
        const page = state.selectedWorkspace.pages.find(page => page.id === pageId);
        if (page) {
          page.title = title;
        }
      }
    },
    updateChatLoadingStatus: (state, action: PayloadAction<boolean>) => {
      state.chatLoading = action.payload;
    },
    addChatHistory: (state, action: PayloadAction<{ workspaceId: string, id: string, role: MessageType, content: string }>) => {
      const { workspaceId, id, role, content } = action.payload;
      const workspace = state.workspaces.find(ws => ws.id === workspaceId);
      if (workspace) {
        workspace.chatHistory.push({ id, role, content });
      }
      if (state.selectedWorkspace && state.selectedWorkspace.id === workspaceId) {
        state.selectedWorkspace.chatHistory.push({ id, role, content });
      }
    },
    updateChatMessage: (state, action: PayloadAction<{ workspaceId: string, id: string, content: string }>) => {
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
    // TODO: Implement update of quiz data
    // TODO: Figure out how to store quiz data
    updateQuizItems: () => {

    },
    updateQuizResults: () => {

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
      .addCase(fetchLessonPages.pending, (state) => {
        state.pagesLoading = true;
      })
      .addCase(fetchLessonPages.fulfilled, (state, action: PayloadAction<{ lessonId: string, pages: Page[] }>) => {
        state.pagesLoading = false;
        const { lessonId, pages } = action.payload;
        const workspace = state.workspaces.find(ws => ws.id === lessonId);
        if (workspace) {
          workspace.pages = pages;
        }
        if (state.selectedWorkspace && state.selectedWorkspace.id === lessonId) {
          state.selectedWorkspace.pages = pages;
        }
      })
      .addCase(fetchLessonPages.rejected, (state) => {
        state.pagesLoading = false;
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
  updateChatLoadingStatus,
  addChatHistory,
  updateChatMessage,
  updateQuizItems,
  updateQuizResults,
} = workspaceSlice.actions;

export const selectWorkspaces = (state: RootState) => state.workspace.workspaces;
export const selectWorkspacesInitialized = (state: RootState) => state.workspace.workspacesInitialized;
export const selectSelectedWorkspace = (state: RootState) => state.workspace.selectedWorkspace;
export const selectSelectedSpecificationId = (state: RootState) => state.workspace.selectedSpecificationId;
export const selectSelectedPageId = (state: RootState) => state.workspace.selectedPageId;
export const selectLoading = (state: RootState) => state.workspace.loading;
export const selectSpecificationsLoading = (state: RootState) => state.workspace.specificationsLoading;
export const selectPagesLoading = (state: RootState) => state.workspace.pagesLoading;
export const selectChatHistoryLoading = (state: RootState) => state.workspace.chatHistoryLoading;
export const selectSpecificationsForSelectedWorkspace = (state: RootState) => state.workspace.selectedWorkspace?.specifications || [];
export const selectPagesForSelectedWorkspace = (state: RootState) => state.workspace.selectedWorkspace?.pages || [];
export const selectCurrentSpecification = (state: RootState) => state.workspace.selectedWorkspace?.specifications.find(spec => spec.id === state.workspace.selectedSpecificationId) || null;
export const selectCurrentPage = (state: RootState) => state.workspace.selectedWorkspace?.pages.find(page => page.id === state.workspace.selectedPageId) || null;
export const selectChatHistoryForSelectedWorkspace = (state: RootState) => state.workspace.selectedWorkspace?.chatHistory || [];

export default workspaceSlice.reducer;
