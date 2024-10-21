import {NodeApi, NodeRendererProps} from "react-arborist";
import {ModuleNode} from "@/lib/types/workspace-types";
import { FaPen } from "react-icons/fa";
import clsx from "clsx";
import styles from "@/components/ui/ui-composite/module-tree/styles/tree.module.css";
import {MdArrowDropDown, MdArrowRight} from "react-icons/md";
import React, {useCallback, useEffect, useState} from "react";
import IconButton from "@mui/material/IconButton";
import {BsThreeDots} from "react-icons/bs";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import {LuPencil} from "react-icons/lu";
import {RiAddFill, RiDeleteBinLine} from "react-icons/ri";
import Divider from "@mui/material/Divider";
import HypertextLogo from "@/assets/hypertext-logo";
import {stopAllPropagation} from "@/lib/utils";
import TextField from "@mui/material/TextField";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

const INDENT_STEP = 15;

interface ExtendedNodeProps extends NodeRendererProps<ModuleNode> {
    lastFocusedNode: NodeApi<ModuleNode> | null;
    setLastFocusedNode: (node: NodeApi<ModuleNode>) => void;
}

export const OutlineNode = ({ node, style, dragHandle, lastFocusedNode, setLastFocusedNode }: ExtendedNodeProps) => {
    const indentSize = Number.parseFloat(`${style.paddingLeft || 0}`);

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [visibleInput, setVisibleInput] = useState(false);
    const [newName, setNewName] = useState<string>('');

    const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
        stopAllPropagation(event);
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        if (lastFocusedNode) {
            lastFocusedNode.focus();
            console.log(lastFocusedNode.data);
        }
    };

    const handleRename = () => {
        setAnchorEl(null);
        setVisibleInput(true);
    };

    const handleCancel = () => {
        setVisibleInput(false);
    };

    const handleSubmit = (newName: string) => {
        setVisibleInput(false);
        console.log("New name prop: ", newName);

        // updateModuleNodeName(selectedModuleId!, node.id, selectedWorkspace!.id, newName);

        // console.log("Data", node.id as string, selectedModuleId!, selectedWorkspace!.id, newName);
    };



    return (
        <div
            ref={dragHandle}
            style={style}
            className={clsx(styles.node, node.state)}
            onClick={(event) => {
                event.preventDefault();
                setLastFocusedNode(node);
            }}
        >
            {visibleInput ?
                (
                    <div
                        className="flex items-center px-1 py-4"
                        onClick={(event) => {
                            stopAllPropagation(event);
                        }}
                    >
                        <TextField
                            className="flex-grow border rounded resize-none"
                            defaultValue={node.data.name}
                            onFocus={(e) => e.currentTarget.select()}
                            onBlur={() => node.reset()}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    handleSubmit(newName);
                                } else if (event.key === "Escape") {
                                    handleCancel();
                                }
                            }}
                            onChange={(event) => {
                                console.log("Input value", event.target.value);
                                setNewName(event.target.value);
                            }}
                            inputProps={{
                                style: {
                                    height: "0em",
                                },
                            }}
                        />
                        <CheckIcon className="ml-2 cursor-pointer" onClick={(event) => {
                            stopAllPropagation(event);
                            handleSubmit(newName);
                        }}/>
                        <CloseIcon className="ml-1 cursor-pointer" onClick={(event) => {
                            stopAllPropagation(event);
                            handleCancel();
                        }}/>
                    </div>
                ) :
                (
                    <>
                        <div className={styles.indentLines}>
                            {new Array(indentSize / INDENT_STEP).fill(0).map((_, index) => {
                                return <div key={index}></div>;
                            })}
                        </div>
                        {node.children && node.children.length > 0 &&
                            <div onClick={() => {
                                node.isOpen ? node.close() : node.open();
                            }}>
                                <FolderArrow node={node}/>
                            </div>
                        }
                        <span className={`
                            ${styles.text} 
                            ${node.children && node.children.length > 0 ? '' : (
                            node.isSelected ? '' : 'ml-3'
                        )}`
                        }>
                            {node.data.name}
                        </span>
                    </>
                )
            }

            {/*<h2 className="max-w-[230px] text-sm truncate">{node.isEditing ? <Input node={node}/> : node.data.name}</h2>*/}
            {!visibleInput &&
                <div className={`${styles.menuIcon}`}>
                    <IconButton
                        aria-controls="node-menu"
                        aria-haspopup="true"
                        onClick={handleMenuOpen}
                        size="small"
                    >
                        <BsThreeDots />
                    </IconButton>
                    <Menu
                        id="node-menu"
                        anchorEl={anchorEl}
                        keepMounted
                        open={Boolean(anchorEl)}
                        onClose={(event: Event) => {
                            stopAllPropagation(event);
                            handleMenuClose();
                        }}
                        slotProps={{
                            paper: {
                                sx: {
                                    backgroundColor: '#f1f3f8', // Custom background color
                                    borderRadius: '8px',           // Rounded corners
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                    padding: '6px',
                                },
                            },
                        }}
                    >
                        <MenuItem onClick={(event) => {
                            stopAllPropagation(event);
                            handleRename();
                        }} sx={{ fontSize: '0.875rem', borderRadius: '8px' }}>
                            <LuPencil className="mr-2"/>
                            Rename
                        </MenuItem>
                        <MenuItem onClick={async (event)=>{
                            stopAllPropagation(event);
                            setAnchorEl(null);

                        }} sx={{ fontSize: '0.875rem', borderRadius: '8px' }}>
                            <RiAddFill className="w-4 h-4 mr-2"/>
                            Add Sub-content
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={(event)=>{
                            stopAllPropagation(event);

                            setAnchorEl(null);

                        }} sx={{ fontSize: '0.875rem', color: 'red', borderRadius: '8px' }}>
                            <RiDeleteBinLine className="mr-2"/>
                            Delete
                        </MenuItem>
                        {/* Add more menu items here for other actions */}
                    </Menu>
                </div>
            }
        </div>
    );
};

function FolderArrow({ node }: { node: NodeApi<ModuleNode> }) {
    return (
        <span className={styles.arrow}>
          {node.isInternal ? (
              node.isOpen ? (
                  <MdArrowDropDown />
              ) : (
                  <MdArrowRight />
              )
          ) : null}
        </span>
    );
}