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
  // getSpecifications: (workspaceId: string) => Promise<Specification[]>;
  addSpecification: (workspaceId: string, specification: Specification) => void;
  deleteSpecification: (workspaceId: string, specificationId: string) => void;
  // getLessonPages: (lessonId: string) => Promise<Page[]>;
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
  loadWorkspaceData: () => {},
  selectWorkspace: () => {},
  selectSpecification: () => {},
  updateWorkspaceName: () => {},
  addWorkspace: () => {},
  removeWorkspace: () => {},
  updateSpecification: () => {},
  // getSpecifications: async (): Promise<Specification[]> => {
  //   return [];
  // },
  addSpecification: () => {},
  deleteSpecification: () => {},
  // getLessonPages: async(): Promise<Page[]> => {
  //   return []
  // },
  addLessonPage: () => Promise.resolve(),
  updateLessonPage: () => {},
  selectPage: () => {},
};

// export const WorkspaceMaterialContext = createContext<WorkspaceMaterialContextValue>(defaultValue);
// export const useWorkspaceMaterialContext = () => useContext(WorkspaceMaterialContext);

// export const WorkspaceMaterialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
//   const [workspacesInitialized, setWorkspacesInitialized] = useState(false);
//   const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  
//   const [selectedSpecificationId, setSelectedSpecificationId] = useState<string | null>(null);
//   const [materialSpecificationsInitialized, setMaterialSpecificationsInitialized] = useState(false);

//   const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
//   const [lessonPagesInitialized, setLessonPagesInitialized] = useState(false);

//   ///////////////////////
//   const [fetchingSpecifications, setFetchingSpecifications] = useState(true);
//   const [fetchingLessonPages, setFetchingLessonPages] = useState(true);

//   useEffect(() => {
//     const fetchMaterials = async () => {
//       const requestBuilder = new RequestBuilder();
//       const response = await getMaterials(requestBuilder).catch(error => {
//         console.error("Error fetching user's materials:", error);
//         return null;
//       });

//       if (response && response.ok) {
//         const data = await response.json();

//         const fetchedWorkspaces = data.map((material: any) => ({
//           id: material.MaterialID,
//           name: material.MaterialName,
//           // fileUrls: [],
//           createdAt: material.CreatedAt,
//           locked: false,
//           materialType: material.MaterialType,
//           // specifications: [],
//           // pages: []
//         }));

//         setWorkspaces(fetchedWorkspaces);
//         setWorkspacesInitialized(true);
//       } else {
//         setWorkspacesInitialized(true);
//       }
//     };

//     fetchMaterials();
//   }, []);

//   const loadWorkspaceData = async (workspaceId: string) => {
//     setFetchingSpecifications(true);
//     selectWorkspace(workspaceId);
//     const specifications = await getSpecifications(workspaceId);
//     // setSpecifications(specifications);
//     setFetchingSpecifications(false);
//   }

//   // useEffect(() => {
//   //   const fetchSideNavData = async () => {
//   //     if (selectedWorkspace && !materialSpecificationsInitialized && !lessonPagesInitialized) {
//   //       const specifications = await getSpecifications(selectedWorkspace.id).catch(error => {
//   //         console.error("Error fetching material specifications:", error);
//   //         return null;
//   //       });

//   //       const pages = selectedWorkspace.materialType === "QUIZ" ? [] : await getLessonPages(selectedWorkspace.id).catch(error => {
//   //         console.error("Error fetching material specifications:", error);
//   //         return null;
//   //       });

//   //       if (specifications && pages) {
//   //         setSelectedWorkspace(prevWorkspace => {
//   //           if (!prevWorkspace) return null;
//   //           return { ...prevWorkspace, specifications };
//   //         });
//   //         setMaterialSpecificationsInitialized(true);
//   //         setLessonPagesInitialized(true);
//   //       }
//   //     }
//   //   };

//   //   fetchSideNavData();
//   // }, [selectedWorkspace, materialSpecificationsInitialized, lessonPagesInitialized]);


//   const addWorkspace = (workspace: Workspace) => {
//     const updatedWorkspaces = [...workspaces, { ...workspace, createdAt: Date.now() }];
//     setWorkspaces(updatedWorkspaces);
//   };

//   const removeWorkspace = (workspaceId: string) => {
//     const updatedWorkspaces = workspaces.filter((workspace) => workspace.id !== workspaceId);
//     setWorkspaces(updatedWorkspaces);
//   };

