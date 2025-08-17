import React from 'react'

// Mock ResizablePanelGroup
export function ResizablePanelGroup({ children, ...props }) {
  return React.createElement('div', { 'data-testid': 'resizable-panel-group', ...props }, children)
}

// Mock ResizablePanel
export function ResizablePanel({ children, ...props }) {
  return React.createElement('div', { 'data-testid': 'resizable-panel', ...props }, children)
}

// Mock ResizableHandle
export function ResizableHandle(props) {
  return React.createElement('div', { 'data-testid': 'resizable-handle', ...props })
}

// Export default object with all components
export default {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle
}