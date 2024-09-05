export type FileProperties = {
    fileType: string;
    fileSize: string;
};

// types.ts
export interface ModuleNode {
    id: string;
    parent: string | null;
    title: string;
    content: string;
    description: string;
    children: ModuleNode[];
}

// Extended type to include isLeaf
export interface ExtendedModuleNode extends ModuleNode {
    isLeaf?: boolean; // Added during building UI tree
}

export interface Module {
    id: string;
    name: string;
    description: string;
    nodes: ModuleNode[]; 
};
