import { FC, MutableRefObject } from 'react';

interface Props {
  prompts: Prompt[];
  activePromptIndex: number;
  onMouseOver: (index: number) => void;
  promptListRef: MutableRefObject<HTMLDivElement | null>;
  handleSubmit: (prompt: Prompt) => void;
}

export const PromptGrid: FC<Props> = ({
  prompts,
  activePromptIndex,
  onMouseOver,
  promptListRef,
  handleSubmit,
}) => {
  return (
    <div
      ref={promptListRef}
      className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border-black/10"
    >
      {prompts.map((prompt, index) => (
        <div
          key={prompt.id}
          className={`${index === activePromptIndex
            ? 'bg-gray-200 dark:bg-zinc-900'
            : ''
            } cursor-pointer py-4 transition duration-200 ease-in-out hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-md top-2 left-0 z-10 px-10
           bg-white/30 border dark:bg-zinc-900 dark:border-zinc-50/10 backdrop-blur-sm shadow-sm`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSubmit(prompt);
          }}
          onMouseEnter={() => onMouseOver(index)}
        >
          <p className="text-md font-normal text-sm text-gray-500 dark:text-white">{prompt.name}</p>
        </div>
      ))}
    </div>
  );
};