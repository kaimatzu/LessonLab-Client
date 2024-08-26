
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

export enum MessageType {
  User = "user",
  Assistant = "assistant"
}

export interface Message {
  id: string;
  role: MessageType;
  content: string;
}

export interface Workspace {
  id: string;
  name: string;
  fileUrls: string[];
  createdAt: number;
  locked?: boolean;
  specifications: Specification[];
  pages: Page[];
  chatHistory: Message[];
}