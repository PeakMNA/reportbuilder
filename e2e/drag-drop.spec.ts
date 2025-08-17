import { test, expect } from '@playwright/test'

/**
 * E2E Tests for Drag and Drop Functionality
 * 
 * These tests verify the complete drag-and-drop workflow in the ReportBuilder canvas,
 * including component placement, selection, movement, and resize operations.
 */

test.describe('Drag and Drop Canvas', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the designer page
    await page.goto('/designer')
    
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle')
    
    // Ensure the canvas is ready
    await expect(page.locator('[data-testid="design-canvas"]')).toBeVisible()
  })

  test.describe('Component Palette and Dragging', () => {
    test('should display component palette with draggable items', async ({ page }) => {
      // Check for component palette
      const palette = page.locator('[data-testid="component-palette"]')
      await expect(palette).toBeVisible()
      
      // Verify specific component types are available
      await expect(page.locator('[data-component-type="text"]')).toBeVisible()
      await expect(page.locator('[data-component-type="table"]')).toBeVisible()
      await expect(page.locator('[data-component-type="image"]')).toBeVisible()
    })

    test('should drag text component from palette to canvas', async ({ page }) => {
      const canvas = page.locator('[data-testid="design-canvas"]')
      const textComponent = page.locator('[data-component-type="text"]')
      
      // Get canvas bounds for positioning
      const canvasBounds = await canvas.boundingBox()
      expect(canvasBounds).toBeTruthy()
      
      // Drag text component to canvas center
      await textComponent.dragTo(canvas, {
        targetPosition: {
          x: canvasBounds!.width / 2,
          y: canvasBounds!.height / 2
        }
      })
      
      // Verify component was added to canvas
      await expect(page.locator('[data-component-id]').first()).toBeVisible()
      
      // Take screenshot for visual verification
      await page.screenshot({ 
        path: 'test-results/component-dropped-on-canvas.png',
        fullPage: true 
      })
    })

    test('should drag table component and verify proper placement', async ({ page }) => {
      const canvas = page.locator('[data-testid="design-canvas"]')
      const tableComponent = page.locator('[data-component-type="table"]')
      
      // Drag table component to specific position
      await tableComponent.dragTo(canvas, {
        targetPosition: { x: 200, y: 150 }
      })
      
      // Verify table component is present
      const droppedComponent = page.locator('[data-component-type="table"][data-component-id]')
      await expect(droppedComponent).toBeVisible()
      
      // Verify component has proper dimensions
      const componentBounds = await droppedComponent.boundingBox()
      expect(componentBounds?.width).toBeGreaterThan(0)
      expect(componentBounds?.height).toBeGreaterThan(0)
    })

    test('should snap components to grid when dropping', async ({ page }) => {
      const canvas = page.locator('[data-testid="design-canvas"]')
      const textComponent = page.locator('[data-component-type="text"]')
      
      // Drop component at non-grid-aligned position
      await textComponent.dragTo(canvas, {
        targetPosition: { x: 123, y: 157 } // Should snap to grid
      })
      
      const droppedComponent = page.locator('[data-component-id]').first()
      await expect(droppedComponent).toBeVisible()
      
      // Check that position has been snapped to grid
      // Grid size is 19px (5mm at 96 DPI)
      const position = await droppedComponent.evaluate(el => {
        const style = window.getComputedStyle(el)
        return {
          left: parseInt(style.left),
          top: parseInt(style.top)
        }
      })
      
      // Verify grid alignment (should be multiples of 19)
      expect(position.left % 19).toBe(0)
      expect(position.top % 19).toBe(0)
    })
  })

  test.describe('Component Selection and Manipulation', () => {
    test('should select component when clicked', async ({ page }) => {
      // First add a component
      const canvas = page.locator('[data-testid="design-canvas"]')
      const textComponent = page.locator('[data-component-type="text"]')
      
      await textComponent.dragTo(canvas, {
        targetPosition: { x: 200, y: 200 }
      })
      
      const droppedComponent = page.locator('[data-component-id]').first()
      await expect(droppedComponent).toBeVisible()
      
      // Click to select the component
      await droppedComponent.click()
      
      // Verify selection state (should show selection handles)
      await expect(droppedComponent).toHaveClass(/selected|ring-/)
      
      // Check for resize handles
      const resizeHandles = page.locator('[data-testid="resize-handle"]')
      await expect(resizeHandles.first()).toBeVisible()
      
      // Take screenshot showing selection
      await page.screenshot({ 
        path: 'test-results/component-selected-with-handles.png' 
      })
    })

    test('should deselect component when clicking canvas', async ({ page }) => {
      // Add and select a component first
      const canvas = page.locator('[data-testid="design-canvas"]')
      const textComponent = page.locator('[data-component-type="text"]')
      
      await textComponent.dragTo(canvas, {
        targetPosition: { x: 200, y: 200 }
      })
      
      const droppedComponent = page.locator('[data-component-id]').first()
      await droppedComponent.click()
      
      // Verify it's selected
      await expect(droppedComponent).toHaveClass(/selected|ring-/)
      
      // Click on empty canvas area
      await canvas.click({ position: { x: 400, y: 400 } })
      
      // Verify component is deselected
      await expect(droppedComponent).not.toHaveClass(/selected|ring-/)
      
      // Resize handles should be hidden
      const resizeHandles = page.locator('[data-testid="resize-handle"]')
      await expect(resizeHandles).not.toBeVisible()
    })

    test('should move component by dragging', async ({ page }) => {
      const canvas = page.locator('[data-testid="design-canvas"]')
      const textComponent = page.locator('[data-component-type="text"]')
      
      // Add component at initial position
      await textComponent.dragTo(canvas, {
        targetPosition: { x: 200, y: 200 }
      })
      
      const droppedComponent = page.locator('[data-component-id]').first()
      
      // Get initial position
      const initialBounds = await droppedComponent.boundingBox()
      expect(initialBounds).toBeTruthy()
      
      // Drag component to new position
      await droppedComponent.dragTo(canvas, {
        targetPosition: { x: 350, y: 300 }
      })
      
      // Get new position
      const newBounds = await droppedComponent.boundingBox()
      expect(newBounds).toBeTruthy()
      
      // Verify component moved
      expect(newBounds!.x).not.toBe(initialBounds!.x)
      expect(newBounds!.y).not.toBe(initialBounds!.y)
      
      // Take screenshot showing moved component
      await page.screenshot({ 
        path: 'test-results/component-moved-to-new-position.png' 
      })
    })
  })

  test.describe('Component Resizing', () => {
    test('should resize component using corner handles', async ({ page }) => {
      const canvas = page.locator('[data-testid="design-canvas"]')
      const textComponent = page.locator('[data-component-type="text"]')
      
      // Add and select component
      await textComponent.dragTo(canvas, {
        targetPosition: { x: 200, y: 200 }
      })
      
      const droppedComponent = page.locator('[data-component-id]').first()
      await droppedComponent.click()
      
      // Wait for resize handles to appear
      const bottomRightHandle = page.locator('[data-testid="resize-handle-se"]')
      await expect(bottomRightHandle).toBeVisible()
      
      // Get initial size
      const initialBounds = await droppedComponent.boundingBox()
      expect(initialBounds).toBeTruthy()
      
      // Drag resize handle to increase size
      await bottomRightHandle.dragTo(bottomRightHandle, {
        targetPosition: { x: 50, y: 30 } // Relative movement
      })
      
      // Get new size
      const newBounds = await droppedComponent.boundingBox()
      expect(newBounds).toBeTruthy()
      
      // Verify component was resized
      expect(newBounds!.width).toBeGreaterThan(initialBounds!.width)
      expect(newBounds!.height).toBeGreaterThan(initialBounds!.height)
      
      // Take screenshot showing resized component
      await page.screenshot({ 
        path: 'test-results/component-resized-larger.png' 
      })
    })

    test('should maintain aspect ratio when shift-resizing', async ({ page }) => {
      const canvas = page.locator('[data-testid="design-canvas"]')
      const imageComponent = page.locator('[data-component-type="image"]')
      
      // Add image component (which should maintain aspect ratio)
      await imageComponent.dragTo(canvas, {
        targetPosition: { x: 200, y: 200 }
      })
      
      const droppedComponent = page.locator('[data-component-id]').first()
      await droppedComponent.click()
      
      const bottomRightHandle = page.locator('[data-testid="resize-handle-se"]')
      await expect(bottomRightHandle).toBeVisible()
      
      // Get initial aspect ratio
      const initialBounds = await droppedComponent.boundingBox()
      const initialRatio = initialBounds!.width / initialBounds!.height
      
      // Resize while holding shift (should maintain aspect ratio)
      await page.keyboard.down('Shift')
      await bottomRightHandle.dragTo(bottomRightHandle, {
        targetPosition: { x: 60, y: 40 }
      })
      await page.keyboard.up('Shift')
      
      // Get new aspect ratio
      const newBounds = await droppedComponent.boundingBox()
      const newRatio = newBounds!.width / newBounds!.height
      
      // Verify aspect ratio is maintained (within tolerance)
      expect(Math.abs(newRatio - initialRatio)).toBeLessThan(0.1)
    })
  })

  test.describe('Multi-Component Operations', () => {
    test('should handle multiple components on canvas', async ({ page }) => {
      const canvas = page.locator('[data-testid="design-canvas"]')
      
      // Add multiple different components
      const textComponent = page.locator('[data-component-type="text"]')
      await textComponent.dragTo(canvas, {
        targetPosition: { x: 150, y: 100 }
      })
      
      const tableComponent = page.locator('[data-component-type="table"]')
      await tableComponent.dragTo(canvas, {
        targetPosition: { x: 300, y: 250 }
      })
      
      const imageComponent = page.locator('[data-component-type="image"]')
      await imageComponent.dragTo(canvas, {
        targetPosition: { x: 500, y: 150 }
      })
      
      // Verify all components are present
      const allComponents = page.locator('[data-component-id]')
      await expect(allComponents).toHaveCount(3)
      
      // Take screenshot showing multiple components
      await page.screenshot({ 
        path: 'test-results/multiple-components-on-canvas.png',
        fullPage: true 
      })
    })

    test('should select different components independently', async ({ page }) => {
      const canvas = page.locator('[data-testid="design-canvas"]')
      
      // Add two components
      const textComponent = page.locator('[data-component-type="text"]')
      await textComponent.dragTo(canvas, {
        targetPosition: { x: 200, y: 150 }
      })
      
      const tableComponent = page.locator('[data-component-type="table"]')
      await tableComponent.dragTo(canvas, {
        targetPosition: { x: 400, y: 250 }
      })
      
      const components = page.locator('[data-component-id]')
      const firstComponent = components.nth(0)
      const secondComponent = components.nth(1)
      
      // Select first component
      await firstComponent.click()
      await expect(firstComponent).toHaveClass(/selected|ring-/)
      await expect(secondComponent).not.toHaveClass(/selected|ring-/)
      
      // Select second component
      await secondComponent.click()
      await expect(secondComponent).toHaveClass(/selected|ring-/)
      await expect(firstComponent).not.toHaveClass(/selected|ring-/)
    })
  })

  test.describe('Canvas Interaction and UX', () => {
    test('should show visual feedback during drag operations', async ({ page }) => {
      const canvas = page.locator('[data-testid="design-canvas"]')
      const textComponent = page.locator('[data-component-type="text"]')
      
      // Start dragging
      await textComponent.hover()
      await page.mouse.down()
      
      // Move mouse over canvas
      await canvas.hover({ position: { x: 300, y: 200 } })
      
      // Should show drag preview or feedback
      // This might be a ghost image or cursor change
      const cursor = await page.evaluate(() => {
        return window.getComputedStyle(document.body).cursor
      })
      
      // Complete the drag
      await page.mouse.up()
      
      // Verify component was added
      await expect(page.locator('[data-component-id]')).toBeVisible()
    })

    test('should handle rapid drag operations smoothly', async ({ page }) => {
      const canvas = page.locator('[data-testid="design-canvas"]')
      const textComponent = page.locator('[data-component-type="text"]')
      
      // Perform multiple rapid drops
      for (let i = 0; i < 3; i++) {
        await textComponent.dragTo(canvas, {
          targetPosition: { x: 200 + (i * 100), y: 150 + (i * 80) }
        })
        
        // Small delay to allow processing
        await page.waitForTimeout(100)
      }
      
      // Verify all components were added
      const allComponents = page.locator('[data-component-id]')
      await expect(allComponents).toHaveCount(3)
      
      // Take screenshot showing rapid drop results
      await page.screenshot({ 
        path: 'test-results/rapid-component-drops.png' 
      })
    })

    test('should maintain component z-order when overlapping', async ({ page }) => {
      const canvas = page.locator('[data-testid="design-canvas"]')
      
      // Add two overlapping components
      const textComponent = page.locator('[data-component-type="text"]')
      await textComponent.dragTo(canvas, {
        targetPosition: { x: 200, y: 200 }
      })
      
      const tableComponent = page.locator('[data-component-type="table"]')
      await tableComponent.dragTo(canvas, {
        targetPosition: { x: 220, y: 220 } // Overlapping position
      })
      
      const components = page.locator('[data-component-id]')
      const firstComponent = components.nth(0)
      const secondComponent = components.nth(1)
      
      // Second component should be on top (higher z-index)
      const firstZIndex = await firstComponent.evaluate(el => {
        return window.getComputedStyle(el).zIndex
      })
      
      const secondZIndex = await secondComponent.evaluate(el => {
        return window.getComputedStyle(el).zIndex
      })
      
      expect(parseInt(secondZIndex)).toBeGreaterThan(parseInt(firstZIndex))
    })
  })

  test.describe('Performance and Reliability', () => {
    test('should handle canvas with many components efficiently', async ({ page }) => {
      const canvas = page.locator('[data-testid="design-canvas"]')
      const textComponent = page.locator('[data-component-type="text"]')
      
      // Add many components to test performance
      const componentCount = 20
      const startTime = Date.now()
      
      for (let i = 0; i < componentCount; i++) {
        const x = (i % 5) * 120 + 100
        const y = Math.floor(i / 5) * 80 + 100
        
        await textComponent.dragTo(canvas, {
          targetPosition: { x, y }
        })
      }
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      // Verify all components were added
      const allComponents = page.locator('[data-component-id]')
      await expect(allComponents).toHaveCount(componentCount)
      
      // Performance should be reasonable (less than 10 seconds for 20 components)
      expect(duration).toBeLessThan(10000)
      
      // Take screenshot showing many components
      await page.screenshot({ 
        path: 'test-results/many-components-performance-test.png',
        fullPage: true 
      })
    })

    test('should recover gracefully from drag operation interruptions', async ({ page }) => {
      const canvas = page.locator('[data-testid="design-canvas"]')
      const textComponent = page.locator('[data-component-type="text"]')
      
      // Start a drag operation
      await textComponent.hover()
      await page.mouse.down()
      
      // Simulate interruption (e.g., pressing Escape)
      await page.keyboard.press('Escape')
      
      // Canvas should still be functional
      await textComponent.dragTo(canvas, {
        targetPosition: { x: 200, y: 200 }
      })
      
      // Verify component was added successfully
      await expect(page.locator('[data-component-id]')).toBeVisible()
    })
  })
})