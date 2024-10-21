import React, { useState, MouseEvent } from 'react';
import { useWorkspaceContext } from "@/lib/hooks/context-providers/workspace-context";
import { IoBookOutline } from "react-icons/io5";
import { BsThreeDots } from "react-icons/bs";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { LuPencil } from "react-icons/lu";
import { RiDeleteBinLine } from "react-icons/ri";

const ChatSidenav: React.FC = () => {
    // State for menu anchor and selected module
    const [anchorEl, setAnchorEl] = useState<null | SVGElement>(null);
    const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);

    // Extract modules and selectModule from context
    const { modules, selectModule } = useWorkspaceContext();

    // Handle menu open
    const handleMenuOpen = (event: React.MouseEvent<SVGElement>, moduleId: string) => {
        setAnchorEl(event.currentTarget);
        setSelectedModuleId(moduleId);
    };

    // Handle menu close
    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedModuleId(null);
    };

    return (
        <div className="flex flex-col w-64 h-[100%] border-l border-gray-300">
            {/* Materials Section */}
            <div className="flex items-center h-[49px] border-b border-gray-300 mb-1">
                <h1 className="text-sm font-normal ml-4">Materials</h1>
            </div>
            <div className="flex-grow h-[60%] overflow-y-auto">
                {/* Render modules */}
                {modules?.map((module) => (
                    <div
                        className="flex flex-row items-center text-sm justify-between hover:bg-[#E2E4EA] cursor-pointer p-2 rounded-md my-0.5 mx-1.5 group"
                        key={module.id}
                        onClick={() => selectModule(module.id)}
                    >
                        {/* Module name */}
                        <div className="flex flex-row items-center max-w-[200px]">
                            <IoBookOutline className="!mr-2 w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{module.name}</span>
                        </div>

                        {/* Three dots menu */}
                        <div className="items-center cursor-pointer pt-1 hover:text-[#5e77d3] opacity-0 group-hover:opacity-100">
                            <BsThreeDots
                                onClick={(event) => handleMenuOpen(event, module.id)}
                                className="cursor-pointer"
                            />
                        </div>

                        {/* Menu with rename and delete options */}
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl) && selectedModuleId === module.id}
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
                            <MenuItem onClick={() => console.log("Rename Clicked")} sx={{ fontSize: '0.875rem', borderRadius: '8px' }}>
                                <LuPencil className="mr-2" />
                                Rename
                            </MenuItem>
                            <MenuItem onClick={() => console.log("Delete Clicked")} sx={{ fontSize: '0.875rem', color: 'red', borderRadius: '8px' }}>
                                <RiDeleteBinLine className="mr-2" />
                                Delete
                            </MenuItem>
                        </Menu>
                    </div>
                ))}
            </div>
            {/* Instructions Section */}
            <div className="flex items-center p-4 h-[40%] border-t border-gray-300 text-xs text-gray-400 overflow-hidden">
                <p className="leading-4 select-none text-center ellipsis">For more specific queries, provide as much detail as possible to get the best results.<br/><br/>
                    By uploading files, you confirm that the content does not violate any privacy or legal regulations. The AI may occasionally produce inaccurate or incomplete information.
                    Always cross-check critical information.
                </p>
            </div>
        </div>
    );
};

export default ChatSidenav;
