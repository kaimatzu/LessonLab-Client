// client/src/lib/hooks/workspace-material-context.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { GET as getMaterials } from '@/app/api/material/route';
import { GET as _getSpecifications } from "@/app/api/material/specification/route";
import RequestBuilder from '@/lib/hooks/builders/request-builder';

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

export interface Workspace {
  id: string;
  name: string;
  fileUrls: string[];
  createdAt: number;
  locked?: boolean;
  materialType: string;
  specifications: Specification[];
}

export interface WorkspaceMaterialContextValue {
  workspaces: Workspace[];
  workspacesInitialized: boolean;
  selectedWorkspace: Workspace | null;
  selectedSpecificationId: string | null;
  selectWorkspace: (workspaceId: string | null) => void;
  selectSpecification: (specificationId: string) => void;
  updateWorkspaceName: (workspaceId: string, newName: string) => void;
  addWorkspace: (workspace: Workspace) => void;
  removeWorkspace: (workspaceId: string) => void;
  updateSpecification: (workspaceId: string, specification: Specification) => void;
  addSpecification: (workspaceId: string, specification: Specification) => void;
  deleteSpecification: (workspaceId: string, specificationId: string) => void;
  getSpecifications: (workspaceId: string) => Promise<void>;
}

const defaultValue: WorkspaceMaterialContextValue = {
  workspaces: [],
  workspacesInitialized: false,
  selectedWorkspace: null,
  selectedSpecificationId: null,
  selectWorkspace: () => {},
  selectSpecification: () => {},
  updateWorkspaceName: () => {},
  addWorkspace: () => {},
  removeWorkspace: () => {},
  updateSpecification: () => {},
  addSpecification: () => {},
  deleteSpecification: () => {},
  getSpecifications: () => Promise.resolve(),
};

export const WorkspaceMaterialContext = createContext<WorkspaceMaterialContextValue>(defaultValue);
export const useWorkspaceMaterialContext = () => useContext(WorkspaceMaterialContext);

