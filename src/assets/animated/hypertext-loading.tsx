import React, { useEffect, useState } from 'react'
import './css/animations.css'

interface HypertextLoadingProps {
  progress: number
  guid?: string
  isRotating?: boolean
  width?: number // Add width prop
  height?: number // Add height prop
}

const HypertextLoading: React.FC<HypertextLoadingProps> = ({
  progress,
  width = 200, // Default width
  height = 180, // Default height
}) => {
  const [isRotating, setIsRotating] = useState<boolean>(false)

  // Generate unique identifier for inner circles
  const guid = crypto.randomUUID()

  useEffect(() => {
    const innerCircles = document.querySelectorAll<SVGCircleElement>(`.inner-circle-${guid}`)
    innerCircles.forEach((circle, index) => {
      const startProgress = index * 25
      const endProgress = (index + 1) * 25

      let circleProgress = 0

      if (progress > startProgress) {
        circleProgress = Math.min((progress - startProgress) / (endProgress - startProgress), 1)
      }

      circle.style.opacity = `${circleProgress}`
    })

    if (progress >= 100) {
      setIsRotating(true)
      setTimeout(() => {
        setIsRotating(false) // Reset to slow rotation after the fast rotation
      }, 1000) // Duration of the fast rotation
    }
  }, [progress, guid])

  return (
    <svg
      viewBox="0 0 200 180" // This viewBox remains unchanged for proper scaling
      width={width}
      height={height}
      className={isRotating ? 'fast-rotate' : 'slow-rotate'}
    >
      {/* Connecting lines */}
      <line x1="85" y1="50" x2="60" y2="75" stroke="#9AADEC" strokeWidth="8" />
      <line x1="115" y1="50" x2="138" y2="75" stroke="#9AADEC" strokeWidth="8" />
      <line x1="65" y1="100" x2="85" y2="125" stroke="#9AADEC" strokeWidth="8" />
      <line x1="135" y1="100" x2="115" y2="125" stroke="#9AADEC" strokeWidth="8" />

      {/* Top circle */}
      <g transform="translate(100, 40)">
        <circle className="ring" cx="0" cy="0" r="20" stroke="#9AADEC" strokeWidth="8" fill="none" />
        <circle className={`inner-circle-${guid}`} cx="0" cy="0" r="15" fill="#9AADEC" />
      </g>

      {/* Bottom-left circle */}
      <g transform="translate(50, 90)">
        <circle className="ring" cx="0" cy="0" r="20" stroke="#9AADEC" strokeWidth="8" fill="none" />
        <circle className={`inner-circle-${guid}`} cx="0" cy="0" r="15" fill="#9AADEC" />
      </g>

      {/* Bottom-right circle */}
      <g transform="translate(150, 90)">
        <circle className="ring" cx="0" cy="0" r="20" stroke="#9AADEC" strokeWidth="8" fill="none" />
        <circle className={`inner-circle-${guid}`} cx="0" cy="0" r="15" fill="#9AADEC" />
      </g>

      {/* Bottom circle */}
      <g transform="translate(100, 140)">
        <circle className="ring" cx="0" cy="0" r="20" stroke="#9AADEC" strokeWidth="8" fill="none" />
        <circle className={`inner-circle-${guid}`} cx="0" cy="0" r="15" fill="#9AADEC" />
      </g>
    </svg>
  )
}

export default HypertextLoading
