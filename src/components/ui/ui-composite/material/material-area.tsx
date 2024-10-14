import React, { FC, useEffect, useState } from 'react';
import CrepeEditor from './milkdownCrepe';
import ModuleSidenav from './module-sidenav';
import { useWorkspaceContext } from '@/lib/hooks/context-providers/workspace-context';
import { Module } from '../module-tree/types';
import { RiAddFill } from 'react-icons/ri';
import { insertNode as _insertModuleNode } from '@/app/api/workspace/module/route';
import RequestBuilder from "@/lib/hooks/builders/request-builder";

const MaterialArea: FC = () => {
  const { selectedWorkspace, selectedModuleId, selectedModuleData, moduleDataLoading, insertModuleNode } = useWorkspaceContext();
  const [treeFormat, setTreeFormat] = useState<Module | null>(null); // Typed state for treeFormat
  
  useEffect(() => {
    if(selectedModuleData && !moduleDataLoading && selectedModuleId) {
      const md = selectedWorkspace?.modules.find(module => module.id === selectedModuleId);
      console.log(md, selectedModuleId);
      console.log("Selected workspace modules:", selectedWorkspace?.modules);
      if (md) {
        console.log("Loaded module!", md)
        setTreeFormat(md);
      }
    }
  }, [selectedModuleData, moduleDataLoading, selectedModuleId, selectedWorkspace?.modules])

  return (
    <div className="flex h-full w-full bg-[#F1F3F8]">
      {/* <div className="max-w-[320px] w-[250px] h-full"> */}
      <div className="max-w-[320px] w-[250px] h-full border border-gray-300 rounded-lg m-2 p-1">
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
                        title: 'Untitled',
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
          {treeFormat && <ModuleSidenav treeFormat={treeFormat} />}
        </div>
      </div>
      <div className="w-full h-full">
        <CrepeEditor />
      </div>
    </div>
  );
}

export default MaterialArea;