//   const selectWorkspace = (workspaceId: string | null) => {
//     if (workspaceId === null) {
//       setSelectedWorkspace(null);
//       return;
//     }

//     const workspace = workspaces.find((workspace) => workspace.id === workspaceId) || null;
//     setSelectedWorkspace(workspace);
//   };

//   const selectSpecification = (specificationId: string) => {
//     setSelectedSpecificationId(specificationId);
//   };

//   const updateWorkspaceName = (workspaceId: string, newName: string) => {
//     const updatedWorkspaces = workspaces.map((workspace) =>
//       workspace.id === workspaceId ? { ...workspace, name: newName } : workspace
//     );
//     setWorkspaces(updatedWorkspaces);

//     if (selectedWorkspace && selectedWorkspace.id === workspaceId) {
//       setSelectedWorkspace({ ...selectedWorkspace, name: newName });
//     }
//   };

//   const updateSpecification = (workspaceId: string, specification: Specification) => {
//     const updatedWorkspaces = workspaces.map((workspace) =>
//       workspace.id === workspaceId
//         ? { ...workspace, specifications: workspace.specifications.map((spec) => (spec.id === specification.id ? specification : spec)) }
//         : workspace
//     );
//     setWorkspaces(updatedWorkspaces);

//     if (selectedWorkspace && selectedWorkspace.id === workspaceId) {
//       setSelectedWorkspace({
//         ...selectedWorkspace,
//         specifications: selectedWorkspace.specifications.map((spec) =>
//           spec.id === specification.id ? specification : spec
//         ),
//       });
//       // setSelectedSpecificationId(specification.id)
//     }
//   };

//   const addSpecification = (workspaceId: string, specification: Specification) => {
//     const updatedWorkspaces = workspaces.map((workspace) =>
//       workspace.id === workspaceId
//         ? { ...workspace, specifications: [...workspace.specifications, specification] }
//         : workspace
//     );
//     setWorkspaces(updatedWorkspaces);
    
//     console.log(workspaceId)
//     console.log(specification)

//     if (selectedWorkspace && selectedWorkspace.id === workspaceId) {
//       setSelectedWorkspace({
//         ...selectedWorkspace,
//         specifications: [...selectedWorkspace.specifications, specification],
//       });
//       setSelectedSpecificationId(specification.id)
//       console.log("Added specifications debug: ", [...selectedWorkspace.specifications, specification])
//     }
//   };

//   const deleteSpecification = (workspaceId: string, specificationId: string) => {
//     const updatedWorkspaces = workspaces.map((workspace) =>
//         workspace.id === workspaceId
//             ? { ...workspace, specifications: workspace.specifications.filter((spec) => spec.id !== specificationId) }
//             : workspace
//     );
//     setWorkspaces(updatedWorkspaces);

//     if (selectedWorkspace && selectedWorkspace.id === workspaceId) {
//         const updatedSpecifications = selectedWorkspace.specifications.filter((spec) => spec.id !== specificationId);
//         let newSelectedSpecificationId = '';

//         if (updatedSpecifications.length > 0) {
//             const index = selectedWorkspace.specifications.findIndex((spec) => spec.id === specificationId);

//             if (index === selectedWorkspace.specifications.length - 1) {
//                 // If it was the highest index, set to the previous one
//                 newSelectedSpecificationId = updatedSpecifications[index - 1]?.id || '';
//             } else {
//                 // Otherwise, set to the next one
//                 newSelectedSpecificationId = updatedSpecifications[index]?.id || '';
//             }
//         }

//         setSelectedWorkspace({
//             ...selectedWorkspace,
//             specifications: updatedSpecifications,
//         });
//         setSelectedSpecificationId(newSelectedSpecificationId);
//     }
//   };

//   const getSpecifications = async (workspaceId: string): Promise<Specification[]> => {
//     const requestBuilder = new RequestBuilder().setURL(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/materials/specifications/${workspaceId}`)
//     const response = await _getSpecifications(requestBuilder).catch((error) => {
//       console.error("Error fetching specifications:", error);
//       return null;
//     });

