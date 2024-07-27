import React from 'react'

interface ArtifactProps {
  name: string
  children: string
}

const Artifact: React.FC<ArtifactProps> = ({ name, children }) => {
  const handleClick = () => {
    console.log(children)
  }

  return (
    <button onClick={handleClick} className="btn btn-primary">
      {name}
    </button>
  )
}

export default Artifact
