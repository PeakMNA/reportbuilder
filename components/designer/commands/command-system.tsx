'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

export interface Component {
  id: string
  type: string
  name: string
  x: number
  y: number
  width: number
  height: number
  properties: Record<string, string | number | boolean | string[] | null>
}

export interface Command {
  id: string
  type: string
  execute: () => void
  undo: () => void
  description: string
  timestamp: number
}

// Command implementations
export class AddComponentCommand implements Command {
  id: string
  type = 'add-component'
  description: string
  timestamp: number

  constructor(
    private component: Component,
    private onExecute: (component: Component) => void,
    private onUndo: (componentId: string) => void
  ) {
    this.id = `add-${component.id}-${Date.now()}`
    this.description = `Add ${component.type} component`
    this.timestamp = Date.now()
  }

  execute() {
    this.onExecute(this.component)
  }

  undo() {
    this.onUndo(this.component.id)
  }
}

export class DeleteComponentCommand implements Command {
  id: string
  type = 'delete-component'
  description: string
  timestamp: number

  constructor(
    private component: Component,
    private onExecute: (componentId: string) => void,
    private onUndo: (component: Component) => void
  ) {
    this.id = `delete-${component.id}-${Date.now()}`
    this.description = `Delete ${component.type} component`
    this.timestamp = Date.now()
  }

  execute() {
    this.onExecute(this.component.id)
  }

  undo() {
    this.onUndo(this.component)
  }
}

export class UpdateComponentCommand implements Command {
  id: string
  type = 'update-component'
  description: string
  timestamp: number

  constructor(
    private componentId: string,
    private oldData: Partial<Component>,
    private newData: Partial<Component>,
    private onUpdate: (id: string, data: Partial<Component>) => void
  ) {
    this.id = `update-${componentId}-${Date.now()}`
    this.description = `Update component properties`
    this.timestamp = Date.now()
  }

  execute() {
    this.onUpdate(this.componentId, this.newData)
  }

  undo() {
    this.onUpdate(this.componentId, this.oldData)
  }
}

export class MoveComponentCommand implements Command {
  id: string
  type = 'move-component'
  description: string
  timestamp: number

  constructor(
    private componentId: string,
    private oldPosition: { x: number; y: number },
    private newPosition: { x: number; y: number },
    private onUpdate: (id: string, data: Partial<Component>) => void
  ) {
    this.id = `move-${componentId}-${Date.now()}`
    this.description = `Move component`
    this.timestamp = Date.now()
  }

  execute() {
    this.onUpdate(this.componentId, { x: this.newPosition.x, y: this.newPosition.y })
  }

  undo() {
    this.onUpdate(this.componentId, { x: this.oldPosition.x, y: this.oldPosition.y })
  }
}

export class ResizeComponentCommand implements Command {
  id: string
  type = 'resize-component'
  description: string
  timestamp: number

  constructor(
    private componentId: string,
    private oldSize: { width: number; height: number },
    private newSize: { width: number; height: number },
    private onUpdate: (id: string, data: Partial<Component>) => void
  ) {
    this.id = `resize-${componentId}-${Date.now()}`
    this.description = `Resize component`
    this.timestamp = Date.now()
  }

  execute() {
    this.onUpdate(this.componentId, { width: this.newSize.width, height: this.newSize.height })
  }

  undo() {
    this.onUpdate(this.componentId, { width: this.oldSize.width, height: this.oldSize.height })
  }
}

export class BulkOperationCommand implements Command {
  id: string
  type = 'bulk-operation'
  description: string
  timestamp: number

  constructor(
    private commands: Command[],
    description?: string
  ) {
    this.id = `bulk-${Date.now()}`
    this.description = description || `Bulk operation (${commands.length} actions)`
    this.timestamp = Date.now()
  }

  execute() {
    this.commands.forEach(cmd => cmd.execute())
  }

  undo() {
    // Undo in reverse order
    for (let i = this.commands.length - 1; i >= 0; i--) {
      this.commands[i].undo()
    }
  }
}

export interface CommandSystemConfig {
  maxHistorySize?: number
  autoSaveInterval?: number
  enablePersistence?: boolean
  persistenceKey?: string
}

export interface CommandSystemHook {
  executeCommand: (command: Command) => void
  undo: () => boolean
  redo: () => boolean
  canUndo: boolean
  canRedo: boolean
  undoStack: Command[]
  redoStack: Command[]
  clearHistory: () => void
  getHistoryStats: () => { totalCommands: number; undoCount: number; redoCount: number }
}

const DEFAULT_CONFIG: Required<CommandSystemConfig> = {
  maxHistorySize: 50,
  autoSaveInterval: 30000, // 30 seconds
  enablePersistence: true,
  persistenceKey: 'reportbuilder_command_history'
}

