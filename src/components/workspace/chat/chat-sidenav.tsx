import React from 'react';

const ChatSidenav: React.FC = () => {
    return (
        <div className="flex flex-col w-64 h-[100%] border-l border-gray-300 shadow-lg">
            {/* Specifications Section */}
            <div className="flex items-center h-[49px] border-b border-gray-300">
                <h1 className="text-sm font-normal ml-4">Specifications</h1>
            </div>
            <div className="flex-grow p-4 h-[50%]">
                <p>Details about specifications will go here.</p>
            </div>
            {/* Materials Section */}
            <div className="flex items-center h-[49px] border-y border-gray-300">
                <h1 className="text-sm font-normal ml-4">Materials</h1>
            </div>
            <div className="flex-grow p-4 h-[50%]">
                <p>Details about materials will go here.</p>
            </div>
        </div>
    );
};

export default ChatSidenav;
