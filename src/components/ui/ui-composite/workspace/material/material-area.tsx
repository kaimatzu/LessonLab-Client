import React, { FC, useEffect, useState } from 'react';
import CrepeEditor from './milkdownCrepe';
import { useWorkspaceContext } from '@/lib/hooks/context-providers/workspace-context';
import { RiAddFill } from 'react-icons/ri';
import { insertNode as _insertModuleNode } from '@/app/api/workspace/module/route';
import RequestBuilder from "@/lib/hooks/builders/request-builder";
import ModuleTree from "@/components/ui/ui-composite/workspace/material/module-tree/ModuleTree";
import {Module, ModuleNode} from "@/lib/types/workspace-types";

const transformTree = (nodes: ModuleNode[]): any => {
    return nodes.map(node => ({
        id: node.id,
        parent: node.parent,
        name: node.name, // Rename title to name
        content: node.content,
        description: node.description,
        children: transformTree(node.children) // Recursively transform children
    }));
};

const MaterialArea: FC = () => {
  const { selectedWorkspace, selectedModuleId, selectedModuleData, moduleDataLoading, insertModuleNode } = useWorkspaceContext();
  const [module, setModule] = useState<Module | null>(null); // Typed state for treeFormat
  const [treeData, setTreeData] = useState<any | null>(null);
  // const backend = useBackend();

  useEffect(() => {
    if(selectedModuleData && !moduleDataLoading && selectedModuleId) {
      const md = selectedWorkspace?.modules.find(module => module.id === selectedModuleId);
      console.log(md, selectedModuleId);
      console.log("Selected workspace modules:", selectedWorkspace?.modules);
      if (md) {
        console.log("Loaded module!", md)
        setModule(md);
        // setTreeData(transformTree(md.nodes));
      }
    }
  }, [selectedModuleData, moduleDataLoading, selectedModuleId, selectedWorkspace?.modules])

  return (
    <div className="flex h-full w-full bg-[#F1F3F8]">
      {/* <div className="max-w-[320px] w-[250px] h-full"> */}
      <div className="max-w-[320px] w-[300px] h-full border border-gray-300 rounded-lg p-1">
        <div className="flex flex-row justify-between items-center p-1">
            <h1 className="text-sm font-normal transition-none ml-2">Contents</h1>
            <div className="cursor-pointer mr-2" onClick={async (event) => {
                event.preventDefault();
                event.stopPropagation();

                const requestBuilder = new RequestBuilder()
                    .setBody(JSON.stringify({
                        parentNodeId: selectedModuleId,
                        moduleId: selectedModuleId,
                        content: '',
                        title: 'Untitled',
                    }));

                const response = await _insertModuleNode(requestBuilder);

                if (response.ok) {
                    const responseBody = await response.text();
                    const responseData = JSON.parse(responseBody);
                    console.log("Data:", responseData);

                    insertModuleNode(selectedWorkspace!.id, selectedModuleId!, {
                        id: responseData.moduleNodeID as string,
                        parent: null,
                        name: 'Untitled',
                        content: '',
                        description: 'new node',
                        children: [],
                    });
                }
            }}>
              <RiAddFill className="w-4 h-4" />
            </div>
        </div>
        <div className="w-full h-full">
            {module && <ModuleTree module={module} /> }
        </div>
      </div>
      <div className="w-full h-full">
        <CrepeEditor />
      </div>
    </div>
  );
}

export default MaterialArea;
