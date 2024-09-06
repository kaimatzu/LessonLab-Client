import React, { FC, useEffect, useState } from 'react';
import CrepeEditor from './milkdownCrepe';
import ModuleSidenav from './module-sidenav';
import { useWorkspaceContext } from '@/lib/hooks/context-providers/workspace-context';
import { transformModuleDataToTreeFormat } from '../module-tree/data-processing';
import { Module } from '../module-tree/types';

const MaterialArea: FC = () => {
  const { selectedWorkspace, selectedModuleId, loadModuleData, selectedModuleData, moduleDataLoading } = useWorkspaceContext();
  const [initialized, setInitialized] = useState<boolean>(false);
  const [treeFormat, setTreeFormat] = useState<Module | null>(null); // Typed state for treeFormat
  
  // useEffect(() => {
  //   if (!initialized){
  //     console.log("Loading module data in component");
  //     loadModuleData(selectedModuleId!);
  //   }

  //   setInitialized(true);
  // }, [selectedModuleId, initialized])

  useEffect(() => {
    if(selectedModuleData && !moduleDataLoading && selectedModuleId) {
      const module = selectedWorkspace?.modules.find(module => module.id === selectedModuleId);
      console.log(module, selectedModuleId);
      console.log("Selected workspace modules:", selectedWorkspace?.modules);
      // // console.log(selectedModuleData);
      // const currentModule = selectedWorkspace?.modules.find(module => module.id === selectedModuleId );
      // const treeFormatData = transformModuleDataToTreeFormat(currentModule, selectedModuleData);
      // console.log("Tree data", treeFormatData);
      if (module) {
        console.log("Loaded module!", module)
        setTreeFormat(module);
      }
      
    }
  }, [selectedModuleData, moduleDataLoading, selectedModuleId])

  return (
    <div className="flex h-full w-full">
      <div className="w-[30%] h-full px-4">
        {treeFormat && <ModuleSidenav treeFormat={treeFormat} />}
      </div>
      <div className="w-[70%] h-full">
        <CrepeEditor />
      </div>
    </div>
  );
}

export default MaterialArea;
