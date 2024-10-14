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
import { ExtendedModuleNode } from "../module-tree/types";
import { Module } from "../module-tree/types";
import { CustomNode } from "../module-tree/CustomNode";
import { CustomDragPreview } from "../module-tree/CustomDragPreview";
import { MultipleDragPreview } from "../module-tree/MultipleDragPreview";
import Placeholder from "../module-tree/Placeholder";
import useTreeOpenHandler from "../module-tree/useTreeOpenHandler";
import { processModuleNodes } from "../module-tree/data-processing";
import { useWorkspaceContext } from "@/lib/hooks/context-providers/workspace-context";


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

const ModuleSidenav: FC<ModuleTreeProps> = ({ treeFormat }) => {
  const { ref, getPipeHeight, toggle } = useTreeOpenHandler();
  const [treeData, setTreeData] = useState<NodeModel<ExtendedModuleNode>[]>(processModuleNodes(treeFormat)); 
  const [selectedNodes, setSelectedNodes] = useState<NodeModel<ExtendedModuleNode>[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isCtrlPressing, setIsCtrlPressing] = useState(false);

  const { selectModuleNode } = useWorkspaceContext();

  useEffect(() => {
    console.log("Tree format changed");
    setTreeData(processModuleNodes(treeFormat));
  }, [treeFormat]);

  useEffect(() => {
    if (selectedNodes.length > 0) selectModuleNode(selectedNodes[0].id as string);
  }, [selectedNodes]);

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
      console.log("Reindex within subtree, dest index", destinationIndex);
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
      console.log("Move node to new parent");
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
        console.log("Rewrite tree ", newText);
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
      <div className="px-2">
        <Tree
          ref={ref}
          classes={{
            root: "list-none pl-1 py-2 relative rounded-lg border-full border-gray-300",
            placeholder: "relative",
            dropTarget: "outline outline-1 outline-[#1967d2] inset",
            listItem: "list-none truncate",
          }}
          tree={treeData}
          sort={false}
          rootId={0}
          insertDroppableFirst={false}
          enableAnimateExpand={true}
          onDrop={handleDrop}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          canDrop={(tree, options) => {
            if (
              selectedNodes.some(
                (selectedNode) => selectedNode.id === options.dropTargetId
              )
            ) {
              return false;
            }
            return true;
          }}
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
                showMenu={true}
              />
            );
          }}
          dragPreviewRender={(monitorProps: DragLayerMonitorProps<ExtendedModuleNode>) => {
            if (selectedNodes.length > 1) {
              return <MultipleDragPreview dragSources={selectedNodes} />;
            }

            return <CustomDragPreview monitorProps={monitorProps} />;
          }}
        />
      </div>
    </DndProvider>
  );
}

export default ModuleSidenav;