export function useCommandSystem(config: CommandSystemConfig = {}): CommandSystemHook {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  
  const [undoStack, setUndoStack] = useState<Command[]>([])
  const [redoStack, setRedoStack] = useState<Command[]>([])
  const [isExecuting, setIsExecuting] = useState(false)
  
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null)

  // Load persisted history on mount
  useEffect(() => {
    if (finalConfig.enablePersistence) {
      try {
        const saved = localStorage.getItem(finalConfig.persistenceKey)
        if (saved) {
          const { undoStack: savedUndo } = JSON.parse(saved)
          if (Array.isArray(savedUndo)) {
            // Note: We can't restore the actual command functions from localStorage,
            // so this is mainly for statistics/history viewing
            setUndoStack(savedUndo.slice(0, finalConfig.maxHistorySize))
          }
        }
      } catch (error) {
        console.warn('Failed to load command history:', error)
      }
    }
  }, [finalConfig.enablePersistence, finalConfig.persistenceKey, finalConfig.maxHistorySize])

  // Auto-save history
  useEffect(() => {
    if (finalConfig.enablePersistence && finalConfig.autoSaveInterval > 0) {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current)
      }
      
      autoSaveTimer.current = setTimeout(() => {
        try {
          const historyData = {
            undoStack: undoStack.map(cmd => ({
              id: cmd.id,
              type: cmd.type,
              description: cmd.description,
              timestamp: cmd.timestamp
            }))
          }
          localStorage.setItem(finalConfig.persistenceKey, JSON.stringify(historyData))
        } catch (error) {
          console.warn('Failed to save command history:', error)
        }
      }, finalConfig.autoSaveInterval)
    }

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current)
      }
    }
  }, [undoStack, finalConfig.enablePersistence, finalConfig.autoSaveInterval, finalConfig.persistenceKey])

  const executeCommand = useCallback((command: Command) => {
    if (isExecuting) {
      console.warn('Command execution in progress, ignoring new command')
      return
    }

    setIsExecuting(true)
    
    try {
      // Execute the command
      command.execute()

      // Add to undo stack
      setUndoStack(prev => {
        const newStack = [...prev, command]
        // Maintain max history size
        if (newStack.length > finalConfig.maxHistorySize) {
          return newStack.slice(-finalConfig.maxHistorySize)
        }
        return newStack
      })

      // Clear redo stack when new command is executed
      setRedoStack([])
      
    } catch (error) {
      console.error('Command execution failed:', error)
    } finally {
      setIsExecuting(false)
    }
  }, [isExecuting, finalConfig.maxHistorySize])

  const undo = useCallback((): boolean => {
    if (undoStack.length === 0 || isExecuting) {
      return false
    }

    setIsExecuting(true)

    try {
      const command = undoStack[undoStack.length - 1]
      
      // Execute undo
      command.undo()

      // Move command from undo stack to redo stack
      setUndoStack(prev => prev.slice(0, -1))
      setRedoStack(prev => [...prev, command])

      return true
    } catch (error) {
      console.error('Undo failed:', error)
      return false
    } finally {
      setIsExecuting(false)
    }
  }, [undoStack, isExecuting])

  const redo = useCallback((): boolean => {
    if (redoStack.length === 0 || isExecuting) {
      return false
    }

    setIsExecuting(true)

    try {
      const command = redoStack[redoStack.length - 1]
      
      // Execute redo (same as execute)
      command.execute()

      // Move command from redo stack back to undo stack
      setRedoStack(prev => prev.slice(0, -1))
      setUndoStack(prev => [...prev, command])

      return true
    } catch (error) {
      console.error('Redo failed:', error)
      return false
    } finally {
      setIsExecuting(false)
    }
  }, [redoStack, isExecuting])

  const clearHistory = useCallback(() => {
    setUndoStack([])
    setRedoStack([])
    
    if (finalConfig.enablePersistence) {
      try {
        localStorage.removeItem(finalConfig.persistenceKey)
      } catch (error) {
        console.warn('Failed to clear persisted history:', error)
      }
    }
  }, [finalConfig.enablePersistence, finalConfig.persistenceKey])

  const getHistoryStats = useCallback(() => ({
    totalCommands: undoStack.length + redoStack.length,
    undoCount: undoStack.length,
    redoCount: redoStack.length
  }), [undoStack.length, redoStack.length])

  return {
    executeCommand,
    undo,
    redo,
    canUndo: undoStack.length > 0 && !isExecuting,
    canRedo: redoStack.length > 0 && !isExecuting,
    undoStack,
    redoStack,
    clearHistory,
    getHistoryStats
  }
}

// Keyboard shortcuts hook
export function useUndoRedoShortcuts(commandSystem: CommandSystemHook) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        if (event.key === 'z' && !event.shiftKey) {
          event.preventDefault()
          commandSystem.undo()
        } else if ((event.key === 'z' && event.shiftKey) || event.key === 'y') {
          event.preventDefault()
          commandSystem.redo()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [commandSystem])
}

// History viewer component
export function CommandHistoryViewer({ 
  commandSystem, 
  isOpen, 
  onClose 
}: { 
  commandSystem: CommandSystemHook
  isOpen: boolean
  onClose: () => void 
}) {
  const stats = commandSystem.getHistoryStats()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-96 max-h-96 overflow-hidden">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Command History</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ×
            </button>
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {stats.totalCommands} total commands • {stats.undoCount} can undo • {stats.redoCount} can redo
          </div>
        </div>
        
        <div className="max-h-64 overflow-y-auto">
          {commandSystem.undoStack.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No commands in history</div>
          ) : (
            <div className="p-2">
              {commandSystem.undoStack.map((command, index) => (
                <div key={command.id} className="flex items-center justify-between p-2 text-sm border-b last:border-b-0">
                  <div>
                    <div className="font-medium">{command.description}</div>
                    <div className="text-gray-500 text-xs">
                      {new Date(command.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">#{index + 1}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t">
          <button 
            onClick={commandSystem.clearHistory}
            className="w-full bg-red-100 text-red-700 py-2 px-4 rounded hover:bg-red-200 transition-colors"
          >
            Clear History
          </button>
        </div>
      </div>
    </div>
  )
}