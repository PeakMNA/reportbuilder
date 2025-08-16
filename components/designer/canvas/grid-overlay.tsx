'use client'

interface GridOverlayProps {
  showSnapIndicator?: boolean
  snapPosition?: { x: number; y: number } | null
  isDragging?: boolean
}

export function GridOverlay({ showSnapIndicator = false, snapPosition, isDragging = false }: GridOverlayProps) {
  // Grid size matches the snapping logic (19px)
  const gridSize = 19
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0"
      >
        <defs>
          <pattern
            id="grid"
            width={gridSize}
            height={gridSize}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
              fill="none"
              stroke={isDragging ? "rgb(59, 130, 246)" : "rgb(226, 232, 240)"}
              strokeWidth={isDragging ? "0.8" : "0.5"}
              opacity={isDragging ? "0.7" : "0.3"}
            />
          </pattern>
          <pattern
            id="grid-major"
            width={gridSize * 5}
            height={gridSize * 5}
            patternUnits="userSpaceOnUse"
          >
            <rect width={gridSize * 5} height={gridSize * 5} fill="url(#grid)" />
            <path
              d={`M ${gridSize * 5} 0 L 0 0 0 ${gridSize * 5}`}
              fill="none"
              stroke={isDragging ? "rgb(37, 99, 235)" : "rgb(203, 213, 225)"}
              strokeWidth={isDragging ? "1.5" : "1"}
              opacity={isDragging ? "0.8" : "0.4"}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-major)" />
        
        {/* Snap indicator */}
        {showSnapIndicator && snapPosition && (
          <g>
            {/* Snap point highlight */}
            <circle
              cx={snapPosition.x}
              cy={snapPosition.y}
              r="6"
              fill="rgb(59, 130, 246)"
              opacity="0.7"
              className="animate-pulse"
            />
            <circle
              cx={snapPosition.x}
              cy={snapPosition.y}
              r="3"
              fill="white"
              opacity="0.9"
            />
            
            {/* Alignment guides */}
            <line
              x1={snapPosition.x}
              y1="0"
              x2={snapPosition.x}
              y2="100%"
              stroke="rgb(59, 130, 246)"
              strokeWidth="1"
              opacity="0.3"
              strokeDasharray="4 4"
              className="animate-pulse"
            />
            <line
              x1="0"
              y1={snapPosition.y}
              x2="100%"
              y2={snapPosition.y}
              stroke="rgb(59, 130, 246)"
              strokeWidth="1"
              opacity="0.3"
              strokeDasharray="4 4"
              className="animate-pulse"
            />
          </g>
        )}
      </svg>
    </div>
  )
}