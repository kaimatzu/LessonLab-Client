import { Button } from "../ui-base/button";

interface WorkspaceHeaderProps{
    title: string;
    type: string;
}

const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({title}) => {
    return(
        <div className={`flex flex-col z-[200] border-b border-gray-300 select-none text-black w-full mx-0`}>
            <div className={`flex items-center align-middle p-2 rounded text-sm justify-between`}>
                <div className="flex flex-row justify-start">
                <div className="mr-4 ml-2">O</div>
                    <span>{title}</span>
                <button className="ml-8">...</button>
                </div>
                <Button className="text-white text-sm h-8 bg-gradient-to-r from-secondary to-primary rounded-sm hover:opacity-65 focus:outline-none">AI Assist</Button>
            </div>
        </div>
    )
}

export default WorkspaceHeader