//     if (response && response.ok) {
//       const data = await response.json();
//       const specifications = data.map((spec: any) => ({
//         id: spec.SpecificationID,
//         name: spec.Name,
//         topic: spec.Topic,
//         writingLevel: spec.WritingLevel,
//         comprehensionLevel: spec.ComprehensionLevel,
//         additionalSpecs: spec.AdditionalSpecs || [],
//       }));

//       console.log("Fetched: ", specifications)

//       const updatedWorkspaces = workspaces.map((workspace) =>
//         workspace.id === workspaceId ? { ...workspace, specifications } : workspace
//       );
      
//       console.log(updatedWorkspaces);
//       console.log(selectedWorkspace);
//       setWorkspaces(updatedWorkspaces);

//       if (selectedWorkspace && selectedWorkspace.id === workspaceId) {
//         setSelectedWorkspace(prevWorkspace => ({
//           ...prevWorkspace!,
//           specifications,
//         }));
//       } 
      
//       return specifications; // Maybe remove this later
//     }

//     return []; // This too
//   };
  
//   const addLessonPage = async (lessonId: string) => {
//     const requestBuilder = new RequestBuilder()
//     .setBody(JSON.stringify({
//       LessonID: lessonId, 
//       LastPageID: null,
//     }));

//     const response = await _addLessonPage(requestBuilder).catch((error) => {
//       console.error("Error creating new lesson page:", error);
//       return null;
//     });

//     if (response && response.ok) {
//       const data = await response.json();
//       console.log(data)

//       const page: Page = {
//         id: data.PageID,
//         title: '',
//         content: '' 
//       }

//       if (selectedWorkspace) {
//         setSelectedWorkspace({
//           ...selectedWorkspace,
//           pages: [...selectedWorkspace.pages, page],
//         });
//         setSelectedPageId(data.pageID)
//       }

//     }
//   };

//   const getLessonPages = async (lessonId: string) => {
//     const requestBuilder = new RequestBuilder().setURL(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/materials/lessons/pages/${lessonId}`)
//     const response = await _getLessonPages(requestBuilder).catch((error) => {
//       console.error("Error fetching lesson pages:", error);
//       // return null;
//     });

//     if (response && response.ok) {
//       const data = await response.json();
//       console.log(data)
//       const pages = data.map((page: any) => ({
//         id: page.PageID,
//         title: page.PageTitle,
//         content: page.Content,
//       }));

//       if (selectedWorkspace && selectedWorkspace.id === lessonId) {
//         setSelectedWorkspace(prevWorkspace => ({
//           ...prevWorkspace!,
//           pages,
//         }));
//         selectPage(pages[0].id);
//         return pages;
//       }
//     }

//   }
  
//   const updateLessonPage = (lessonId: string, updatedPage: Page) => {
//     const updatedWorkspaces = workspaces.map(workspace =>
//       workspace.id === lessonId
//         ? {
//             ...workspace,
//             pages: workspace.pages.map(page =>
//               page.id === updatedPage.id ? updatedPage : page
//             ),
//           }
//         : workspace
//     );
//     setWorkspaces(updatedWorkspaces);
  
//     if (selectedWorkspace && selectedWorkspace.id === lessonId) {
//       const updatedPages = selectedWorkspace.pages.map(page =>
//         page.id === updatedPage.id ? updatedPage : page
//       );
  
//       setSelectedWorkspace({
//         ...selectedWorkspace,
//         pages: updatedPages,
//       });
  
//       // If the updated page is the currently selected one, update the selectedPageId as well
//       if (selectedPageId === updatedPage.id) {
//         setSelectedPageId(updatedPage.id);
//       }
//     }
//   };

  
//   const selectPage = (pageId: string) => {
//     setSelectedPageId(pageId);
//   };
  
//   return (
//     <WorkspaceMaterialContext.Provider
//       value={{
//         workspaces,
//         workspacesInitialized,
//         selectedWorkspace,
//         selectedSpecificationId,
//         selectedPageId,
//         fetchingSpecifications,
//         loadWorkspaceData,
//         selectWorkspace,
//         selectSpecification,
//         updateWorkspaceName,
//         addWorkspace,
//         removeWorkspace,
//         updateSpecification,
//         getSpecifications,
//         addSpecification,
//         deleteSpecification,
//         getLessonPages,
//         updateLessonPage,
//         addLessonPage,
//         selectPage,
//       }}
//     >
//       {children}
//     </WorkspaceMaterialContext.Provider>
//   );
// };

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