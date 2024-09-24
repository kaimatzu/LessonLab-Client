import React, { FC, memo, useState } from 'react';

interface ArtifactProps {
  name: string;
  children: React.ReactNode;
  message: string;
}

// #region Artifact
const Artifact: FC<ArtifactProps> = memo(({ name, children, message }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleCopy = async () => {
    if (navigator.clipboard) {
      // Preprocess the content to remove directive syntax
      const preprocessContent = (content: string): string => {
        // This regex will remove both the starting and ending :::artifact{name="..."} and ::: syntax
        return content.replace(/:::(artifact\{.*?\})|:::/g, '').trim();
      };

      const markdownContent = preprocessContent(message);

      try {
        await navigator.clipboard.writeText(markdownContent);
        alert('Copied to clipboard');
      } catch (error) {
        console.error('Failed to copy text: ', error);
        alert('Failed to copy text');
      }
    }
  };

  // #region JSX
  return (
    <div className="w-full h-fit border border-gray-300 rounded p-2 bg-transparent">
      <div className="flex justify-between items-center bg-gray-100 p-2 rounded">
        <span className="font-bold">{name}</span>
        <div className="flex items-center">
          <button onClick={handleCopy} className="mr-2 focus:outline-none bg-blue-500 text-white px-2 py-1 rounded">
            Copy
          </button>
          <button onClick={handleToggle} className="focus:outline-none">
            {isExpanded ? '▲' : '▼'}
          </button>
        </div>
      </div>
      {isExpanded && <div className="mt-2">{children}</div>}
    </div>
  );
});

export default Artifact;

