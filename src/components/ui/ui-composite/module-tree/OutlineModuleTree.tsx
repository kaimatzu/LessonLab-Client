import {FC, useEffect, useRef, useState} from "react";
import {NodeApi, RowRendererProps, Tree, TreeApi} from "react-arborist";
import styles from "./styles/outline.tree.module.css";
import { FillFlexParent } from "./components/fill-flex-parent";
import {ModuleNode, Module} from "@/lib/types/workspace-types";
import { OutlineNode } from "./OutlineNode";
import "@/components/ui/css/custom-scrollbar.css";

import {stopAllPropagation} from "@/lib/utils";

const INDENT_STEP = 15;

interface ModuleTreeProps {
    module: Module;
}

const OutlineModuleTree: FC<ModuleTreeProps> = ({ module }) => {
    const [tree, setTree] = useState<TreeApi<ModuleNode> | null | undefined>(null);
    const [active, setActive] = useState<ModuleNode | null>(null);
    const [focused, setFocused] = useState<ModuleNode | null>(null);
    const [lastFocusedNode, setLastFocusedNode] = useState<NodeApi<ModuleNode> | null>(null);
    const [selectedCount, setSelectedCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [count, setCount] = useState(0);

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
                                selection={active?.id}
                                className={`${styles.tree} custom-scrollbar`}
                                rowClassName={styles.row}
                                padding={15}
                                rowHeight={30}
                                indent={INDENT_STEP}
                                overscanCount={8}
                                onSelect={(selected) => {
                                    setSelectedCount(selected.length);
                                }}
                                onActivate={(node) => setActive(node.data)}
                                onFocus={(node) => setFocused(node.data)}
                                onToggle={() => {
                                    setTimeout(() => {
                                        setCount(tree?.visibleNodes.length ?? 0);
                                    });
                                }}
                                children={(nodeProps) =>
                                    <OutlineNode
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


export default OutlineModuleTree;
