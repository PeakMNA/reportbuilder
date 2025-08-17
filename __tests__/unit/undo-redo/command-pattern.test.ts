import { 
  AddComponentCommand, 
  UpdateComponentCommand, 
  DeleteComponentCommand,
  CommandHistory 
} from '@/lib/commands'

describe('Command Pattern Implementation', () => {
  let history: CommandHistory
  let mockComponent: any
  let mockExecuteFn: jest.Mock
  let mockUndoFn: jest.Mock

  beforeEach(() => {
    history = new CommandHistory()
    mockComponent = {
      id: 'test-1',
      type: 'text',
      name: 'Test Component',
      x: 100,
      y: 100,
      width: 200,
      height: 40,
      properties: { content: 'Test' }
    }
    mockExecuteFn = jest.fn()
    mockUndoFn = jest.fn()
  })

  describe('AddComponentCommand', () => {
    it('should execute add component command', () => {
      const command = new AddComponentCommand(
        mockComponent,
        mockExecuteFn,
        mockUndoFn
      )

      command.execute()
      expect(mockExecuteFn).toHaveBeenCalledWith(mockComponent)
    })

    it('should undo add component command', () => {
      const command = new AddComponentCommand(
        mockComponent,
        mockExecuteFn,
        mockUndoFn
      )

      command.execute()
      command.undo()
      expect(mockUndoFn).toHaveBeenCalledWith(mockComponent.id)
    })
  })

  describe('UpdateComponentCommand', () => {
    it('should execute update component command', () => {
      const oldData = { properties: { content: 'Old' } }
      const newData = { properties: { content: 'New' } }
      
      const command = new UpdateComponentCommand(
        'test-1',
        oldData,
        newData,
        mockExecuteFn
      )

      command.execute()
      expect(mockExecuteFn).toHaveBeenCalledWith('test-1', newData)
    })

    it('should undo update component command', () => {
      const oldData = { properties: { content: 'Old' } }
      const newData = { properties: { content: 'New' } }
      
      const command = new UpdateComponentCommand(
        'test-1',
        oldData,
        newData,
        mockExecuteFn
      )

      command.execute()
      command.undo()
      expect(mockExecuteFn).toHaveBeenCalledWith('test-1', oldData)
    })
  })

  describe('DeleteComponentCommand', () => {
    it('should execute delete component command', () => {
      const command = new DeleteComponentCommand(
        mockComponent,
        mockExecuteFn,
        mockUndoFn
      )

      command.execute()
      expect(mockExecuteFn).toHaveBeenCalledWith(mockComponent.id)
    })

    it('should undo delete component command', () => {
      const command = new DeleteComponentCommand(
        mockComponent,
        mockExecuteFn,
        mockUndoFn
      )

      command.execute()
      command.undo()
      expect(mockUndoFn).toHaveBeenCalledWith(mockComponent)
    })
  })

  describe('Command validation', () => {
    it('should validate command data before execution', () => {
      const invalidComponent = { ...mockComponent, id: null }
      
      expect(() => {
        new AddComponentCommand(invalidComponent, mockExecuteFn, mockUndoFn)
      }).toThrow('Component must have a valid ID')
    })

    it('should validate update data consistency', () => {
      const oldData = { properties: { content: 'Old' } }
      const newData = { properties: { content: 'Old' } } // Same as old
      
      expect(() => {
        new UpdateComponentCommand('test-1', oldData, newData, mockExecuteFn)
      }).toThrow('New data must be different from old data')
    })
  })

  describe('Command metadata', () => {
    it('should track command timestamp', () => {
      const command = new AddComponentCommand(
        mockComponent,
        mockExecuteFn,
        mockUndoFn
      )

      expect(command.timestamp).toBeInstanceOf(Date)
      expect(command.timestamp.getTime()).toBeLessThanOrEqual(Date.now())
    })

    it('should include command description', () => {
      const command = new AddComponentCommand(
        mockComponent,
        mockExecuteFn,
        mockUndoFn
      )

      expect(command.description).toBe('Add Text Component')
    })

    it('should track command type', () => {
      const addCommand = new AddComponentCommand(mockComponent, mockExecuteFn, mockUndoFn)
      const updateCommand = new UpdateComponentCommand('test-1', {}, {}, mockExecuteFn)
      const deleteCommand = new DeleteComponentCommand(mockComponent, mockExecuteFn, mockUndoFn)

      expect(addCommand.type).toBe('ADD_COMPONENT')
      expect(updateCommand.type).toBe('UPDATE_COMPONENT')
      expect(deleteCommand.type).toBe('DELETE_COMPONENT')
    })
  })
})