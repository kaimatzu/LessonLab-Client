import React from "react";
import { DragLayerMonitorProps } from "@minoru/react-dnd-treeview";
import { ModuleNode } from "./types"; // Use ModuleNode instead of FileProperties

type Props = {
  monitorProps: DragLayerMonitorProps<ModuleNode>; // Use ModuleNode
};

export const CustomDragPreview: React.FC<Props> = (props) => {
  const item = props.monitorProps.item;

  return (
    <div className="inline-grid grid-cols-auto-auto gap-2 p-1.5 bg-green-400 rounded-lg shadow-lg text-white">
      <div className="flex items-center">{item.text}</div> {/* Only label is displayed */}
    </div>
  );
};
