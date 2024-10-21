// import { Module, ModuleNode, ExtendedModuleNode } from "./types";

import {Module, ModuleNode} from "@/lib/types/workspace-types";

export function transformModuleOutlineToTreeFormat(moduleOutline: any): Module[] {
  const transformNode = (node: any, parentId: string | null = null): ModuleNode => {
    return {
      id: node.id, // Use the existing ID from the server
      parent: parentId,
      name: node.name,
      content: '',
      description: node.description,
      children: node.children.map((childNode: any) => transformNode(childNode, node.id)),
    };
  };

  return [
    {
      id: moduleOutline.id, // Use the existing ID from the server
      name: moduleOutline.name,
      description: moduleOutline.description,
      nodes: moduleOutline.moduleNodes.map((node: any) => transformNode(node)),
    },
  ];
}

export function transformModuleDataToTreeFormat(moduleData: any, moduleTree: any): Module[] {
  const transformNode = (node: any, parentId: string | null = null): ModuleNode => {
    return {
      id: node.Descendant,
      parent: parentId,
      name: node.Name,
      content: node.Content,
      description: "",
      children: node.Children.map((childNode: any) => transformNode(childNode, node.Descendant)),
    };
  };

  return [
    {
      id: moduleData.id,
      name: moduleData.name,
      description: moduleData.description,
      nodes: moduleTree.Children.map((node: any) => transformNode(node)),
    },
  ];
}