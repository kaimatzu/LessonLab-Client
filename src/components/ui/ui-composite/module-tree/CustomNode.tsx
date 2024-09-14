import React, { useState, useEffect } from "react";
import Typography from "@mui/material/Typography";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { NodeModel, RenderParams } from "@minoru/react-dnd-treeview";
import { ExtendedModuleNode } from "./types"; // Adjust import path based on your structure

type Props = RenderParams & {
  node: NodeModel<ExtendedModuleNode>;
  isSelected: boolean;
  isDragging: boolean;
  testIdPrefix?: string;
  onClick: (e: React.MouseEvent, node: NodeModel<ExtendedModuleNode>) => void;
  onRename: (id: NodeModel["id"], value: string) => void; // New prop for renaming
};

export const CustomNode: React.FC<Props> = ({
  testIdPrefix = "",
  ...props
}) => {
  const { id, droppable, data } = props.node;
  const indent = props.depth * 24;

  const [visibleInput, setVisibleInput] = useState(false);
  const [labelText, setLabelText] = useState<string>(props.node.text || props.node.data?.title!);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    props.onClick(e, props.node);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    props.onToggle();
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRename = () => {
    setAnchorEl(null);
    setVisibleInput(true);

    // Attach keydown listeners
    window.addEventListener("keydown", handleKeyDown);
  };

  const handleCancel = () => {
    setLabelText(props.node.text || props.node.data?.title!);
    setVisibleInput(false);

    // Remove keydown listeners
    window.removeEventListener("keydown", handleKeyDown);
  };

  const handleChangeText = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLabelText(e.target.value);
  };

  const handleSubmit = () => {
    setVisibleInput(false);
    props.onRename(id, labelText); // Call the onRename function passed as a prop

    // Remove keydown listeners
    window.removeEventListener("keydown", handleKeyDown);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup: Remove event listeners if the component is unmounted during rename
      if (visibleInput) {
        window.removeEventListener("keydown", handleKeyDown);
      }
    };
  }, [visibleInput]);

  return (
    <div
<<<<<<< HEAD
      className={`flex items-center h-8 ${props.isSelected ? 'bg-green-200' : ''} ${props.isDragging ? 'opacity-50' : ''}`}
=======
      className={`flex items-center h-15 hover:bg-[#E2E4EA] cursor-pointer truncate ${props.isSelected ? 'text-[#5e77d3]' : ''} ${props.isDragging ? 'opacity-50' : ''}`}
>>>>>>> origin/mod/UX
      style={{ paddingInlineStart: indent }}
      data-testid={`${testIdPrefix}custom-node-${id}`}
      onClick={handleClick}
    >
      <div
<<<<<<< HEAD
        className={`flex items-center justify-center w-6 h-6 transition-transform duration-100 cursor-pointer transform`}
=======
        className={`flex items-center justify-center w-6 h-6 transition-transform duration-100 transform`}
>>>>>>> origin/mod/UX
      >
        {!props.node.data?.isLeaf && (
          <div onClick={handleToggle}>
            {props.isOpen ? (
              <ArrowDropDownIcon data-testid={`arrow-down-icon-${id}`} />
            ) : (
              <ArrowRightIcon data-testid={`arrow-right-icon-${id}`} />
            )}
          </div>
        )}
      </div>
<<<<<<< HEAD
      <div className="flex-1 pl-2">
=======
      <div className="flex-1 truncate">
>>>>>>> origin/mod/UX
        {visibleInput ? (
          <div className="flex items-center">
            <TextField
              className="flex-grow"
              value={labelText}
              onChange={handleChangeText}
              size="small"
            />
            <IconButton onClick={handleSubmit} disabled={labelText === ""}>
              <CheckIcon />
            </IconButton>
            <IconButton onClick={handleCancel}>
              <CloseIcon />
            </IconButton>
          </div>
        ) : (
<<<<<<< HEAD
          <Typography variant="body2">{labelText}</Typography>
=======
          // <Typography variant="body2">{labelText}</Typography>
          <h2 className="max-w-[150px] text-sm truncate">{labelText}</h2>
>>>>>>> origin/mod/UX
        )}
      </div>
      <div>
        <IconButton
          aria-controls="node-menu"
          aria-haspopup="true"
          onClick={handleMenuOpen}
          size="small"
        >
          <MoreHorizIcon />
        </IconButton>
        <Menu
          id="node-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleRename}>Rename</MenuItem>
          {/* Add more menu items here for other actions */}
        </Menu>
      </div>
    </div>
  );
};
