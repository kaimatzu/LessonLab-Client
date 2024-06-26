"use client";
import { Workspace } from '@/lib/hooks/workspace-material-context';

export const ChatTitle: React.FC<{ workspace: Workspace; }> = ({ workspace }) => {
    return (
        <div className="flex flex-col items-center">
            <h1 className="text-2xl font-light text-center text-gray-500 dark:text-zinc-100">
                {workspace?.name || 'Workspace'}
            </h1>
        </div>
    );
};