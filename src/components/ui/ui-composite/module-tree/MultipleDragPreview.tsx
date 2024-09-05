import React from "react";
import { Badge } from "@mui/material";
import { NodeModel } from "@minoru/react-dnd-treeview";
import { ModuleNode } from "./types"; // Use ModuleNode instead of FileProperties

type Props = {
  dragSources: NodeModel<ModuleNode>[]; // Use ModuleNode
};

export const MultipleDragPreview: React.FC<Props> = (props) => {
  return (
    <Badge
      classes={{ badge: "border-2 border-white" }} // Converted to Tailwind
      color="error"
      badgeContent={props.dragSources.length}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <div
        className="flex flex-col gap-1 p-2 bg-green-400 rounded-lg shadow-lg text-white"
        data-testid="custom-drag-preview"
      >
        {props.dragSources.map((node) => (
          <div className="inline-grid grid-cols-auto-auto gap-2" key={node.id}>
            <div className="flex items-center">{node.text}</div> {/* Only label is displayed */}
          </div>
        ))}
      </div>
    </Badge>
  );
};
