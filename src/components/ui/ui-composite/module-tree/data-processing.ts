import { Module, ModuleNode, ExtendedModuleNode } from "./types";
import { NodeModel } from "@minoru/react-dnd-treeview";

export function transformModuleOutlineToTreeFormat(moduleOutline: any): Module[] {
  const transformNode = (node: any, parentId: string | null = null): ModuleNode => {
    return {
      id: node.id, // Use the existing ID from the server
      parent: parentId,
      title: node.title,
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
      title: node.Title,
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


export const processModuleNodes = (module: Module): NodeModel<ExtendedModuleNode>[] => {
  const flattenNodes = (
    nodes: ExtendedModuleNode[],
    parentId: number | string = 0
  ): NodeModel<ExtendedModuleNode>[] => {
    return nodes.flatMap((node) => [
      {
        id: node.id,
        parent: parentId,
        droppable: true,
        text: node.title,
        data: { ...node, isLeaf: node.children?.length === 0 },
      },
      ...flattenNodes(node.children || [], node.id),
    ]);
  };

  return flattenNodes(module.nodes);
};
