import {FC, useEffect, useRef, useState} from "react";
import {NodeApi, RowRendererProps, Tree, TreeApi} from "react-arborist";
import styles from "./styles/tree.module.css";
import { FillFlexParent } from "./components/fill-flex-parent";
import {Module, ModuleNode} from "@/lib/types/workspace-types";
import {useWorkspaceContext} from "@/lib/hooks/context-providers/workspace-context";
import { Node } from "./Node";
import {stopAllPropagation} from "@/lib/utils";

const INDENT_STEP = 15;

interface ModuleTreeProps {
    module: Module;
}

const ModuleTree: FC<ModuleTreeProps> = ({ module }) => {
    const [tree, setTree] = useState<TreeApi<ModuleNode> | null | undefined>(null);
    const [active, setActive] = useState<ModuleNode | null>(null);
    const [focused, setFocused] = useState<ModuleNode | null>(null);
    const [lastFocusedNode, setLastFocusedNode] = useState<NodeApi<ModuleNode> | null>(null);
    const [selectedCount, setSelectedCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [count, setCount] = useState(0);
    const [followsFocus, setFollowsFocus] = useState(false);
    const [disableMulti, setDisableMulti] = useState(false);

    const { selectedWorkspace, selectedModuleId, selectModuleNode, transferModuleNode } = useWorkspaceContext();

    useEffect(() => {
        setCount(tree?.visibleNodes.length ?? 0);
    }, [tree, searchTerm]);

    // RowRenderer prevents events within the node from propagating down into the tree component.
    const renderRow = ({ node, innerRef, attrs, children }: RowRendererProps<ModuleNode>) => {
        const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
            e.stopPropagation();
        };

        return (
            <div
                ref={innerRef}
                {...attrs}
                onKeyDown={handleKeyDown}
                tabIndex={0}
                className={styles.row}
                onClick={(event) => {
                    node.select();
                    selectModuleNode(node.id);
                    setLastFocusedNode(node);
                }}
                role="row"
            >
                {children}
            </div>
        );
    };

    return (
        <div className={styles.container}>
            <div className={styles.split}>
                <div className={styles.treeContainer}>
                    <FillFlexParent>
                        {(dimensions: {width: number, height: number}) => (
                            <Tree
                                {...dimensions}
                                data={module.nodes}
                                selectionFollowsFocus={true}
                                disableMultiSelection={true} // Set to true until we need to account for multiple nodes
                                ref={(t) => setTree(t)}
                                openByDefault={false}
                                // searchTerm={searchTerm}
                                selection={active?.id}
                                className={styles.tree}
                                rowClassName={styles.row}
                                padding={15}
                                rowHeight={30}
                                indent={INDENT_STEP}
                                overscanCount={8}
                                onSelect={(selected) => {
                                    setSelectedCount(selected.length);
                                    if (selected.length > 0){
                                        selectModuleNode(selected[0].id);
                                    } else {
                                        selectModuleNode(null);
                                        setLastFocusedNode(null);
                                    }
                                }}
                                onActivate={(node) => setActive(node.data)}
                                onFocus={(node) => setFocused(node.data)}
                                onToggle={() => {
                                    setTimeout(() => {
                                        setCount(tree?.visibleNodes.length ?? 0);
                                    });
                                }}
                                onMove={(...props) => {
                                    const { dragIds, dragNodes, parentId, parentNode, index } = props[0];
                                    console.log("Props:", props[0]);
                                    transferModuleNode(selectedWorkspace!.id, selectedModuleId!, dragIds[0], parentId, index);
                                }}
                                children={(nodeProps) =>
                                    <Node
                                        {...nodeProps}
                                         lastFocusedNode={lastFocusedNode}
                                         setLastFocusedNode={setLastFocusedNode}
                                    />}
                                renderRow={renderRow}
                            >
                            </Tree>
                        )}
                    </FillFlexParent>
                </div>
            </div>
        </div>
    );
}


export default ModuleTree;
