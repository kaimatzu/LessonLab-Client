"use client";

import React, { useState, useEffect, FC } from "react";
import {
  DndProvider,
  DropOptions,
  getBackendOptions,
  getDescendants,
  MultiBackend,
  Tree,
  NodeModel,
  isAncestor,
  DragLayerMonitorProps,
} from "@minoru/react-dnd-treeview";
import { ExtendedModuleNode } from "./types";
import { Module } from "./types";
import { CustomNode } from "./CustomNode";
import { CustomDragPreview } from "./CustomDragPreview";
import { MultipleDragPreview } from "./MultipleDragPreview";
import Placeholder from "./Placeholder";
import useTreeOpenHandler from "./useTreeOpenHandler";
import sampleModules from "./sample-modules.json";
import { processModuleNodes } from "./data-processing";

interface ModuleTreeProps {
  treeFormat: Module;
}

const reorderArray = <T,>(
  array: NodeModel<T>[],
  sourceIndex: number,
  targetIndex: number
): NodeModel<T>[] => {
  const newArray = [...array];
  const element = newArray.splice(sourceIndex, 1)[0];
  newArray.splice(targetIndex, 0, element);
  return newArray;
};

const ModuleTree: FC<ModuleTreeProps> = ({ treeFormat }) => {
  const { ref, getPipeHeight, toggle } = useTreeOpenHandler();
  const [treeData, setTreeData] = useState<NodeModel<ExtendedModuleNode>[]>(processModuleNodes(treeFormat)); 
  const [selectedNodes, setSelectedNodes] = useState<NodeModel<ExtendedModuleNode>[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isCtrlPressing, setIsCtrlPressing] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "escape") {
        setSelectedNodes([]);
      } else if (e.ctrlKey || e.metaKey) {
        setIsCtrlPressing(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "control" || e.key.toLowerCase() === "meta") {
        setIsCtrlPressing(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    console.log("Tree data", treeData);
  }, [treeData]);

  useEffect(() => {
    console.log("Selected Nodes", selectedNodes);
  }, [selectedNodes]);

  const handleSingleSelect = (node: NodeModel<ExtendedModuleNode>) => {
    setSelectedNodes([node]);
  };

  const handleMultiSelect = (clickedNode: NodeModel<ExtendedModuleNode>) => {
    const selectedIds = selectedNodes.map((n) => n.id);

    if (selectedIds.includes(clickedNode.id)) return;

    console.log("Multi select!");
    
    if (
      selectedIds.some((selectedId) =>
        isAncestor(treeData, selectedId, clickedNode.id)
      )
    )
      return;

    let updateNodes = [...selectedNodes];

    updateNodes = updateNodes.filter((selectedNode) => {
      return !isAncestor(treeData, clickedNode.id, selectedNode.id);
    });

    updateNodes = [...updateNodes, clickedNode];
    setSelectedNodes(updateNodes);
  };

  const handleClick = (
    e: React.MouseEvent,
    node: NodeModel<ExtendedModuleNode>
  ) => {
    if (e.ctrlKey || e.metaKey) {
      handleMultiSelect(node);
    } else {
      handleSingleSelect(node);
    }
  };

  const handleDragStart = (node: NodeModel<ExtendedModuleNode>) => {
    const isSelectedNode = selectedNodes.some((n) => n.id === node.id);
    setIsDragging(true);

    if (!isCtrlPressing && isSelectedNode) return;

    if (!isCtrlPressing) {
      setSelectedNodes([node]);
      return;
    }

    if (!selectedNodes.some((n) => n.id === node.id)) {
      setSelectedNodes([...selectedNodes, node]);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setIsCtrlPressing(false);
    setSelectedNodes([]);
  };

  const handleDrop = (
    newTree: NodeModel<ExtendedModuleNode>[],
    options: DropOptions<ExtendedModuleNode>
  ) => {
    const { dragSourceId, dropTargetId, destinationIndex } = options;

    const start = treeData.find((v) => v.id === dragSourceId);
    const end = treeData.find((v) => v.id === dropTargetId);

    if (typeof dragSourceId === "undefined" || typeof dropTargetId === "undefined")
      return;

    // Reindex within the subtree
    if (start?.parent === dropTargetId && start && typeof destinationIndex === "number") {
      setTreeData((treeData) => {
        const output = reorderArray(
          treeData,
          treeData.indexOf(start),
          destinationIndex
        );
        return updateIsLeafStatus(output);
      });
      setSelectedNodes([]);
      return;
    }

    // Move selected nodes to a new parent
    if (
      start?.parent !== dropTargetId &&
      start &&
      typeof destinationIndex === "number"
    ) {
      if (
        getDescendants(treeData, dragSourceId).find(
          (el) => el.id === dropTargetId
        ) ||
        dropTargetId === dragSourceId ||
        (end && !end?.droppable)
      )
        return;

      setTreeData((treeData) => {
        const output = reorderArray(
          treeData,
          treeData.indexOf(start),
          destinationIndex
        );
        selectedNodes.forEach((node) => {
          const movedElement = output.find((el) => el.id === node.id);
          if (movedElement) {
            movedElement.parent = dropTargetId;
          }
        });
        return updateIsLeafStatus(output); // Recalculate isLeaf status after the drop
      });
      setSelectedNodes([]);
    }
  };

  // Helper function to update isLeaf status
  const updateIsLeafStatus = (
    treeData: NodeModel<ExtendedModuleNode>[]
  ): NodeModel<ExtendedModuleNode>[] => {
    return treeData.map((node) => {
      // Guard clause to ensure node.id and node.data.id are defined
      if (!node.id || !node.data?.id) {
        console.warn(`Node with invalid ID encountered: ${JSON.stringify(node)}`);
        return node; // Return the node unchanged if it's invalid
      }

      const children = treeData.filter((n) => n.parent === node.id);

      return {
        ...node,
        droppable: true,
        data: {
          ...node.data,
          isLeaf: children.length === 0,
        },
      };
    });
  };

  const handleRename = (id: NodeModel["id"], newText: string) => {
        console.log("Rewrite tree");
        setTreeData((currentTreeData) => {
        return currentTreeData.map((node) => {
            if (node.id === id) {
            return {
                ...node,
                text: newText,
                data: {
                ...node.data,
                title: newText,
                id: node.data?.id || node.id, // Ensure id is preserved and not undefined
                },
            } as NodeModel<ExtendedModuleNode>;
            }
            return node;
        });
        });
    };


  return (
    <DndProvider backend={MultiBackend} options={getBackendOptions()}>
      <div className="font-sans p-5">
        <Tree
          ref={ref}
          classes={{
            root: "list-none p-0 relative",
            placeholder: "relative",
            dropTarget: "outline outline-1 outline-[#1967d2] inset",
            listItem: "list-none p-0 relative",
          }}
          tree={treeData}
          sort={false}
          rootId={0}
          insertDroppableFirst={false}
          enableAnimateExpand={true}
          onDrop={() => { }}
          onDragStart={() => { }}
          onDragEnd={() => { }}
          canDrop={() => { return false; }}
          // onDrop={handleDrop}
          // onDragStart={handleDragStart}
          // onDragEnd={handleDragEnd}
          // canDrop={(tree, options) => {
          //   if (
          //     selectedNodes.some(
          //       (selectedNode) => selectedNode.id === options.dropTargetId
          //     )
          //   ) {
          //     return false;
          //   }
          //   return true;
          // }}
          placeholderRender={(node, { depth }) => (
            <Placeholder node={node} depth={depth} />
          )}
          render={(node, options) => {
            const selected = selectedNodes.some(
              (selectedNode) => selectedNode.id === node.id
            );

            return (
              <CustomNode
                node={node}
                {...options}
                isSelected={selected}
                isDragging={selected && isDragging}
                onClick={(e) => handleClick(e, node)}
                onRename={handleRename} // Pass the handleRename function
                showMenu={false}
              />
            );
          }}
          // dragPreviewRender={(monitorProps: DragLayerMonitorProps<ExtendedModuleNode>) => {
          //   if (selectedNodes.length > 1) {
          //     return <MultipleDragPreview dragSources={selectedNodes} />;
          //   }

          //   return <CustomDragPreview monitorProps={monitorProps} />;
          // }}
          // dragPreviewRender={() => { return }}
        />
      </div>
    </DndProvider>
  );
}

export default ModuleTree;