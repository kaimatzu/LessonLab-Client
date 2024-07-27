import React, { useState } from 'react'

interface ArtifactProps {
  name: string
  children: React.ReactNode
}

const Artifact: React.FC<ArtifactProps> = ({ name, children }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleToggle = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <div className="w-full h-fit border border-gray-300 rounded p-2 bg-transparent">
      <div className="flex justify-between items-center bg-gray-100 p-2 rounded">
        <span className="font-bold">{name}</span>
        <button onClick={handleToggle} className="focus:outline-none">
          {isExpanded ? '▲' : '▼'}
        </button>
      </div>
      {isExpanded && <div className="mt-2">{children}</div>}
    </div>
  )
}

export default Artifact

