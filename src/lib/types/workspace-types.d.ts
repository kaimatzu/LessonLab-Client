
export interface AdditionalSpecification {
  id: string;
  content: string;
}

export interface Specification {
  id: string;
  name: string;
  topic: string;
  // count?: number; // for quiz only
  writingLevel: string;
  comprehensionLevel: string;
  additionalSpecs: AdditionalSpecification[];
}

export interface Page {
  id: string;
  title: string;
  content: string;
}

export enum MessageRole {
  User = "user",
  Assistant = "assistant"
}

export enum MessageType {
  Standard = "standard",
  Action = "action"
}

export interface Message {
  id: string;
  role: MessageRole;
  type: MessageType;
  content: string;
}

export interface Workspace {
  id: string;
  name: string;
  fileUrls: string[];
  createdAt: number;
  locked?: boolean;
  specifications: Specification[];
  chatHistory: Message[];
  modules: Module[];
}

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
}

export interface ModuleOutlineNode {
  id: string;
  parent: string | null;
  title: string;
  description: string;
  children: ModuleOutlineNode[];
}

export interface ModuleOutline {
  id: string;
  name: string;
  description: string;
  nodes: ModuleOutlineNode[];
};