export const WorkspaceMaterialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspacesInitialized, setWorkspacesInitialized] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [selectedSpecificationId, setSelectedSpecificationId] = useState<string | null>(null);
  const [materialSpecificationsInitialized, setMaterialSpecificationsInitialized] = useState(false);

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
          createdAt: material.CreatedAt,
          locked: false,
          materialType: material.MaterialType,
          specifications: [],
        }));

        setWorkspaces(fetchedWorkspaces);
        setWorkspacesInitialized(true);
      } else {
        setWorkspacesInitialized(true);
      }
    };

    fetchMaterials();
  }, []);

  useEffect(() => {
    const fetchSpecifications = async () => {
      if (selectedWorkspace && !materialSpecificationsInitialized) {
        const specifications = await getSpecifications(selectedWorkspace.id).catch(error => {
          console.error("Error fetching material specifications:", error);
          return null;
        });

        if (specifications) {
          setSelectedWorkspace(prevWorkspace => {
            if (!prevWorkspace) return null;
            return { ...prevWorkspace, specifications };
          });
          setMaterialSpecificationsInitialized(true);
        }
      }
    };

    fetchSpecifications();
  }, [selectedWorkspace, materialSpecificationsInitialized]);

  // useEffect(() => {
  //   if (selectedWorkspace && selectedWorkspace.specifications.length > 0) {
  //     setSelectedSpecificationId(selectedWorkspace.specifications[0].id);
  //   } else {
  //     setSelectedSpecificationId(null);
  //   }
  // }, [selectedWorkspace]);

  const addWorkspace = (workspace: Workspace) => {
    const updatedWorkspaces = [...workspaces, { ...workspace, createdAt: Date.now() }];
    setWorkspaces(updatedWorkspaces);
  };

  const removeWorkspace = (workspaceId: string) => {
    const updatedWorkspaces = workspaces.filter((workspace) => workspace.id !== workspaceId);
    setWorkspaces(updatedWorkspaces);
  };

  const selectWorkspace = (workspaceId: string | null) => {
    setMaterialSpecificationsInitialized(false);
    if (workspaceId === null) {
      setSelectedWorkspace(null);
      return;
    }

    const workspace = workspaces.find((workspace) => workspace.id === workspaceId) || null;
    setSelectedWorkspace(workspace);
  };

  const selectSpecification = (specificationId: string) => {
    setSelectedSpecificationId(specificationId);
  };

  const updateWorkspaceName = (workspaceId: string, newName: string) => {
    const updatedWorkspaces = workspaces.map((workspace) =>
      workspace.id === workspaceId ? { ...workspace, name: newName } : workspace
    );
    setWorkspaces(updatedWorkspaces);

    if (selectedWorkspace && selectedWorkspace.id === workspaceId) {
      setSelectedWorkspace({ ...selectedWorkspace, name: newName });
    }
  };

  const updateSpecification = (workspaceId: string, specification: Specification) => {
    const updatedWorkspaces = workspaces.map((workspace) =>
      workspace.id === workspaceId
        ? { ...workspace, specifications: workspace.specifications.map((spec) => (spec.id === specification.id ? specification : spec)) }
        : workspace
    );
    setWorkspaces(updatedWorkspaces);

    if (selectedWorkspace && selectedWorkspace.id === workspaceId) {
      setSelectedWorkspace({
        ...selectedWorkspace,
        specifications: selectedWorkspace.specifications.map((spec) =>
          spec.id === specification.id ? specification : spec
        ),
      });
      // setSelectedSpecificationId(specification.id)
    }
  };

  const addSpecification = (workspaceId: string, specification: Specification) => {
    const updatedWorkspaces = workspaces.map((workspace) =>
      workspace.id === workspaceId
        ? { ...workspace, specifications: [...workspace.specifications, specification] }
        : workspace
    );
    setWorkspaces(updatedWorkspaces);
    
    console.log(workspaceId)
    console.log(specification)

    if (selectedWorkspace && selectedWorkspace.id === workspaceId) {
      setSelectedWorkspace({
        ...selectedWorkspace,
        specifications: [...selectedWorkspace.specifications, specification],
      });
      setSelectedSpecificationId(specification.id)
      console.log("Added specifications debug: ", [...selectedWorkspace.specifications, specification])
    }
  };

  const deleteSpecification = (workspaceId: string, specificationId: string) => {
    const updatedWorkspaces = workspaces.map((workspace) =>
        workspace.id === workspaceId
            ? { ...workspace, specifications: workspace.specifications.filter((spec) => spec.id !== specificationId) }
            : workspace
    );
    setWorkspaces(updatedWorkspaces);

    if (selectedWorkspace && selectedWorkspace.id === workspaceId) {
        const updatedSpecifications = selectedWorkspace.specifications.filter((spec) => spec.id !== specificationId);
        let newSelectedSpecificationId = '';

        if (updatedSpecifications.length > 0) {
            const index = selectedWorkspace.specifications.findIndex((spec) => spec.id === specificationId);

            if (index === selectedWorkspace.specifications.length - 1) {
                // If it was the highest index, set to the previous one
                newSelectedSpecificationId = updatedSpecifications[index - 1]?.id || '';
            } else {
                // Otherwise, set to the next one
                newSelectedSpecificationId = updatedSpecifications[index]?.id || '';
            }
        }

        setSelectedWorkspace({
            ...selectedWorkspace,
            specifications: updatedSpecifications,
        });
        setSelectedSpecificationId(newSelectedSpecificationId);
    }
};


  const getSpecifications = async (workspaceId: string) => {
    const requestBuilder = new RequestBuilder().setURL(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/materials/specifications/${workspaceId}`)
    const response = await _getSpecifications(requestBuilder).catch((error) => {
      console.error("Error fetching specifications:", error);
      return null;
    });

    if (response && response.ok) {
      const data = await response.json();
      const specifications = data.map((spec: any) => ({
        id: spec.SpecificationID,
        name: spec.Name,
        topic: spec.Topic,
        writingLevel: spec.WritingLevel,
        comprehensionLevel: spec.ComprehensionLevel,
        additionalSpecs: spec.AdditionalSpecs || [],
      }));

      console.log("Fetched: ", specifications)

      const updatedWorkspaces = workspaces.map((workspace) =>
        workspace.id === workspaceId ? { ...workspace, specifications } : workspace
      );

      setWorkspaces(updatedWorkspaces);

      if (selectedWorkspace && selectedWorkspace.id === workspaceId) {
        setSelectedWorkspace(prevWorkspace => ({
          ...prevWorkspace!,
          specifications,
        }));
        return specifications;
      }
    }
  };

  return (
    <WorkspaceMaterialContext.Provider
      value={{
        workspaces,
        workspacesInitialized,
        selectedWorkspace,
        selectedSpecificationId,
        selectWorkspace,
        selectSpecification,
        updateWorkspaceName,
        addWorkspace,
        removeWorkspace,
        updateSpecification,
        addSpecification,
        deleteSpecification,
        getSpecifications,
      }}
    >
      {children}
    </WorkspaceMaterialContext.Provider>
  );
};
