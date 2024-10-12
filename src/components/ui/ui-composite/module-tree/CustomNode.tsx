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
import { BsThreeDots } from "react-icons/bs";
import Divider from "@mui/material/Divider";
import { RiDeleteBinLine } from "react-icons/ri";
import { LuPencil } from "react-icons/lu";
import { SlRefresh } from "react-icons/sl";
import { RiAddFill } from "react-icons/ri";
import { PiNoteBlankLight } from "react-icons/pi";
import HypertextLogo from '@/assets/hypertext-logo';

type Props = RenderParams & {
  node: NodeModel<ExtendedModuleNode>;
  isSelected: boolean;
  isDragging: boolean;
  testIdPrefix?: string;
  onClick: (e: React.MouseEvent, node: NodeModel<ExtendedModuleNode>) => void;
  onRename: (id: NodeModel["id"], value: string) => void; // New prop for renaming
  showMenu: boolean;
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
      className={`flex items-center h-10 hover:bg-[#E2E4EA] cursor-pointer truncate rounded-sm group ${props.isSelected ? 'text-[#5e77d3]' : ''} ${props.isDragging ? 'opacity-50' : ''}`}
      style={{ paddingInlineStart: indent }}
      data-testid={`${testIdPrefix}custom-node-${id}`}
      onClick={handleClick}
    >
      <div
        className={`flex items-center justify-center ${ props.node.data?.isLeaf ? 'ml-1 w-1' : 'w-6' }
        h-6 transition-transform duration-100 transform`}
      >
        {!props.node.data?.isLeaf && (
          <div onClick={handleToggle}>
            {props.isOpen ? (
              <ArrowDropDownIcon data-testid={`arrow-down-icon-${id}`} sx={{ color: 'gray' }}/>
            ) : (
              <ArrowRightIcon data-testid={`arrow-right-icon-${id}`} sx={{ color: 'gray' }}/>
            )}
          </div>
        )}
      </div>
      <div className="flex-1 truncate">
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
          // <Typography variant="body2">{labelText}</Typography>
          <h2 className="max-w-[230px] text-sm truncate">{labelText}</h2>
        )}
      </div>
      {props.showMenu && 
        <div className="opacity-0 group-hover:opacity-100">
          <IconButton
            aria-controls="node-menu"
            aria-haspopup="true"
            onClick={handleMenuOpen}
            size="small"
          >
            {/* <MoreHorizIcon /> */}
            <BsThreeDots/>
          </IconButton>
          <Menu
            id="node-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
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
            <MenuItem onClick={handleRename} sx={{ fontSize: '0.875rem', borderRadius: '8px' }}>
              <LuPencil className="mr-2"/>
              Rename
            </MenuItem>
            <MenuItem onClick={()=>{}} sx={{ fontSize: '0.875rem', borderRadius: '8px' }}>
              <SlRefresh className="mr-2"/>
              Regenerate Content
            </MenuItem>
            <MenuItem onClick={()=>{}} sx={{ fontSize: '0.875rem', borderRadius: '8px' }}>
              <RiAddFill className="w-4 h-4 mr-2"/>
              Add Sub-content
            </MenuItem>
            <Divider />
            <MenuItem onClick={()=>{}} sx={{ fontSize: '0.875rem', borderRadius: '8px' }}>
              <HypertextLogo width={16} height={16} className="mr-2"/>
              Generate Sub-content
            </MenuItem>
            <MenuItem onClick={()=>{}} sx={{ fontSize: '0.875rem', borderRadius: '8px' }}>
              <PiNoteBlankLight className="mr-2"/>
              Generate Assessment
            </MenuItem>
            <Divider />
            <MenuItem onClick={()=>{}} sx={{ fontSize: '0.875rem', color: 'red', borderRadius: '8px' }}>
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
